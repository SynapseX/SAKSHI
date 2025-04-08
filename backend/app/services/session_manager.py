import json
import uuid
import datetime
from datetime import timedelta

from backend.app.models.models import SessionCreateRequest
from backend.app.services.llm_connector import generate_json_response
from backend.app.services.mongodb_service import db
from backend.app.services.phase_intent import phase_intent


def get_title_for_session(session_data):
    """
    Generates a session title based on the user's treatment goals, expectations,
    and other session details.

    - If session_notes are provided, it uses them to create a follow-up title.
    - Otherwise, it uses the session_form details for a generic title.

    The function returns a JSON object with a single key 'session_title'.
    """
    if "session_notes" in session_data and session_data["session_notes"] != "":
        few_shot_examples = """
            Example for follow-up title:
            Input: {"session_notes": "Last session, you mentioned challenges with work stress.", "treatment_goals": ["Improve stress management"], "expectations": "Reflect on progress"}
            Output: {"session_title": "Progress in Managing Work Stress: Reflecting on Recent Improvements"}
            """
        instruction = (
            "You are an experienced therapy session title generator. Your task is to generate a session title "
            "that reflects the patient's progress and focus for the session, drawing upon previous session notes. "
            "Output the result as a JSON object with a single key 'session_title'."
        )
        input_data = {
            "session_notes": session_data["session_notes"],
            "treatment_goals": session_data.get("treatment_goals", []),
            "expectations": session_data.get("expectations", "")
        }
    else:
        few_shot_examples = """
Example for generic title:
Input: {"session_form": "I have been feeling anxious and have trouble sleeping.", "treatment_goals": ["Reduce anxiety", "Improve sleep"], "expectations": "Receive guidance on managing anxiety"}
Output: {"session_title": "Starting A New Journey: Understanding Your Current Challenges"}
"""
        instruction = (
            "You are an expert therapy session title generator. Your task is to generate a creative and descriptive session title "
            "that encapsulates the patient's treatment goals and expectations. "
            "When no previous session notes are available, generate a generic title based on the session form. "
            "Output the result as a JSON object with a single key 'session_title'."
        )
        input_data = {
            "session_form": session_data.get("session_form", ""),
            "treatment_goals": session_data.get("treatment_goals", []),
            "expectations": session_data.get("expectations", "")
        }

    prompt = (
        f"{instruction}\n\n"
        "Here are a few examples:\n"
        f"{few_shot_examples}\n"
        "Now, generate the output for the following input:\n"
        f"{json.dumps(input_data)}"
    )

    try:
        response = generate_json_response(prompt)
        return response
    except json.JSONDecodeError:
        return {"error": "Invalid JSON response from LLM."}


def get_first_prompt(session_data):
    """
    Generates the first prompt (therapist's initial statement) for a session.

    If session_data contains non-empty 'session_notes', it is assumed that there was a previous session.
    In that case, the generated prompt will be a follow-up question referencing those notes.
    Otherwise, a generic prompt is generated based on the 'session_form' details.

    Args:
        session_data (dict): Contains keys like treatment_goals, expectations, session_notes, session_form, etc.

    Returns:
        dict: A JSON object with the key 'first_prompt' containing the generated first statement.
    """
    # Determine if this is a follow-up session or a generic new session
    if "session_notes" in session_data and session_data["session_notes"] != "":
        # Follow-up session: Use previous session notes
        few_shot_examples = """
            Example for previous session follow-up:
            Input: {"session_notes": "Last session, you expressed feeling overwhelmed by work stress.", "treatment_goals": ["Improve stress management"], "expectations": "Reflect on progress since last session."}
            Output: {"first_prompt": "Based on our last session where you felt overwhelmed by work stress, can you share any changes or progress you've noticed since then?"}
            """
        instruction = (
            "You are a seasoned therapist generating a follow-up prompt for a returning patient. "
            "The patient has provided session notes from the previous session. "
            "Generate a thoughtful follow-up question that builds on those notes and invites the patient to reflect on any changes or progress since the last session. "
            "Output the result as a JSON object with a single key 'first_prompt'."
        )
        input_data = {
            "session_notes": session_data["session_notes"],
            "treatment_goals": session_data.get("treatment_goals", []),
            "expectations": session_data.get("expectations", "")
        }
    else:
        # New session: Use session form details for a generic prompt
        few_shot_examples = """
            Example for generic session start:
            Input: {"session_form": "I have been feeling anxious lately and having trouble sleeping.", "treatment_goals": ["Reduce anxiety", "Improve sleep"], "expectations": "Receive clear guidance to manage anxiety."}
            Output: {"first_prompt": "Welcome! Can you elaborate on your recent feelings of anxiety and difficulty sleeping, so we can work together on managing these issues?"}
            """
        instruction = (
            "You are a compassionate therapist initiating a new session with a patient who has not been provided any sessions yet. "
            "Generate a generic statement/question that encourages the patient to discuss their current feelings and experiences based on the session form they filled out. "
            "Output the result as a JSON object with a single key 'first_prompt'."
        )
        input_data = {
            "session_form": session_data.get("session_form", ""),
            "treatment_goals": session_data.get("treatment_goals", []),
            "expectations": session_data.get("expectations", "")
        }

    prompt = (
        f"{instruction}\n\n"
        "Here are a few examples:\n"
        f"{few_shot_examples}\n"
        "Now, generate the output for the following input:\n"
        f"{json.dumps(input_data)}"
    )

    try:
        response = generate_json_response(prompt)
        return response
    except json.JSONDecodeError:
        return {"error": "Invalid JSON response from LLM."}

