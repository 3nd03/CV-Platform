import streamlit as st
from services.claude_client import call_claude
from prompts.skill_gap_prompt import build_skill_gap_prompt


def _parse_response(text: str) -> dict:
    labels = ["MATCH_SCORE", "STRONG_SKILLS", "MISSING_SKILLS", "NEXT_STEPS"]
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


def run_skill_gap() -> None:
    st.header("Skill Gap Analysis")

    profile = st.session_state.get("profile")
    if not profile:
        st.warning("Complete onboarding first before running the skill gap analysis.")
        return

    if st.button("Run analysis"):
        with st.spinner("Analysing your profile..."):
            prompt = build_skill_gap_prompt(profile)
            response = call_claude(prompt)
            st.session_state.skill_gap_result = _parse_response(response)

    result = st.session_state.get("skill_gap_result")
    if not result:
        return

    st.subheader("Match Score")
    st.metric(label="Role fit", value=result.get("MATCH_SCORE", "N/A"))

    st.subheader("Strong Skills")
    st.markdown(result.get("STRONG_SKILLS", "No data returned."))

    st.subheader("Missing Skills")
    st.markdown(result.get("MISSING_SKILLS", "No data returned."))

    st.subheader("Next Steps")
    st.markdown(result.get("NEXT_STEPS", "No data returned."))
