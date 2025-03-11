# backend/app/main.py
import uuid

from fastapi import FastAPI, HTTPException
from starlette.middleware.cors import CORSMiddleware

from backend.app.models.models import UserProfile, UserProfile_DB
from backend.app.services.mongodb_service import db
from services.conversation_service import process_user_prompt
from pydantic import BaseModel
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

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

@app.post("/create_profile")
async def create_profile(profile: UserProfile):
    id = str(uuid.uuid4())
    profile.id = id
    logger.info(f"Creating profile for user: {profile.name}")
    result = db['users'].insert_one(profile.dict(by_alias=True))
    new_user = db['users'].find_one({"_id": id})
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
    result = await process_user_prompt(request.session_id, request.user_id, request.prompt)

    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)