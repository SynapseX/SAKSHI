import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.app.services.mongodb_service import db
from backend.app.services.session_manager import SessionManager
from backend.app.services.conversation_service import process_user_prompt


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

prompt_router = APIRouter()

session_manager = SessionManager()


# Request model for processing a prompt
class PromptRequest(BaseModel):
    user_id: str
    prompt: str
    session_id: str
    previous_prompt: str


@prompt_router.post("prompt")
async def handle_prompt(request: PromptRequest):
    # Validate that the user exists
    logger.info(f"Processing prompt for user: {request.user_id}")
    try:
        session = session_manager.get_session(request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        if session["status"] != "active":
            session_manager.resume_session(session_id=request.session_id)
        user = db["users"].find_one({"_id": request.user_id})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Process the prompt via conversation service
    result = await process_user_prompt(
        request.session_id, request.user_id, request.prompt, request.previous_prompt
    )

    return result
