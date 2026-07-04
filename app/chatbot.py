import streamlit as st

QUESTIONS = [
    ("target_role", "What role are you targeting?"),
    ("current_skills", "What are your main technical and professional skills?"),
    ("background", "What is your educational or professional background?"),
    ("experience", "How many years of relevant experience do you have?"),
    ("tools", "What tools, languages, or platforms do you use regularly?"),
    ("location", "Where are you based, and are you open to relocation or remote work?"),
    ("salary", "What is your target salary range?"),
    ("open_to_learning", "Are there areas you are actively trying to develop or learn?"),
    ("timeline", "What is your job search timeline?"),
    ("self_gaps", "What do you feel are your biggest gaps for the role you are targeting?"),
]


def _save_answer(key: str, answer: str) -> None:
    st.session_state.profile[key] = answer
    st.session_state.step += 1


def run_onboarding() -> None:
    if "step" not in st.session_state:
        st.session_state.step = 0
    if "profile" not in st.session_state:
        st.session_state.profile = {}

    step = st.session_state.step

    if step >= len(QUESTIONS):
        st.success("Profile complete. Your answers have been saved.")
        labels = {
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
        for key, label in labels.items():
            value = st.session_state.profile.get(key, "")
            if value:
                st.markdown(f"**{label}:** {value}")
        return

    key, question = QUESTIONS[step]
    st.subheader(f"Question {step + 1} of {len(QUESTIONS)}")
    st.write(question)

    with st.form(key=f"form_{step}"):
        answer = st.text_area("Your answer", key=f"input_{step}")
        submitted = st.form_submit_button("Next")

    if submitted:
        if not answer.strip():
            st.warning("Please enter an answer before continuing.")
        else:
            _save_answer(key, answer.strip())
            st.rerun()


if __name__ == "__main__":
    st.title("CV Platform — Onboarding")
    run_onboarding()
