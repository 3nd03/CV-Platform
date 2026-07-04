import streamlit as st
from services.claude_client import call_claude
from prompts.cover_letter_prompt import build_cover_letter_prompt


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
                st.session_state.cover_letter_result = call_claude(prompt)

    result = st.session_state.get("cover_letter_result")
    if result:
        st.divider()
        st.subheader("Your Cover Letter")
        st.markdown(result)
