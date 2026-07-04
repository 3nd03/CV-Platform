import streamlit as st
from app.chatbot import run_onboarding
from app.skill_gap import run_skill_gap

st.set_page_config(page_title="CV Platform", layout="centered")
st.title("CV Platform")

if "page" not in st.session_state:
    st.session_state.page = "onboarding"

if st.session_state.page == "onboarding":
    run_onboarding()

    if st.session_state.get("profile") and st.session_state.get("step", 0) >= 10:
        st.divider()
        if st.button("Run Skill Gap Analysis"):
            st.session_state.page = "skill_gap"
            st.rerun()

elif st.session_state.page == "skill_gap":
    if st.button("Back to profile"):
        st.session_state.page = "onboarding"
        st.rerun()
    run_skill_gap()
