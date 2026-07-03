import streamlit as st
from chatbot import run_onboarding

st.set_page_config(page_title="CV Platform", layout="centered")
st.title("CV Platform")

run_onboarding()

if st.session_state.get("profile") and st.session_state.step >= 10:
    st.divider()
    st.subheader("Your Profile")
    for key, value in st.session_state.profile.items():
        st.markdown(f"**{key.replace('_', ' ').title()}:** {value}")
