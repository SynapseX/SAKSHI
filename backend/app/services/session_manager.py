import uuid
from datetime import datetime, timedelta

from backend.app.services.mongodb_service import db


class SessionManager:
    def __init__(self):
        self.sessions = {}  # In-memory storage; consider a persistent store for production

    def create_session(self, uid: str, duration: int, metadata: dict = None):
        session_id = str(uuid.uuid4())
        created_at = datetime.utcnow()
        expires_at = self._calculate_expiry(created_at, duration)

        # Future-proof session structure
        session_data = {
            "session_id": session_id,
            "uid": uid,
            "duration": duration,
            "created_at": created_at,
            "expires_at": expires_at,
            "status": "active",
            "metadata": metadata or {}
        }
        db['sessions'].insert_one(session_data)
        return session_data

    def get_session(self, session_id: str):
        session = db['sessions'].find_one({"session_id": session_id})
        return session

    def extend_session(self, session_id: str, additional_duration: str):
        session = db['sessions'].find_one({"session_id": session_id})
        if session and session["status"] == "active":
            # Extend expiry based on the current expiry time
            new_expiry = self._calculate_expiry(session["expires_at"], additional_duration)
            db['sessions'].update_one({"session_id": session_id}, {"$set": {"expires_at": new_expiry}})
            session["expires_at"] = new_expiry
            return session
        return None

    def terminate_session(self, session_id: str):
        session = db['sessions'].find_one({"session_id": session_id})
        if session:
            db['sessions'].update_one({"session_id": session_id}, {"$set": {"status": "terminated"}})
            session["status"] = "terminated"
            return session
        return None

    def list_active_sessions(self):
        active_sessions = db['sessions'].find({"status": "active"})
        return list(active_sessions)

    def list_active_sessions_by_user(self, user_id: str):
        active_sessions = db['sessions'].find({"status": "active", "uid": user_id})
        return list(active_sessions)

    def _calculate_expiry(self, start_time: datetime, duration: int):
        try:
            value, unit = duration,'minutes'
        except Exception:
            raise ValueError("Duration must be in the format '<number> <unit>', e.g., '1 hour'")

        unit = unit.lower()
        if "minutes" in unit:
            return start_time + timedelta(minutes=value)
        elif "hour" in unit:
            return start_time + timedelta(hours=value)
        else:
            raise ValueError("Unsupported duration format. Use 'minute(s)', 'hour(s)', 'day(s)', or 'year(s)'.")

    def upsert_session(self, session_id: str, session_data: dict):
        """
        Upsert a session in the database. If the session does not exist, it will be created.
        If it exists, it will be updated with the provided session_data.
        """
        db['sessions'].update_one({"session_id": session_id}, {"$set": session_data}, upsert=True)
