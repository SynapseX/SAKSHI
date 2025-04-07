from typing import Literal, Optional

class Session:
    _id: str
    session_id: str
    uid: str
    duration: Literal[15,30,60]
    remaining_duration: int
    created_at: str
    expires_at: str
    phase_end_times: str
    status: str
    treatment_goals: str
    client_expectations: str
    termination_plan: str
    review_of_progress: str
    thank_you_note: str
    session_notes: Optional[str]
    metadata: object
    title: object
