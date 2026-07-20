import json
import re
import streamlit as st
from utils.helpers import render_profile_summary
from utils.pdf import extract_pdf_text
from services.claude_client import call_claude
from prompts.profile_extraction_prompt import build_profile_extraction_prompt
from database.db_client import create_profile, save_cv_upload, set_profile_cv
from services.s3_client import upload_cv

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
    ("access_needs", "Do you have any disabilities or access needs we should be aware of?"),
]

OPTIONAL_KEYS = {"access_needs"}
QUESTIONS_MAP = dict(QUESTIONS)
CV_EXTRACTABLE_KEYS = [key for key, _ in QUESTIONS[:6]]


def _save_answer(key: str, answer: str) -> None:
    st.session_state.profile[key] = answer
    st.session_state.step += 1


def _parse_extracted(raw: str) -> dict:
    cleaned = re.sub(r"^```(json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {}


def _run_cv_prefill() -> None:
    stage = st.session_state.prefill_stage

    if stage == "start":
        st.subheader("Speed things up")
        st.write("Upload your CV and we'll pre-fill what we can, so you only answer what's left.")
        uploaded = st.file_uploader("Upload your CV (PDF)", type="pdf", key="prefill_cv_upload")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("Extract from CV"):
                if not uploaded:
                    st.info("Upload a CV above first, or skip this step.")
                else:
                    with st.spinner("Reading your CV..."):
                        cv_text = extract_pdf_text(uploaded).strip()
                        prompt = build_profile_extraction_prompt(cv_text)
                        raw = call_claude(prompt)
                        st.session_state.prefill_extracted = _parse_extracted(raw)
                        st.session_state.prefill_cv_bytes = uploaded.getvalue()
                        st.session_state.prefill_cv_filename = uploaded.name
                    st.session_state.prefill_stage = "review"
                    st.rerun()
        with col2:
            if st.button("Skip, I'll type everything"):
                st.session_state.prefill_stage = "done"
                st.rerun()
        return

    if stage == "review":
        st.subheader("Check what we found")
        st.write("Fix anything that's wrong or missing, then continue.")
        extracted = st.session_state.get("prefill_extracted", {})
        with st.form("prefill_review_form"):
            edited = {
                key: st.text_area(QUESTIONS_MAP[key], value=extracted.get(key, ""))
                for key in CV_EXTRACTABLE_KEYS
            }
            confirmed = st.form_submit_button("Confirm and continue")
        if confirmed:
            for key, value in edited.items():
                if value.strip():
                    st.session_state.profile[key] = value.strip()
            st.session_state.prefill_stage = "done"
            st.rerun()


def run_onboarding() -> None:
    if "step" not in st.session_state:
        st.session_state.step = 0
    if "profile" not in st.session_state:
        st.session_state.profile = {}
    if "prefill_stage" not in st.session_state:
        st.session_state.prefill_stage = "start"

    if st.session_state.prefill_stage != "done":
        _run_cv_prefill()
        return

    while (
        st.session_state.step < len(QUESTIONS)
        and QUESTIONS[st.session_state.step][0] in st.session_state.profile
    ):
        st.session_state.step += 1

    step = st.session_state.step

    if step >= len(QUESTIONS):
        if not st.session_state.get("profile_saved"):
            try:
                label = st.session_state.profile.get("target_role") or "My profile"
                profile_id = create_profile(st.session_state.user["id"], label, st.session_state.profile)
                st.session_state.profile_id = profile_id
                st.session_state.profile_saved = True
            except Exception:
                st.warning("Could not save to database, continuing without persistence")

        # Kept outside the "profile_saved" guard and gated by its own flag so a
        # Streamlit rerun landing mid-sequence (e.g. from the cookie component
        # resolving async) retries this on the next run instead of leaving the
        # CV uploaded but never linked to the profile.
        if (
            st.session_state.get("profile_id")
            and st.session_state.get("prefill_cv_bytes")
            and not st.session_state.get("cv_storage_done")
        ):
            try:
                s3_key = upload_cv(
                    st.session_state.prefill_cv_bytes,
                    st.session_state.profile_id,
                    st.session_state.prefill_cv_filename,
                )
                save_cv_upload(st.session_state.profile_id, s3_key)
                set_profile_cv(st.session_state.profile_id, s3_key)
                st.session_state.cv_storage_done = True
                st.session_state.pop("prefill_cv_bytes", None)
                st.session_state.pop("prefill_cv_filename", None)
            except Exception:
                st.warning("Could not store your CV, continuing without it")
        st.success("Profile complete. Your answers have been saved.")
        render_profile_summary(st.session_state.profile)
        return

    key, question = QUESTIONS[step]
    optional = key in OPTIONAL_KEYS
    st.subheader(f"Question {step + 1} of {len(QUESTIONS)}")
    st.write(question + (" (optional, you can skip this or answer \"no\")" if optional else ""))

    with st.form(key=f"form_{step}"):
        answer = st.text_area("Your answer", key=f"input_{step}")
        col1, col2 = st.columns([1, 1]) if optional else (st.container(), None)
        with col1:
            submitted = st.form_submit_button("Next")
        skipped = False
        if optional:
            with col2:
                skipped = st.form_submit_button("Skip")

    if submitted or skipped:
        if skipped:
            _save_answer(key, "")
            st.rerun()
        elif not answer.strip() and not optional:
            st.warning("Please enter an answer before continuing.")
        else:
            _save_answer(key, answer.strip())
            st.rerun()
