import streamlit as st
from PyPDF2 import PdfReader
from services.claude_client import call_claude
from prompts.cv_prompt import build_cv_prompt


def _extract_text(pdf_file) -> str:
    reader = PdfReader(pdf_file)
    return "\n".join(page.extract_text() or "" for page in reader.pages)


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
                cv_text = _extract_text(uploaded_file).strip()
                prompt = build_cv_prompt(profile, cv_text)
                st.session_state.cv_result = call_claude(prompt)

    result = st.session_state.get("cv_result")
    if result:
        st.divider()
        st.subheader("CV Analysis")
        st.markdown(result)
