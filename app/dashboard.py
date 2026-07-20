import streamlit as st
from utils.helpers import render_profile_summary, nav_button, render_followup_chat
from database.db_client import get_latest

TOOLS = [
    ("Skill Gap Analysis", "skill_gap"),
    ("CV Analyser", "cv_analyser"),
    ("Cover Letter", "cover_letter"),
    ("Job Role Suggestions", "job_roles"),
    ("LinkedIn Message", "linkedin_message"),
    ("Interview Prep", "interview_prep"),
]


def run_dashboard() -> None:
    st.header("Dashboard")

    profile = st.session_state.get("profile")
    if not profile:
        st.warning("Complete onboarding first to see your dashboard.")
        return

    st.subheader("Profile Summary")
    render_profile_summary(profile)
    nav_button("Edit profile", "profile")

    if "skill_gap_result" not in st.session_state:
        try:
            latest = get_latest("skill_gap", st.session_state.profile_id)
            if latest:
                st.session_state.skill_gap_result = latest["result"]
        except Exception:
            pass

    match_score = st.session_state.get("skill_gap_result", {}).get("MATCH_SCORE")
    st.subheader("Skill Gap Score")
    if match_score:
        st.metric(label="Role fit", value=match_score)
    else:
        st.info("Run the Skill Gap Analysis to see your match score here.")

    st.subheader("Tools")
    cols = st.columns(3)
    for i, (label, target) in enumerate(TOOLS):
        with cols[i % 3]:
            nav_button(label, target)

    dashboard_result = {
        "profile_summary": profile,
        "skill_gap_result": st.session_state.get("skill_gap_result"),
    }
    render_followup_chat("dashboard", dashboard_result, profile)
