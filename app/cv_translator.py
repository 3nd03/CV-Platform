import streamlit as st
from services.claude_client import call_claude
from prompts.cv_translator_prompt import build_cv_translator_prompt
from database.db_client import save_cv_translation
from utils.helpers import render_followup_chat
from utils.pdf import extract_pdf_text, generate_pdf

TARGET_LANGUAGES = ["Spanish", "French", "German", "Portuguese", "Italian", "Mandarin", "Arabic"]


def run_cv_translator() -> None:
    st.header("CV Language Translator")

    profile = st.session_state.get("profile")
    if not profile:
        st.warning("Complete onboarding first before translating your CV.")
        return

    uploaded_file = st.file_uploader("Upload your CV (PDF)", type="pdf", key="cv_translator_upload")
    pasted_text = st.text_area("Or paste your CV text here", height=250, key="cv_translator_paste")
    target_language = st.selectbox("Translate to", TARGET_LANGUAGES)

    if st.button("Translate CV"):
        if uploaded_file:
            cv_text = extract_pdf_text(uploaded_file).strip()
        else:
            cv_text = pasted_text.strip()

        if not cv_text:
            st.info("Upload a CV or paste your CV text above before translating.")
        else:
            with st.spinner(f"Translating your CV into {target_language}..."):
                prompt = build_cv_translator_prompt(cv_text, target_language)
                result = call_claude(prompt)
                st.session_state.cv_translator_result = result
                st.session_state.cv_translator_language = target_language
                try:
                    save_cv_translation(st.session_state.profile_id, target_language, result)
                except Exception:
                    st.warning("Could not save to database, continuing without persistence")

    result = st.session_state.get("cv_translator_result")
    if result:
        language = st.session_state.get("cv_translator_language", "")
        st.divider()
        st.subheader(f"Translated CV ({language})")
        st.text(result)

        pdf_bytes = generate_pdf(result, language=language)
        st.download_button(
            "Download translated CV as PDF",
            data=pdf_bytes,
            file_name="cv_translated.pdf",
            mime="application/pdf",
        )

        render_followup_chat("cv_translator", result, profile)
