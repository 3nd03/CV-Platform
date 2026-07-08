import streamlit as st
from services.claude_client import call_claude
from prompts.interview_prep_prompt import build_interview_prep_prompt
from database.db_client import save_interview_prep


def run_interview_prep() -> None:
    st.header("Interview Prep")

    profile = st.session_state.get("profile")
    if not profile:
        st.warning("Complete onboarding first before preparing for interviews.")
        return

    if not st.session_state.get("skill_gap_result"):
        st.info("Tip: run the Skill Gap Analysis first for questions targeted at your weaker areas.")

    if st.button("Generate questions"):
        with st.spinner("Preparing your questions..."):
            missing_skills = st.session_state.get("skill_gap_result", {}).get("MISSING_SKILLS", "")
            prompt = build_interview_prep_prompt(profile, missing_skills)
            result = call_claude(prompt)
            st.session_state.interview_prep_result = result
            try:
                save_interview_prep(st.session_state.session_id, result)
            except Exception:
                st.warning("Could not save to database, continuing without persistence")

    result = st.session_state.get("interview_prep_result")
    if result:
        st.divider()
        st.subheader("Your Questions")
        st.markdown(result)
