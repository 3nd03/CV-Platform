import streamlit as st

from services.claude_client import call_claude

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
    "access_needs": "Access needs",
}


def render_profile_summary(profile: dict) -> None:
    for key, label in PROFILE_LABELS.items():
        value = profile.get(key, "")
        if value:
            st.markdown(f"**{label}:** {value}")


def nav_button(label: str, target: str) -> None:
    if st.button(label):
        for key in list(st.session_state.keys()):
            if key.endswith("_chat_history"):
                del st.session_state[key]
        st.session_state.page = target
        st.rerun()


def render_followup_chat(tool_key: str, result, profile: dict) -> None:
    history_key = f"{tool_key}_chat_history"
    if history_key not in st.session_state:
        st.session_state[history_key] = []

    st.divider()
    st.subheader("Ask a follow-up question")

    for question, answer in st.session_state[history_key]:
        with st.chat_message("user"):
            st.markdown(question)
        with st.chat_message("assistant"):
            st.markdown(answer)

    question = st.chat_input("Ask about this result...", key=f"{tool_key}_followup_input")
    if question:
        prompt = (
            f"Here is the user's result from this tool: {result}\n\n"
            f"Here is their profile: {profile}\n\n"
            f"Answer this follow-up question: {question}"
        )
        with st.spinner("Thinking..."):
            answer = call_claude(prompt)
        st.session_state[history_key].append((question, answer))
        st.rerun()
