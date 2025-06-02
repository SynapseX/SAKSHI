import json
import logging
from fastapi import APIRouter, HTTPException

from backend.app.models.models import SessionCreateRequest
from backend.app.services.session_manager import SessionManager
from backend.app.services.session_watcher import start_watching

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

session_router = APIRouter(prefix="/sessions", tags=["Session"])

# run the code which will have a list of active sessions and when the active session is created we send it to the list and when it reaches time we end the session
session_deamon = start_watching()
session_manager = SessionManager()


@session_router.post("/")
def create_session(request: SessionCreateRequest):
    try:
        session = session_manager.create_session(request)
        session_deamon.add_session(session)
        return {
            "message": "Session created",
            "session": json.loads(json.dumps(session, default=str)),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@session_router.get("/{session_id}")
def get_session(session_id: str):
    session = session_manager.get_session(session_id)
    if session:
        return json.loads(json.dumps(session, default=str))
    raise HTTPException(status_code=404, detail="Session not found")


@session_router.put("/{session_id}/extend")
def extend_session(session_id: str, additional_duration: int):
    session = session_manager.extend_session(session_id, additional_duration)
    if session:
        return {
            "message": "Session extended",
            "session": json.loads(json.dumps(session, default=str)),
        }
    raise HTTPException(status_code=404, detail="Session not found or inactive")


@session_router.get("/active/{user_id}")
def list_active_sessions_by_user(user_id: str):
    active_sessions = session_manager.list_sessions_by_user(user_id)
    return {"active_sessions": json.loads(json.dumps(active_sessions, default=str))}


@session_router.post("/{session_id}/pause")
async def pause_session(session_id: str):
    return session_manager.pause_session(session_id)


@session_router.post("/{session_id}/resume")
async def resume_session(session_id: str):
    return session_manager.resume_session(session_id)


@session_router.post("/{session_id}/complete")
async def completed_session(session_id: str):
    return session_manager.completed_session(session_id)


@session_router.post("/{old_session_id}/followup")
async def follow_up_session(old_session_id: str):
    return session_manager.create_follow_up_session(old_session_id)
