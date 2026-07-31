import streamlit as st
from services.claude_client import call_claude
from prompts.salary_insights_prompt import build_salary_insights_prompt
from database.db_client import save_salary_insights
from utils.helpers import render_followup_chat


def _parse_response(text: str) -> dict:
    labels = ["RANGE_JUNIOR", "RANGE_MID", "RANGE_SENIOR", "FACTORS", "NEGOTIATION_TIPS"]
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


def run_salary_insights() -> None:
    st.header("Salary Insights")

    profile = st.session_state.get("profile")
    if not profile:
        st.warning("Complete onboarding first before checking salary insights.")
        return

    if st.button("Get salary insights"):
        with st.spinner("Researching salary data..."):
            prompt = build_salary_insights_prompt(profile)
            response = call_claude(prompt)
            result = _parse_response(response)
            st.session_state.salary_insights_result = result
            try:
                save_salary_insights(st.session_state.profile_id, result)
            except Exception:
                st.warning("Could not save to database, continuing without persistence")

    result = st.session_state.get("salary_insights_result")
    if not result:
        return

    st.subheader("Junior Level")
    st.markdown(result.get("RANGE_JUNIOR", "No data returned."))

    st.subheader("Mid Level")
    st.markdown(result.get("RANGE_MID", "No data returned."))

    st.subheader("Senior Level")
    st.markdown(result.get("RANGE_SENIOR", "No data returned."))

    st.subheader("Factors Affecting Salary")
    st.markdown(result.get("FACTORS", "No data returned."))

    st.subheader("Negotiation Tips")
    st.markdown(result.get("NEGOTIATION_TIPS", "No data returned."))

    render_followup_chat("salary_insights", result, profile)
