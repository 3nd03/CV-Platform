import streamlit as st
from services.claude_client import call_claude
from prompts.cv_prompt import build_cv_prompt


def run_cv_analyser() -> None:
    st.header("CV Analyser")

    profile = st.session_state.get("profile")
    if not profile:
        st.warning("Complete onboarding first before analysing your CV.")
        return

    cv_text = st.text_area(
        "Paste your CV here",
        height=300,
        key="cv_text_input",
    )

    if st.button("Analyse CV"):
        if not cv_text.strip():
            st.info("Paste your CV above before running the analysis.")
        else:
            with st.spinner("Analysing your CV..."):
                prompt = build_cv_prompt(profile, cv_text.strip())
                st.session_state.cv_result = call_claude(prompt)

    result = st.session_state.get("cv_result")
    if result:
        st.divider()
        st.subheader("CV Analysis")
        st.markdown(result)
