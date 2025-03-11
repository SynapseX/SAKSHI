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

class SessionLog(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    # session_logs holds a dictionary mapping phase names to log paragraphs.
    session_logs: Dict[str, str]
