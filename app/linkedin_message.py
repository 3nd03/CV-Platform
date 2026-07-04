import streamlit as st
from services.claude_client import call_claude
from prompts.linkedin_prompt import build_linkedin_prompt


def run_linkedin_message() -> None:
    st.header("LinkedIn Message Generator")

    profile = st.session_state.get("profile")
    if not profile:
        st.warning("Complete onboarding first before generating a message.")
        return

    context = st.text_area(
        "Who are you reaching out to? (optional, e.g. hiring manager at a specific company, alumnus in your target field)",
        height=150,
        key="linkedin_context",
    )

    if st.button("Generate message"):
        with st.spinner("Writing your message..."):
            prompt = build_linkedin_prompt(profile, context.strip())
            st.session_state.linkedin_result = call_claude(prompt)

    result = st.session_state.get("linkedin_result")
    if result:
        st.divider()
        st.subheader("Your Message")
        st.markdown(result)
