# backend/models/user_model.py
import uuid
from pydantic import BaseModel, Field
from typing import Optional, Dict, List


class UserProfile(BaseModel):
    uid: str = Field(default_factory=uuid.uuid4, alias="_id")
    name: str
    email: str
    username: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    account_creation_date: Optional[str] = None
    last_login_date: Optional[str] = None
    language: Optional[str] = None
    time_zone: Optional[str] = None

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
    name: str
    duration: int  # e.g., "1 hour", "1 day", "1 year"
    treatment_goals: str
    client_expectations: str
    session_notes: str
    termination_plan: str
    review_of_progress: str
    thank_you_note: str
    metadata: dict = {}  # Optional additional info

class MentalStatus(BaseModel):
    appearance: Optional[str] = ""
    mood: Optional[str] = ""
    affect: Optional[str] = ""
    behavior: Optional[str] = ""
    speech: Optional[str] = ""
    thought_processes: Optional[str] = ""


class RiskToSelfOrOthers(BaseModel):
    suicidal_ideation: bool = False
    self_harm: bool = False
    harm_to_others: bool = False
    details: Optional[str] = ""


class SafetyPlan(BaseModel):
    discussed: bool = False
    description: Optional[str] = ""


class Intervention(BaseModel):
    technique: Optional[str] = ""
    description: Optional[str] = ""
    rationale: Optional[str] = ""


class BasicInformation(BaseModel):
    client_id: Optional[str] = ""
    client_name: Optional[str] = ""
    session_date: Optional[str] = ""  # Use datetime if needed
    session_number: Optional[str] = ""
    session_time: Optional[str] = ""
    session_duration: Optional[str] = ""


class ClientSubjectiveReport(BaseModel):
    presenting_issues: Optional[str] = ""
    stated_progress: Optional[str] = ""
    key_client_quotes: List[str] = []


class TherapistObjectiveObservations(BaseModel):
    mental_status: MentalStatus = MentalStatus()
    nonverbal_cues: Optional[str] = ""


class AssessmentAndClinicalImpression(BaseModel):
    progress_towards_goals: Optional[str] = ""
    themes: List[str] = []
    clinical_formulation_update: Optional[str] = ""


class RiskAssessment(BaseModel):
    risk_to_self_or_others: RiskToSelfOrOthers = RiskToSelfOrOthers()
    safety_plan: SafetyPlan = SafetyPlan()


class ClientResponseToInterventions(BaseModel):
    engagement_level: Optional[str] = ""
    client_feedback: Optional[str] = ""


class PlanForNextSession(BaseModel):
    topics_to_explore: List[str] = []
    planned_interventions: List[str] = []
    homework_or_tasks: Optional[str] = ""
    treatment_plan_adjustments: Optional[str] = ""


class TherapySessionNote(BaseModel):
    basic_information: BasicInformation = BasicInformation()
    client_subjective_report: ClientSubjectiveReport = ClientSubjectiveReport()
    therapist_objective_observations: TherapistObjectiveObservations = TherapistObjectiveObservations()
    assessment_and_clinical_impression: AssessmentAndClinicalImpression = AssessmentAndClinicalImpression()
    risk_assessment: RiskAssessment = RiskAssessment()
    interventions: List[Intervention] = []
    client_response_to_interventions: ClientResponseToInterventions = ClientResponseToInterventions()
    plan_for_next_session: PlanForNextSession = PlanForNextSession()
