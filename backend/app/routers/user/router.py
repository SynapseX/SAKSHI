import logging
from fastapi import APIRouter, HTTPException, Query
from backend.app.models.models import UserProfile
from backend.app.services.mongodb_service import db

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)

user_router = APIRouter(tags=["User"])


@user_router.get("/users")
async def get_all_users():
    users = list(db["users"].find())
    return {"users": users}


@user_router.post("/user")
async def create_profile(profile: UserProfile):
    # Check for existing user by email or username
    existing_user = db["users"].find_one(
        {"$or": [{"email": profile.email}, {"username": profile.username}]}
    )

    if existing_user:
        logger.warning(
            f"User already exists with email: {profile.email} or username: {profile.username}"
        )
        raise HTTPException(
            status_code=400, detail="User with this email or username already exists"
        )

    profile_dict = profile.model_dump(by_alias=True)
    db["users"].insert_one(profile_dict)
    new_user = db["users"].find_one({"_id": profile_dict["_id"]})

    return {"message": "Profile created", "user": new_user}


@user_router.get("/user")
async def get_user_by_email(email: str = Query(...)):
    try:
        user = db["users"].find_one({"email": email})
        if not user:
            return {"user": None}
        return {"user": user}
    except Exception as e:
        logger.error(f"Error retrieving user by email: {email}, Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Optional: Update user by UID
@user_router.put("/user/{uid}")
async def update_user(uid: str, updated_profile: UserProfile):
    result = db["users"].update_one(
        {"_id": uid}, {"$set": updated_profile.model_dump(by_alias=True)}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Profile updated"}


# Optional: Delete user by UID
@user_router.delete("/user/{uid}")
async def delete_user(uid: str):
    result = db["users"].delete_one({"_id": uid})
    if result.deleted_count == 0:
        return {"message": "User already deleted"}
    return {"message": "User deleted"}
