# backend/app/main.py
import json
import uuid
import logging

from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Query
from starlette.middleware.cors import CORSMiddleware

from backend.app.models.models import UserProfile, SessionCreateRequest
from backend.app.services.mongodb_service import db
from backend.app.services.session_manager import SessionManager
from backend.app.services.conversation_service import process_user_prompt
from backend.app.services.session_watcher import start_watching
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# run the code which will have a list of active sessions and when the active session is created we send it to the list and when it reaches time we end the session

app = FastAPI()
session_deamon = start_watching()
session_manager = SessionManager()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model for processing a prompt
class PromptRequest(BaseModel):
    user_id: str
    prompt: str
    session_id: str
    previous_prompt: str


@app.post("/api/user")
async def create_profile(profile: UserProfile):
    # Check for existing user by email or username
    existing_user = db['users'].find_one({
        "$or": [
            {"email": profile.email},
            {"username": profile.username}
        ]
    })

    if existing_user:
        logger.warning(f"User already exists with email: {profile.email} or username: {profile.username}")
        raise HTTPException(status_code=400, detail="User with this email or username already exists")

    profile_dict = profile.dict(by_alias=True)
    db['users'].insert_one(profile_dict)
    new_user = db['users'].find_one({"_id": profile_dict["_id"]})

    return {"message": "Profile created", "user": new_user}


@app.get("/api/user")
async def get_user_by_email(email: str = Query(...)):
    user = db['users'].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": user}


# Optional: Get all users
@app.get("/api/users")
async def get_all_users():
    users = list(db['users'].find())
    return {"users": users}


# Optional: Update user by UID
@app.put("/api/user/{uid}")
async def update_user(uid: str, updated_profile: UserProfile):
    result = db['users'].update_one(
        {"_id": uid},
        {"$set": updated_profile.dict(by_alias=True)}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Profile updated"}


# Optional: Delete user by UID
@app.delete("/api/user/{uid}")
async def delete_user(uid: str):
    result = db['users'].delete_one({"_id": uid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

@app.post("/api/prompt")
async def handle_prompt(request: PromptRequest):
    # Validate that the user exists
    logger.info(f"Processing prompt for user: {request.user_id}")
    try:
        session = session_manager.get_session(request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        if session['status'] != 'active':
           session_manager.resume_session(session_id= request.session_id)
        user = db['users'].find_one({"_id": request.user_id})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Process the prompt via conversation service
    result = await process_user_prompt(request.session_id, request.user_id, request.prompt, request.previous_prompt)

    return result


@app.post("/api/sessions")
def create_session(request: SessionCreateRequest):
    try:
        session = session_manager.create_session(request)
        session_deamon.add_session(session)
        return {"message": "Session created", "session": json.loads(json.dumps(session, default=str))}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/sessions/{session_id}")
def get_session(session_id: str):
    session = session_manager.get_session(session_id)
    if session:
        return json.loads(json.dumps(session, default=str))
    raise HTTPException(status_code=404, detail="Session not found")


#TODO: Implement the extend_session endpoint
@app.put("/api/sessions/{session_id}/extend")
def extend_session(session_id: str, additional_duration: int):
    session = session_manager.extend_session(session_id, additional_duration)
    if session:
        return {"message": "Session extended", "session": json.loads(json.dumps(session, default=str))}
    raise HTTPException(status_code=404, detail="Session not found or inactive")

@app.get("/api/sessions/active/{user_id}")
def list_active_sessions_by_user(user_id: str):
    active_sessions = session_manager.list_sessions_by_user(user_id)
    return {"active_sessions": json.loads(json.dumps(active_sessions, default=str))}


@app.post("/api/pause_session/{session_id}")
async def pause_session(session_id: str):
    return session_manager.pause_session(session_id)

@app.post("/api/resume_session/{session_id}")
async def resume_session(session_id: str):
    return session_manager.resume_session(session_id)

@app.post("/api/completed_session/{session_id}")
async def resume_session(session_id: str):
    return session_manager.completed_session(session_id)

@app.post("/api/follow_up/{old_session_id}")
async def follow_up_session(old_session_id: str):
    return session_manager.create_follow_up_session(old_session_id)

@app.get('/health')
async def health():
    return {"status": "ok"}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
