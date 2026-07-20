import streamlit as st
from services.claude_client import call_claude
from prompts.cv_prompt import build_cv_prompt
from services.s3_client import upload_cv
from database.db_client import save_cv_upload, save_cv_analysis
from utils.helpers import render_followup_chat
from utils.pdf import extract_pdf_text


def run_cv_analyser() -> None:
    st.header("CV Analyser")

    profile = st.session_state.get("profile")
    if not profile:
        st.warning("Complete onboarding first before analysing your CV.")
        return

    uploaded_file = st.file_uploader("Upload your CV (PDF)", type="pdf", key="cv_file_upload")

    if st.button("Analyse CV"):
        if not uploaded_file:
            st.info("Upload your CV above before running the analysis.")
        else:
            with st.spinner("Analysing your CV..."):
                cv_text = extract_pdf_text(uploaded_file).strip()
                prompt = build_cv_prompt(profile, cv_text)
                st.session_state.cv_result = call_claude(prompt)
                st.session_state.cv_result_saved = False
                st.session_state.cv_upload_bytes = uploaded_file.getvalue()
                st.session_state.cv_upload_filename = uploaded_file.name

    # Kept outside the button block and gated by its own flag so a Streamlit
    # rerun landing mid-sequence retries this on the next run instead of
    # leaving the CV uploaded but the analysis never linked to the profile.
    if st.session_state.get("cv_result") and not st.session_state.get("cv_result_saved"):
        try:
            profile_id = st.session_state.profile_id
            s3_key = upload_cv(
                st.session_state.cv_upload_bytes,
                profile_id,
                st.session_state.cv_upload_filename,
            )
            save_cv_upload(profile_id, s3_key)
            save_cv_analysis(profile_id, st.session_state.cv_result)
            st.session_state.cv_result_saved = True
        except Exception:
            st.warning("Could not save to database, continuing without persistence")

    result = st.session_state.get("cv_result")
    if result:
        st.divider()
        st.subheader("CV Analysis")
        st.markdown(result)

        render_followup_chat("cv_analyser", result, profile)
