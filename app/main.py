import streamlit as st
from app.chatbot import run_onboarding
from app.skill_gap import run_skill_gap
from app.cv_analyser import run_cv_analyser
from app.cover_letter import run_cover_letter

st.set_page_config(page_title="CV Platform", layout="centered")
st.title("CV Platform")

if "page" not in st.session_state:
    st.session_state.page = "onboarding"


def _nav_button(label: str, target: str) -> None:
    if st.button(label):
        st.session_state.page = target
        st.rerun()


page = st.session_state.page

if page == "onboarding":
    run_onboarding()

    if st.session_state.get("profile") and st.session_state.get("step", 0) >= 10:
        st.divider()
        col1, col2, col3 = st.columns(3)
        with col1:
            _nav_button("Skill Gap Analysis", "skill_gap")
        with col2:
            _nav_button("CV Analyser", "cv_analyser")
        with col3:
            _nav_button("Cover Letter", "cover_letter")

elif page == "skill_gap":
    _nav_button("Back to profile", "onboarding")
    run_skill_gap()

elif page == "cv_analyser":
    _nav_button("Back to profile", "onboarding")
    run_cv_analyser()

elif page == "cover_letter":
    _nav_button("Back to profile", "onboarding")
    run_cover_letter()
