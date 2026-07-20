import streamlit as st
from services.auth_service import hash_password, verify_password
from database.db_client import (
    create_user,
    get_user_by_email,
    get_active_profile,
    create_remember_token,
    get_user_by_remember_token,
    delete_remember_token,
)

REMEMBER_COOKIE = "careerly_remember_token"
REMEMBER_DAYS = 30


def _log_in_user(user: dict) -> None:
    st.session_state.user = {
        "id": user["id"],
        "email": user["email"],
        "display_name": user["display_name"],
        "avatar_s3_key": user["avatar_s3_key"],
    }
    profile = get_active_profile(user["id"])
    if profile:
        st.session_state.profile = profile["data"]
        st.session_state.profile_id = profile["id"]
        st.session_state.page = "dashboard"
    else:
        st.session_state.page = "onboarding"


def flush_pending_remember(cookies) -> None:
    """Writes the remember-me cookie on the render *after* login/signup.

    Setting it in the same run as st.rerun() races the cookie-writing
    component against the rerun tearing the page down, so the actual
    write is deferred to the next natural render instead.
    """
    user_id = st.session_state.pop("pending_remember_user_id", None)
    if user_id is not None:
        token = create_remember_token(user_id, days=REMEMBER_DAYS)
        cookies.set(REMEMBER_COOKIE, token, max_age=REMEMBER_DAYS * 24 * 60 * 60)


def try_remember_login(cookies) -> bool:
    token = cookies.get(REMEMBER_COOKIE)
    if not token:
        return False
    user = get_user_by_remember_token(token)
    if not user:
        return False
    _log_in_user(user)
    return True


def run_login() -> None:
    st.subheader("Log in")
    with st.form("login_form"):
        email = st.text_input("Email")
        password = st.text_input("Password", type="password")
        submitted = st.form_submit_button("Log in")

    if submitted:
        user = get_user_by_email(email.strip().lower())
        if not user or not verify_password(password, user["password_hash"]):
            st.error("Invalid email or password.")
        else:
            _log_in_user(user)
            st.session_state.pending_remember_user_id = user["id"]
            st.rerun()

    if st.button("Don't have an account? Sign up"):
        st.session_state.page = "signup"
        st.rerun()


def run_signup() -> None:
    st.subheader("Create an account")
    with st.form("signup_form"):
        display_name = st.text_input("Name")
        email = st.text_input("Email")
        password = st.text_input("Password", type="password")
        confirm_password = st.text_input("Confirm password", type="password")
        submitted = st.form_submit_button("Sign up")

    if submitted:
        email = email.strip().lower()
        if not email or not password:
            st.warning("Email and password are required.")
        elif len(password) < 8:
            st.warning("Password must be at least 8 characters.")
        elif password != confirm_password:
            st.warning("Passwords do not match.")
        elif get_user_by_email(email):
            st.warning("An account with this email already exists.")
        else:
            user_id = create_user(email, hash_password(password), display_name.strip())
            user = {"id": user_id, "email": email, "display_name": display_name.strip(), "avatar_s3_key": None}
            _log_in_user(user)
            st.session_state.pending_remember_user_id = user_id
            st.rerun()

    if st.button("Already have an account? Log in"):
        st.session_state.page = "login"
        st.rerun()


def run_logout(cookies) -> None:
    token = cookies.get(REMEMBER_COOKIE)
    if token:
        delete_remember_token(token)
        cookies.remove(REMEMBER_COOKIE)
    for key in list(st.session_state.keys()):
        del st.session_state[key]
    st.session_state.page = "login"
    st.rerun()
