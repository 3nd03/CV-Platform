import streamlit as st
from services.claude_client import call_claude
from prompts.cover_letter_prompt import build_cover_letter_prompt
from database.db_client import save_cover_letter
from utils.helpers import render_followup_chat


def run_cover_letter() -> None:
    st.header("Cover Letter Generator")

    profile = st.session_state.get("profile")
    if not profile:
        st.warning("Complete onboarding first before generating a cover letter.")
        return

    job_description = st.text_area(
        "Paste the job description here",
        height=250,
        key="cover_letter_jd",
    )

    if st.button("Generate cover letter"):
        if not job_description.strip():
            st.info("Paste a job description above before generating.")
        else:
            with st.spinner("Writing your cover letter..."):
                prompt = build_cover_letter_prompt(profile, job_description.strip())
                letter_text = call_claude(prompt)
                st.session_state.cover_letter_result = letter_text
                try:
                    save_cover_letter(st.session_state.profile_id, job_description.strip(), letter_text)
                except Exception:
                    st.warning("Could not save to database, continuing without persistence")

    result = st.session_state.get("cover_letter_result")
    if result:
        st.divider()
        st.subheader("Your Cover Letter")
        st.markdown(result)

        render_followup_chat("cover_letter", result, profile)
