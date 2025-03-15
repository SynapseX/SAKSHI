import uuid
from datetime import datetime, timedelta


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
        self.sessions[session_id] = session_data
        return session_data

    def get_session(self, session_id: str):
        return self.sessions.get(session_id, None)

    def extend_session(self, session_id: str, additional_duration: str):
        session = self.sessions.get(session_id)
        if session and session["status"] == "active":
            # Extend expiry based on the current expiry time
            session["expires_at"] = self._calculate_expiry(session["expires_at"], additional_duration)
            return session
        return None

    def terminate_session(self, session_id: str):
        session = self.sessions.get(session_id)
        if session:
            session["status"] = "terminated"
            return session
        return None

    def list_active_sessions(self):
        return [s for s in self.sessions.values() if s["status"] == "active"]

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
