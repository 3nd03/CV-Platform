import streamlit as st
from streamlit_cookies_controller import CookieController
from app.auth import run_login, run_signup, run_logout, try_remember_login, flush_pending_remember
from app.chatbot import run_onboarding, QUESTIONS
from app.dashboard import run_dashboard
from app.profile import run_profile
from app.skill_gap import run_skill_gap
from app.cv_analyser import run_cv_analyser
from app.cover_letter import run_cover_letter
from app.job_roles import run_job_roles
from app.linkedin_message import run_linkedin_message
from app.interview_prep import run_interview_prep
from app.cv_download import run_cv_download
from app.career_roadmap import run_career_roadmap
from app.salary_insights import run_salary_insights
from utils.helpers import nav_button


st.set_page_config(page_title="Careerly", layout="centered")
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Inter:wght@400;500;600&display=swap');

.careerly-header {
    padding: 2rem 0 1.5rem 0;
    border-bottom: 1px solid #e5e5e0;
    margin-bottom: 2rem;
}
.careerly-header-compact {
    padding: 1rem 0;
    border-bottom: 1px solid #e5e5e0;
    margin-bottom: 1.5rem;
}
.careerly-logo {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem;
    font-weight: 700;
    color: #1a2b4a;
    margin: 0;
}
.careerly-logo span {
    color: #c8963e;
    font-style: italic;
}
.careerly-eyebrow {
    font-family: 'Inter', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    color: #6b7c6b;
    text-transform: uppercase;
    margin: 1.2rem 0 0.5rem 0;
}
.careerly-eyebrow::before {
    content: "●";
    color: #c8963e;
    margin-right: 0.5rem;
}
.careerly-headline {
    font-family: 'Playfair Display', serif;
    font-size: 2.6rem;
    font-weight: 700;
    color: #1a2b4a;
    line-height: 1.15;
    margin: 0 0 0.8rem 0;
}
.careerly-headline em {
    color: #c8963e;
    font-style: italic;
}
.careerly-subtext {
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    color: #5a6570;
    max-width: 480px;
    line-height: 1.5;
}
</style>
""", unsafe_allow_html=True)

cookies = CookieController()

if "user" not in st.session_state:
    try_remember_login(cookies)

flush_pending_remember(cookies)

if "page" not in st.session_state:
    st.session_state.page = "login"

if not st.session_state.get("user") and st.session_state.page not in ("login", "signup"):
    st.session_state.page = "login"

page = st.session_state.page

if page in ("login", "signup"):
    st.markdown("""
    <div class="careerly-header">
        <p class="careerly-logo">Career<span>ly</span></p>
        <p class="careerly-eyebrow">Job search, without the guesswork</p>
        <p class="careerly-headline">Turn your CV into <em>your next role</em>.</p>
        <p class="careerly-subtext">Careerly reads your CV and the job you want, then tells you exactly what's missing and how to close the gap.</p>
    </div>
    """, unsafe_allow_html=True)
else:
    st.markdown("""
    <div class="careerly-header-compact">
        <p class="careerly-logo">Career<span>ly</span></p>
    </div>
    """, unsafe_allow_html=True)
    if st.button("Log out"):
        run_logout(cookies)

if page == "login":
    run_login()

elif page == "signup":
    run_signup()

elif page == "onboarding":
    run_onboarding()

    if st.session_state.get("profile") and st.session_state.get("step", 0) >= len(QUESTIONS):
        st.divider()
        nav_button("Go to Dashboard", "dashboard")

elif page == "dashboard":
    run_dashboard()

elif page == "profile":
    nav_button("Back to Dashboard", "dashboard")
    run_profile()

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

elif page == "interview_prep":
    nav_button("Back to Dashboard", "dashboard")
    run_interview_prep()

elif page == "cv_download":
    nav_button("Back to Dashboard", "dashboard")
    run_cv_download()

elif page == "career_roadmap":
    nav_button("Back to Dashboard", "dashboard")
    run_career_roadmap()

elif page == "salary_insights":
    nav_button("Back to Dashboard", "dashboard")
    run_salary_insights()
