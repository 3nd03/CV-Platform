import streamlit as st
from services.claude_client import call_claude
from prompts.job_roles_prompt import build_job_roles_prompt
from database.db_client import save_job_roles
from utils.helpers import render_followup_chat


def _parse_response(text: str) -> dict:
    labels = ["CURRENT_ROLES", "FUTURE_ROLES"]
    sections = {}
    for i, label in enumerate(labels):
        start = text.find(f"{label}:")
        if start == -1:
            sections[label] = ""
            continue
        start += len(f"{label}:")
        end = len(text)
        for next_label in labels[i + 1:]:
            pos = text.find(f"{next_label}:")
            if pos != -1 and pos < end:
                end = pos
        sections[label] = text[start:end].strip()
    return sections


def run_job_roles() -> None:
    st.header("Job Role Suggestions")

    profile = st.session_state.get("profile")
    if not profile:
        st.warning("Complete onboarding first before getting role suggestions.")
        return

    if st.button("Suggest roles"):
        with st.spinner("Matching roles to your profile..."):
            missing_skills = st.session_state.get("skill_gap_result", {}).get("MISSING_SKILLS", "")
            prompt = build_job_roles_prompt(profile, missing_skills)
            response = call_claude(prompt)
            result = _parse_response(response)
            st.session_state.job_roles_result = result
            try:
                save_job_roles(st.session_state.profile_id, result)
            except Exception:
                st.warning("Could not save to database, continuing without persistence")

    result = st.session_state.get("job_roles_result")
    if not result:
        return

    st.subheader("Target Now")
    st.markdown(result.get("CURRENT_ROLES", "No data returned."))

    st.subheader("Target in Six Months")
    st.markdown(result.get("FUTURE_ROLES", "No data returned."))

    render_followup_chat("job_roles", result, profile)
