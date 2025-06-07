import logging
from fastapi import APIRouter, HTTPException, Query
from backend.app.models.models import UserProfile
from backend.app.services.mongodb_service import db
from starlette.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_500_INTERNAL_SERVER_ERROR,
)


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

user_router = APIRouter(tags=["User"])


@user_router.get("/users", status_code=HTTP_200_OK)
async def get_all_users():
    users = list(db["users"].find())
    return {"users": users}


@user_router.post("/user", status_code=HTTP_201_CREATED)
async def create_profile(profile: UserProfile):
    # Check for existing user by email
    existing_user = db["users"].find_one({"email": profile.email})

    if existing_user:
        logger.warning(f"User already exists with email: {profile.email}")
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST, detail="User already exists"
        )

    profile_dict = profile.model_dump(by_alias=True)
    db["users"].insert_one(profile_dict)
    new_user = db["users"].find_one({"_id": profile_dict["_id"]})

    return {"user": new_user}


@user_router.get("/user")
async def get_user_by_email(email: str = Query(...)):
    try:
        user = db["users"].find_one({"email": email})
        print(user)
        if not user:
            return {"user": None}
        return {"user": user}

    except Exception as e:
        logger.error(f"Error retrieving user by email: {email}, Error: {str(e)}")
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error"
        )


# [Opt]
@user_router.put("/user/{uid}", status_code=HTTP_200_OK)
async def update_user(uid: str, updated_profile: UserProfile):
    # TODO: Update only specified/allowed fields, rather than all internal fields
    result = db["users"].update_one(
        {"_id": uid}, {"$set": updated_profile.model_dump(by_alias=True)}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="User not found")
    return {"message": "Profile updated"}


# Optional: Delete user by UID
@user_router.delete("/user/{uid}", status_code=HTTP_200_OK)
async def delete_user(uid: str):
    result = db["users"].delete_one({"_id": uid})
    if result.deleted_count == 0:
        return {"detail": "User already deleted"}
    return {"message": "User deleted"}