class SessionManager:
    def __init__(self):
        self.sessions = {}  # In-memory storage; consider a persistent store for production

    def create_session(self, request):
        session_id = str(uuid.uuid4())
        created_at = datetime.datetime.now(datetime.UTC)
        expires_at = self._calculate_expiry(created_at, request.duration)

        # Future-proof session structure
        session_data = {
            "session_id": session_id,
            "uid": request.uid,
            "duration": request.duration,
            "created_at": created_at,
            "expires_at": expires_at,
            "phase_end_times": self.calculate_phase_end_times(created_at, request.duration, phase_intent),
            "status": "active",
            "treatment_goals": request.treatment_goals,
            "client_expectations": request.client_expectations,
            "session_notes": request.session_notes,
            "termination_plan": request.termination_plan,
            "review_of_progress": request.review_of_progress,
            "thank_you_note": request.thank_you_note,
            "metadata": request.metadata or {}
        }

        #Title Generator
        session_data["title"] = get_title_for_session(session_data)

        # AND insert
        db['sessions'].insert_one(session_data)

        #First Prompt generator
        first_prompt = get_first_prompt(session_data)
        session_data["first_prompt"] = first_prompt

        return session_data

    @staticmethod
    def get_session(session_id: str):
        session = db['sessions'].find_one({"session_id": session_id})
        return session

    def extend_session(self, session_id: str, additional_duration: int):
        session = db['sessions'].find_one({"session_id": session_id})
        if session and session["status"] == "active":
            # Extend expiry based on the current expiry time
            new_expiry = self._calculate_expiry(session["expires_at"], additional_duration)
            db['sessions'].update_one({"session_id": session_id}, {"$set": {"expires_at": new_expiry}})
            session["expires_at"] = new_expiry
            return session
        return None

    @staticmethod
    def terminate_session(session_id: str):
        session = db['sessions'].find_one({"session_id": session_id})
        if session:
            db['sessions'].update_one({"session_id": session_id}, {"$set": {"status": "terminated"}})
            session["status"] = "terminated"
            return session
        return None

    @staticmethod
    def list_active_sessions():
        active_sessions = db['sessions'].find({"status": "active"})
        return list(active_sessions)

    @staticmethod
    def list_active_sessions_by_user(user_id: str):
        active_sessions = db['sessions'].find({"status": "active", "uid": user_id})
        return list(active_sessions)

    @staticmethod
    def list_sessions_by_user(user_id: str):
        active_sessions = db['sessions'].find({"uid": user_id})
        return list(active_sessions)

    @staticmethod
    def _calculate_expiry(start_time: datetime, duration: int):
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

    @staticmethod
    def upsert_session(session_id: str, session_data: dict):
        """
        Upsert a session in the database. If the session does not exist, it will be created.
        If it exists, it will be updated with the provided session_data.
        """
        db['sessions'].update_one({"session_id": session_id}, {"$set": session_data}, upsert=True)

    def calculate_phase_end_times(self, start_time: datetime, duration: int, phase_intent: dict):
        """
        Calculate the end time for each phase based on the session duration and phase weightage.

        Args:
            start_time (datetime): The start time of the session.
            duration (int): The total duration of the session in minutes.
            phase_intent (dict): A dictionary containing phase names and their respective weightages.

        Returns:
            dict: A dictionary with phase names as keys and their calculated end times as values.
        """
        total_weight = sum(
            phase['weightage'] for phase in phase_intent.values() if isinstance(phase, dict) and 'weightage' in phase)
        phase_end_times = {}
        current_time = start_time

        for phase, details in phase_intent.items():
            if isinstance(details, dict) and 'weightage' in details:
                phase_duration = (details['weightage'] / total_weight) * duration
                phase_end_time = current_time + timedelta(minutes=phase_duration)
                phase_end_times[phase] = phase_end_time
                current_time = phase_end_time

        return phase_end_times

        # Pause session
    def pause_session(self, session_id: str):
        session = db['sessions'].find_one({"session_id": session_id})

        if not session:
            return {"error": "Session not found."}

        if session["status"] != "active":
            return {"error": "Only active sessions can be paused."}

        # Calculate remaining duration before pausing
        current_time = datetime.now(datetime.UTC)
        remaining_duration = (session["expires_at"] - current_time).total_seconds() // 60  # Convert to minutes

        # Update session status
        db['sessions'].update_one(
            {"session_id": session_id},
            {"$set": {"status": "paused", "paused_at": current_time, "remaining_duration": remaining_duration}}
        )

        return {"message": "Session paused successfully.", "session_id": session_id}

    # Resume session
    def resume_session(self, session_id: str):
        session = db['sessions'].find_one({"session_id": session_id})

        if not session:
            return {"error": "Session not found."}

        if session["status"] != "paused":
            return {"error": "Only paused sessions can be resumed."}

        # Calculate new expiry time
        current_time = datetime.now(datetime.UTC)
        new_expires_at = current_time + timedelta(minutes=session["remaining_duration"])

        # Update session status
        db['sessions'].update_one(
            {"session_id": session_id},
            {"$set": {"status": "active", "expires_at": new_expires_at},
             "$unset": {"paused_at": "", "remaining_duration": ""}}
        )

        return {"message": "Session resumed successfully.", "session_id": session_id,
                "new_expires_at": new_expires_at}

    def generate_session_notes(self, old_session_id: str) -> dict:
        old_session = self.db['sessions'].find_one({"_id": old_session_id})
        if not old_session:
            return "No previous session data found."

        # Extract relevant data for LLM prompt
        chat_history = old_session.get("chat_history", "No previous conversation available.")

        llm_prompt = f"""                
                You are an expert clinical documentation assistant trained to assist therapists in structuring session notes. Based on the **chat history** and **key session attributes** from the previous session, you will generate a **therapy session note** in structured JSON format.
                
                Use the template provided below, and ensure each field is completed as thoroughly as possible based on the available data. If any data is missing or not evident, mark it with a descriptive placeholder like `"Not discussed in session"` or `"To be updated"`.
                
                ---
                
                ### 🔹 INPUTS:
                
                #### 1. Chat History:
                A full chat log from a therapy session between therapist and client.
                
                #### 2. Session Metadata:
                
                ```json
               {{
                  "id": "uuid",
                  "uid": "user_id",
                  "duration": "in minutes",
                  "name": "Client's name",
                  "treatment_goals": "high-level therapeutic goals",
                  "client_expectations": "what the client wants from therapy",
                  "session_notes": "general notes from the session",
                  "chat_history": "full chat log",
                  "termination_plan": "if discussed, any plans to conclude therapy",
                  "review_of_progress": "therapist's review of goal progress",
                  "thank_you_note": "summary or closing message",
                  "metadata":{{
                    "any": "additional optional information"
                  }}
                }}
                ```
                
                ORIGINAL SESSION DATA
                ---
               {{old_session}}
                
                ---
                
                ---
                
                ### 🔹 OBJECTIVE:
                
                Transform this data into the following structured **TherapySessionNote JSON**:
                
                ```json
               {{
                  "basic_information":{{
                    "client_id": "From uid",
                    "client_name": "Infer from chat if available or leave blank",
                    "session_date": "Infer from context or use today's date",
                    "session_number": "Estimate or leave blank",
                    "session_time": "Estimate or leave blank",
                    "session_duration": "Use value from 'duration'"
                  }},
                  "client_subjective_report":{{
                    "presenting_issues": "Based on session_notes + chat",
                    "stated_progress": "Use 'review_of_progress' + client responses from chat",
                    "key_client_quotes": ["Pull 2–3 direct quotes from the chat that reflect client perspective"]
                  }},
                  "therapist_objective_observations":{{
                    "mental_status":{{
                      "appearance": "From metadata or notes",
                      "mood": "Infer from client's tone or self-report",
                      "affect": "E.g., flat, reactive, congruent, etc.",
                      "behavior": "Notable behaviors during session",
                      "speech": "E.g., pressured, slow, normal",
                      "thought_processes": "E.g., linear, disorganized, racing"
                    }},
                    "nonverbal_cues": "Any notable nonverbal clues mentioned or inferred"
                  }},
                  "assessment_and_clinical_impression":{{
                    "progress_towards_goals": "Use 'review_of_progress'",
                    "themes": ["Pull 1–3 recurring topics or emotional threads"],
                    "clinical_formulation_update": "Any updates to understanding of client situation"
                  }},
                  "risk_assessment":{{
                    "risk_to_self_or_others":{{
                      "suicidal_ideation": false,
                      "self_harm": false,
                      "harm_to_others": false,
                      "details": "Leave empty or use chat analysis"
                    }},
                    "safety_plan":{{
                      "discussed": false,
                      "description": ""
                    }}
                  }},
                  "interventions": [
                   {{
                      "technique": "e.g., CBT, DBT, psychoeducation",
                      "description": "What was done in session",
                      "rationale": "Why this method was used"
                    }}
                  ],
                  "client_response_to_interventions":{{
                    "engagement_level": "e.g., receptive, resistant, reflective",
                    "client_feedback": "Client's view of the approach/session"
                  }},
                  "plan_for_next_session":{{
                    "topics_to_explore": ["Based on open threads from current session"],
                    "planned_interventions": ["Based on client needs or unfinished goals"],
                    "homework_or_tasks": "If any were assigned",
                    "treatment_plan_adjustments": "Updates to approach if needed"
                  }}
                }}
                ```
                
                ---
                
                ### 🔹 INSTRUCTIONS TO THE LLM:
                
                - Use **natural clinical language** for each field.
                - Avoid duplicating content—summarize where necessary.
                - Ensure proper grammar and formatting in all string values.
                - If context is unclear, use placeholders like `"To be discussed"` or `"Information not available"`.
                
                ---

"""
        session_notes = generate_json_response(llm_prompt)

        return session_notes

    def create_follow_up_session(self, old_session_id: str):
        old_session = db['sessions'].find_one({"_id": old_session_id})
        if not old_session:
            return {"error": "Old session not found"}

        # Generate session notes using LLM
        session_notes = self.generate_session_notes(old_session_id)

        # Prepare data for new session
        session_data = SessionCreateRequest(
            uid=old_session["uid"],
            duration=old_session["duration"],
            treatment_goals=old_session["treatment_goals"],
            client_expectations=old_session["client_expectations"],
            session_notes=session_notes,
            termination_plan=old_session["termination_plan"],
            review_of_progress=old_session["review_of_progress"],
            thank_you_note=old_session["thank_you_note"],
            metadata={"follow_up_of": old_session_id}  # Indicate it's a follow-up session
        )

        # Call the existing session creation method
        new_session_response = self.create_session(session_data)

        return new_session_response  # Return standard session creation response

    def completed_session(self, session_id):
        session = db['sessions'].find_one({"session_id": session_id})

        if not session:
            return {"error": "Session not found."}

        if session["status"] != "active":
            return {"error": "Only active sessions can be paused."}

        # Calculate remaining duration before pausing
        current_time = datetime.datetime.now(datetime.UTC)

        # Update session status
        db['sessions'].update_one(
            {"session_id": session_id},
            {"$set": {"status": "completed", "completed_at": current_time}}
        )

        return {"message": "Session completed successfully.", "session_id": session_id}
