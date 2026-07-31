import streamlit as st
from services.claude_client import call_claude
from prompts.cv_download_prompt import build_cv_download_prompt
from database.db_client import save_cv_download
from utils.helpers import render_followup_chat
from utils.pdf import extract_pdf_text, generate_pdf


def run_cv_download() -> None:
    st.header("CV Download")

    profile = st.session_state.get("profile")
    if not profile:
        st.warning("Complete onboarding first before formatting your CV.")
        return

    uploaded_file = st.file_uploader("Upload your CV (PDF)", type="pdf", key="cv_download_upload")
    pasted_text = st.text_area("Or paste your CV text here", height=250, key="cv_download_paste")

    if st.button("Rewrite CV"):
        if uploaded_file:
            cv_text = extract_pdf_text(uploaded_file).strip()
        else:
            cv_text = pasted_text.strip()

        if not cv_text:
            st.info("Upload a CV or paste your CV text above before rewriting.")
        else:
            with st.spinner("Rewriting your CV..."):
                prompt = build_cv_download_prompt(cv_text)
                result = call_claude(prompt)
                st.session_state.cv_download_result = result
                try:
                    save_cv_download(st.session_state.profile_id, result)
                except Exception:
                    st.warning("Could not save to database, continuing without persistence")

    result = st.session_state.get("cv_download_result")
    if result:
        st.divider()
        st.subheader("Your Formatted CV")
        st.text(result)

        pdf_bytes = generate_pdf(result)
        st.download_button(
            "Download as PDF",
            data=pdf_bytes,
            file_name="cv.pdf",
            mime="application/pdf",
        )

        render_followup_chat("cv_download", result, profile)
