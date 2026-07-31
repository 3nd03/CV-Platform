from fastapi import APIRouter, Depends, HTTPException, status

from database.db_client import (
    create_profile,
    get_profiles_for_user,
    get_active_profile,
    set_active_profile,
    update_profile,
    update_profile_label,
)
from api.schemas import ProfileCreate, ProfileUpdate, ProfileOut, ProfileLabelUpdate
from api.dependencies import get_current_user, get_current_profile

router = APIRouter(prefix="/profile", tags=["profile"])


def _ensure_owns_profile(user_id: int, profile_id: int) -> None:
    profiles = get_profiles_for_user(user_id)
    if not any(p["id"] == profile_id for p in profiles):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")


@router.post("", response_model=ProfileOut)
def create_profile_endpoint(payload: ProfileCreate, user: dict = Depends(get_current_user)):
    data = payload.model_dump(exclude={"label"})
    label = payload.label or data.get("target_role") or "My profile"
    create_profile(user["id"], label, data)
    return get_active_profile(user["id"])


@router.get("", response_model=ProfileOut)
def get_profile(profile: dict = Depends(get_current_profile)):
    return profile


@router.put("", response_model=ProfileOut)
def update_active_profile(payload: ProfileUpdate, profile: dict = Depends(get_current_profile)):
    merged = {**profile["data"], **payload.model_dump(exclude_none=True)}
    update_profile(profile["id"], merged)
    profile["data"] = merged
    return profile


@router.get("/all", response_model=list[ProfileOut])
def get_all_profiles(user: dict = Depends(get_current_user)):
    return get_profiles_for_user(user["id"])


@router.put("/{profile_id}/activate", response_model=ProfileOut)
def activate_profile(profile_id: int, user: dict = Depends(get_current_user)):
    _ensure_owns_profile(user["id"], profile_id)
    set_active_profile(user["id"], profile_id)
    return get_active_profile(user["id"])


@router.put("/{profile_id}/label")
def rename_profile(profile_id: int, payload: ProfileLabelUpdate, user: dict = Depends(get_current_user)):
    _ensure_owns_profile(user["id"], profile_id)
    update_profile_label(profile_id, payload.label)
    return {"detail": "Label updated"}
