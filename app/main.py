import streamlit as st
from app.chatbot import run_onboarding
from app.dashboard import run_dashboard
from app.skill_gap import run_skill_gap
from app.cv_analyser import run_cv_analyser
from app.cover_letter import run_cover_letter
from app.job_roles import run_job_roles
from app.linkedin_message import run_linkedin_message
from utils.helpers import nav_button

st.set_page_config(page_title="CV Platform", layout="centered")
st.title("CV Platform")

if "page" not in st.session_state:
    st.session_state.page = "onboarding"

page = st.session_state.page

if page == "onboarding":
    run_onboarding()

    if st.session_state.get("profile") and st.session_state.get("step", 0) >= 10:
        st.divider()
        nav_button("Go to Dashboard", "dashboard")

elif page == "dashboard":
    run_dashboard()

elif page == "skill_gap":
    nav_button("Back to Dashboard", "dashboard")
    run_skill_gap()

elif page == "cv_analyser":
    nav_button("Back to Dashboard", "dashboard")
    run_cv_analyser()

elif page == "cover_letter":
    nav_button("Back to Dashboard", "dashboard")
    run_cover_letter()

elif page == "job_roles":
    nav_button("Back to Dashboard", "dashboard")
    run_job_roles()

elif page == "linkedin_message":
    nav_button("Back to Dashboard", "dashboard")
    run_linkedin_message()
