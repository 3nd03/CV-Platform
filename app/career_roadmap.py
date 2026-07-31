import streamlit as st
from services.claude_client import call_claude
from prompts.career_roadmap_prompt import build_career_roadmap_prompt
from database.db_client import save_career_roadmap
from utils.helpers import render_followup_chat


def _parse_response(text: str) -> dict:
    labels = ["WHERE_NOW", "THREE_MONTH", "SIX_MONTH", "ONE_YEAR"]
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


def run_career_roadmap() -> None:
    st.header("Career Roadmap")

    profile = st.session_state.get("profile")
    if not profile:
        st.warning("Complete onboarding first before building your roadmap.")
        return

    if not st.session_state.get("skill_gap_result"):
        st.info("Tip: run the Skill Gap Analysis first for a roadmap tailored to your specific gaps.")

    if st.button("Build roadmap"):
        with st.spinner("Building your roadmap..."):
            skill_gap_result = st.session_state.get("skill_gap_result")
            prompt = build_career_roadmap_prompt(profile, skill_gap_result)
            response = call_claude(prompt)
            result = _parse_response(response)
            st.session_state.career_roadmap_result = result
            try:
                save_career_roadmap(st.session_state.profile_id, result)
            except Exception:
                st.warning("Could not save to database, continuing without persistence")

    result = st.session_state.get("career_roadmap_result")
    if not result:
        return

    st.subheader("Where You Are Now")
    st.markdown(result.get("WHERE_NOW", "No data returned."))

    st.subheader("3-Month Milestones")
    st.markdown(result.get("THREE_MONTH", "No data returned."))

    st.subheader("6-Month Milestones")
    st.markdown(result.get("SIX_MONTH", "No data returned."))

    st.subheader("1-Year Target")
    st.markdown(result.get("ONE_YEAR", "No data returned."))

    render_followup_chat("career_roadmap", result, profile)
