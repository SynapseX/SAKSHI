import json
import logging
from fastapi import APIRouter, HTTPException, Query

from backend.app.models.models import SessionCreateRequest
from backend.app.services.session_manager import SessionManager
from backend.app.services.session_watcher import start_watching

from starlette.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

session_router = APIRouter(prefix="/sessions", tags=["Session"])

# run the code which will have a list of active sessions and when the active session is created we send it to the list and when it reaches time we end the session
session_deamon = start_watching()
session_manager = SessionManager()


@session_router.post("/", status_code=HTTP_201_CREATED)
def create_session(request: SessionCreateRequest):
    try:
        session = session_manager.create_session(request)
        session_deamon.add_session(session)
        return {
            "session": json.loads(json.dumps(session, default=str)),
        }
    except ValueError as e:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail=str(e))


@session_router.get("/{session_id}", status_code=HTTP_200_OK)
def get_session(session_id: str):
    session = session_manager.get_session(session_id)
    if session:
        return json.loads(json.dumps(session, default=str))
    raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Session not found")


@session_router.put("/{session_id}/extend", status_code=HTTP_200_OK)
def extend_session(session_id: str, additional_duration: int):
    session = session_manager.extend_session(session_id, additional_duration)
    return {
        "session": json.loads(json.dumps(session, default=str)),
    }


@session_router.get("/list/{user_id}", status_code=HTTP_200_OK)
def list_sessions_by_user(user_id: str, status: str = Query("")):
    sessions = session_manager.list_sessions_by_user(user_id, status)
    return {"sessions": json.loads(json.dumps(sessions, default=str))}


@session_router.post("/{session_id}/pause", status_code=HTTP_200_OK)
async def pause_session(session_id: str):
    return session_manager.pause_session(session_id)


@session_router.post("/{session_id}/resume", status_code=HTTP_200_OK)
async def resume_session(session_id: str):
    return session_manager.resume_session(session_id)


@session_router.post("/{session_id}/complete", status_code=HTTP_200_OK)
async def completed_session(session_id: str):
    return session_manager.completed_session(session_id)


@session_router.post("/{old_session_id}/followup", status_code=HTTP_200_OK)
async def follow_up_session(old_session_id: str):
    return session_manager.create_follow_up_session(old_session_id)
