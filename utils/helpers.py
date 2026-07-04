import streamlit as st

PROFILE_LABELS = {
    "target_role": "Target role",
    "current_skills": "Current skills",
    "background": "Background",
    "experience": "Experience",
    "tools": "Tools and platforms",
    "location": "Location",
    "salary": "Salary expectations",
    "open_to_learning": "Open to learning",
    "timeline": "Timeline",
    "self_gaps": "Self-identified gaps",
}


def render_profile_summary(profile: dict) -> None:
    for key, label in PROFILE_LABELS.items():
        value = profile.get(key, "")
        if value:
            st.markdown(f"**{label}:** {value}")


def nav_button(label: str, target: str) -> None:
    if st.button(label):
        st.session_state.page = target
        st.rerun()
