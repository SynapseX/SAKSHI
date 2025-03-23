# backend/models/user_model.py
import uuid
from pydantic import BaseModel, Field
from typing import Optional, Dict

class UserProfile(BaseModel):
    id: str = Field(default_factory=uuid.uuid4, alias="_id")
    name: str
    age: Optional[int] = None

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "_id": "066de609-b04a-4b30-b46c-32537c7f1f6e",
                "name": "Don Quixote",
                "age": 11
            }
        }

class UserProfile_DB(BaseModel):
    _id: str
    name: str
    age: Optional[int] = None

class SessionCreateRequest(BaseModel):
    id: str = Field(default_factory=uuid.uuid4, alias="_id")
    uid: str
    duration: int  # e.g., "1 hour", "1 day", "1 year"
    treatment_goals: str
    client_expectations: str
    session_notes: str
    termination_plan: str
    review_of_progress: str
    thank_you_note: str
    metadata: dict = {}  # Optional additional info
