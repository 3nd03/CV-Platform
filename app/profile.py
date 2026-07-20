import streamlit as st
from database.db_client import (
    get_profiles_for_user,
    set_active_profile,
    update_profile,
    update_profile_label,
    get_history,
    get_user_by_id,
    update_user,
)
from services.s3_client import upload_avatar, get_avatar_url
from services.auth_service import hash_password, verify_password
from utils.helpers import PROFILE_LABELS

TRANSIENT_RESULT_KEYS = [
    "skill_gap_result",
    "cv_result",
    "cover_letter_result",
    "job_roles_result",
    "linkedin_result",
    "interview_prep_result",
]

HISTORY_TOOLS = [
    ("Skill Gap Analysis", "skill_gap"),
    ("CV Analyser", "cv_analysis"),
    ("Cover Letter", "cover_letter"),
    ("Job Role Suggestions", "job_roles"),
    ("LinkedIn Message", "linkedin_message"),
    ("Interview Prep", "interview_prep"),
]


def _clear_transient_results() -> None:
    for key in TRANSIENT_RESULT_KEYS:
        st.session_state.pop(key, None)
    for key in [k for k in st.session_state if k.endswith("_chat_history")]:
        del st.session_state[key]


def _start_new_profile() -> None:
    for key in (
        "step", "profile", "prefill_stage", "prefill_extracted", "profile_saved",
        "prefill_cv_bytes", "prefill_cv_filename", "cv_storage_done",
    ):
        st.session_state.pop(key, None)
    _clear_transient_results()
    st.session_state.page = "onboarding"
    st.rerun()


def _switch_profile(profile: dict) -> None:
    set_active_profile(st.session_state.user["id"], profile["id"])
    st.session_state.profile = profile["data"]
    st.session_state.profile_id = profile["id"]
    _clear_transient_results()
    st.rerun()


def _render_account_settings() -> None:
    st.subheader("Account")
    user = st.session_state.user

    if user.get("avatar_s3_key"):
        try:
            st.image(get_avatar_url(user["avatar_s3_key"]), width=96)
        except Exception:
            pass

    with st.form("account_form"):
        display_name = st.text_input("Name", value=user.get("display_name") or "")
        avatar_file = st.file_uploader("Update avatar", type=["png", "jpg", "jpeg"])
        saved = st.form_submit_button("Save account details")
    if saved:
        updates = {"display_name": display_name.strip()}
        if avatar_file:
            updates["avatar_s3_key"] = upload_avatar(avatar_file.getvalue(), user["id"], avatar_file.name)
        update_user(user["id"], **updates)
        st.session_state.user.update(updates)
        st.success("Account updated.")
        st.rerun()

    with st.expander("Change password"):
        with st.form("password_form"):
            current = st.text_input("Current password", type="password")
            new = st.text_input("New password", type="password")
            confirm = st.text_input("Confirm new password", type="password")
            submitted = st.form_submit_button("Change password")
        if submitted:
            db_user = get_user_by_id(user["id"])
            if not verify_password(current, db_user["password_hash"]):
                st.error("Current password is incorrect.")
            elif len(new) < 8:
                st.warning("New password must be at least 8 characters.")
            elif new != confirm:
                st.warning("New passwords do not match.")
            else:
                update_user(user["id"], password_hash=hash_password(new))
                st.success("Password changed.")


def _render_active_profile() -> None:
    st.subheader("Active profile")
    profile = st.session_state.profile
    with st.form("profile_edit_form"):
        edited = {
            key: st.text_area(label, value=profile.get(key, ""))
            for key, label in PROFILE_LABELS.items()
        }
        saved = st.form_submit_button("Save changes")
    if saved:
        edited = {key: value.strip() for key, value in edited.items()}
        st.session_state.profile = edited
        update_profile(st.session_state.profile_id, edited)
        st.success("Profile updated.")
        st.rerun()


def _render_profile_switcher() -> None:
    st.subheader("Your profiles")
    profiles = get_profiles_for_user(st.session_state.user["id"])
    for p in profiles:
        cols = st.columns([3, 1, 1])
        with cols[0]:
            marker = " (active)" if p["is_active"] else ""
            st.write(f"**{p['label'] or 'Untitled profile'}**{marker}")
        with cols[1]:
            if not p["is_active"] and st.button("Switch", key=f"switch_{p['id']}"):
                _switch_profile(p)
        with cols[2]:
            with st.popover("Rename"):
                new_label = st.text_input("New name", value=p["label"] or "", key=f"rename_input_{p['id']}")
                if st.button("Save", key=f"rename_save_{p['id']}"):
                    update_profile_label(p["id"], new_label.strip())
                    st.rerun()
    if st.button("+ New profile"):
        _start_new_profile()


def _render_history() -> None:
    st.subheader("History")
    for label, tool_key in HISTORY_TOOLS:
        with st.expander(label):
            entries = get_history(tool_key, st.session_state.profile_id)
            if not entries:
                st.write("No results yet.")
                continue
            for entry in entries:
                st.caption(entry["created_at"].strftime("%Y-%m-%d %H:%M"))
                content = entry.get("result") or entry.get("letter_text") or entry.get("message_text")
                if isinstance(content, dict):
                    st.json(content)
                else:
                    st.markdown(content or "")
                st.divider()


def run_profile() -> None:
    st.header("Profile")

    if not st.session_state.get("profile_id"):
        st.warning("Complete onboarding first.")
        return

    _render_account_settings()
    st.divider()
    _render_active_profile()
    st.divider()
    _render_profile_switcher()
    st.divider()
    _render_history()
