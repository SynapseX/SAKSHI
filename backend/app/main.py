# backend/app/main.py
import uuid
import logging

from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from starlette.middleware.cors import CORSMiddleware

from backend.app.models.models import UserProfile
from backend.app.services.mongodb_service import db
from backend.app.services.session_manager import SessionManager
from services.conversation_service import process_user_prompt

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
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

@app.post("/create_profile")
async def create_profile(profile: UserProfile):
    profile.id = str(uuid.uuid4())
    logger.info(f"Creating profile for user: {profile.name}")
    result = db['users'].insert_one(profile.dict(by_alias=True))
    new_user = db['users'].find_one({"_id": profile.id})
    return {"message": "Profile created", "user": new_user}


@app.post("/prompt")
async def handle_prompt(request: PromptRequest):
    # Validate that the user exists
    logger.info(f"Processing prompt for user: {request.user_id}")
    try:
        user = db['users'].find_one({"_id": request.user_id})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Process the prompt via conversation service
    result = await process_user_prompt(request.session_id, request.user_id, request.prompt, request.previous_prompt)

    return result

# Define request model for creating a session
class SessionCreateRequest(BaseModel):
    uid: str
    duration: str  # e.g., "1 hour", "1 day", "1 year"
    metadata: dict = {}  # Optional additional info

@app.post("/sessions/")
def create_session(request: SessionCreateRequest):
    try:
        session = session_manager.create_session(request.uid, request.duration, request.metadata)
        return {"message": "Session created", "session": session}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/sessions/{session_id}")
def get_session(session_id: str):
    session = session_manager.get_session(session_id)
    if session:
        return session
    raise HTTPException(status_code=404, detail="Session not found")


#TODO: Implement the extend_session endpoint
@app.put("/sessions/{session_id}/extend")
def extend_session(session_id: str, additional_duration: str):
    session = session_manager.extend_session(session_id, additional_duration)
    if session:
        return {"message": "Session extended", "session": session}
    raise HTTPException(status_code=404, detail="Session not found or inactive")

@app.delete("/sessions/{session_id}")
def terminate_session(session_id: str):
    session = session_manager.terminate_session(session_id)
    if session:
        return {"message": "Session terminated", "session": session}
    raise HTTPException(status_code=404, detail="Session not found")

@app.get("/sessions/active")
def list_active_sessions():
    active_sessions = session_manager.list_active_sessions()
    return {"active_sessions": active_sessions}

@app.get("/sessions/active/{user_id}")
def list_active_sessions_by_user(user_id: str):
    active_sessions = session_manager.list_active_sessions()
    user_sessions = [s for s in active_sessions if s["uid"] == user_id]
    return {"active_sessions": user_sessions}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
