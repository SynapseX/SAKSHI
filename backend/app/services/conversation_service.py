# backend/services/conversation_service.py
import json
import random
from datetime import datetime
import logging

from backend.app.services.llm_connector import generate_response, create_prompt
from backend.app.services.mongodb_service import db
from backend.app.services.phase_shifter import phase_shifter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define the ordered list of phases (adjust as needed)
PHASE_SEQUENCE = [
    "Initial Phase",
    "Intake Phase",
    "Exploratory Inquiry Phase",
    "Scenario Validation Phase",
    "Solution Retrieval Phase",
    "Intervention & Follow-Up Phase",
    "Progress Evaluation Phase",
    "Termination/Closure Phase"
]

def get_next_phase(current_phase: str) -> str:
    """
    Returns the next phase based on the current phase, following the defined PHASE_SEQUENCE.
    If the current phase is the last in the sequence, it returns the same phase.
    """
    if current_phase in PHASE_SEQUENCE:
        idx = PHASE_SEQUENCE.index(current_phase)
        if idx < len(PHASE_SEQUENCE) - 1:
            return PHASE_SEQUENCE[idx + 1]
    # If not found or already last, return current_phase unchanged.
    return current_phase


async def process_user_prompt(session_id: str, user_id: str, prompt: str, recent_question, max_tokens: int = 4096):
    """
    Main function to handle user input during the conversation.
    Retrieves previous context, decides on phase shift, generates feedback or follow-up questions,
    and logs the session under each phase (as a list of conversation entries).
    """
    previous_context, current_phase = analyze_previous_chats(user_id, max_tokens)
    if not previous_context:
        logger.info(f"No previous context found for user: {user_id}. Starting Initial Phase.")
        current_phase = "Initial Phase"
        previous_context = ""

    logger.info(f"Processing prompt for user {user_id} in {current_phase}: {prompt}")

    # Phase shifting decision based on previous context and latest prompt.
    phase_decision, user_situation = phase_shifter(previous_context, prompt, current_phase, user_id, db, recent_question,
                                                   max_tokens)

    if phase_decision == "advance":
        next_phase = get_next_phase(current_phase)
        advance_questions = generate_advance_questions(previous_context, prompt, current_phase, user_id)
        feedback_obj = generate_response(create_prompt(previous_context + " " + prompt, prompt))
        feedback = feedback_obj.get("final_response", "No feedback generated")

        # Update current_phase to next_phase in the log
        log_session(session_id, user_id, next_phase, prompt, feedback, user_situation, phase_decision)

        return {
            "follow_up_question": advance_questions,
            "phase_decision": phase_decision,
            "user_situation": user_situation
        }
    elif phase_decision == "more_questions":
        additional_questions = generate_follow_up_questions(previous_context, prompt, current_phase, user_id)
        log_session(session_id, user_id, current_phase, prompt, additional_questions, user_situation, phase_decision)
        return {
            "follow_up_question": additional_questions,
            "phase_decision": phase_decision,
            "user_situation": user_situation
        }
    elif phase_decision == "crisis":
        crisis_message = ("Your responses indicate severe distress. We strongly recommend that you seek "
                          "immediate in-person help from a doctor or crisis intervention service.")
        log_session(session_id, user_id, "Crisis Phase", prompt, crisis_message, user_situation, phase_decision)
        return {
            "follow_up_question": crisis_message,
            "phase_decision": phase_decision,
            "user_situation": user_situation
        }
    elif phase_decision == "terminate":
        termination_feedback = (
            "We are now in the Termination/Closure Phase. Please review the recommendations provided earlier, "
            "continue with the suggested practices, and observe any changes over the next 7 days. "
            "When you are ready, you can initiate a new session for further guidance."
        )
        log_session(session_id, user_id, "Termination/Closure Phase", prompt, termination_feedback, user_situation,
                    phase_decision)
        return {
            "follow_up_question": termination_feedback,
            "phase_decision": phase_decision,
            "user_situation": user_situation
        }


def analyze_previous_chats(user_id: str, max_tokens: int):
    """
    Retrieve and analyze previous conversations from MongoDB to create context for the current session.
    Aggregates conversation logs from each phase (stored as lists) and returns a tuple:
    (truncated conversation context, current phase based on the latest session document).
    """
    cursor = db['sessions'].find({"user_id": user_id})
    sessions = list(cursor)[:100]
    if not sessions:
        return None, None

    all_chats_list = []
    for session in sessions:
        phases = session.get("phases", {})
        for phase_name, logs in phases.items():
            if isinstance(logs, list):
                for log in logs:
                    user_prompt = log.get("user_prompt", "")
                    ai_response = log.get("ai_response", "")
                    all_chats_list.append(f"{phase_name} - User: {user_prompt} | AI: {ai_response}")
            else:
                log = logs
                user_prompt = log.get("user_prompt", "")
                ai_response = log.get("ai_response", "")
                all_chats_list.append(f"{phase_name} - User: {user_prompt} | AI: {ai_response}")

    previous_context = " ".join(all_chats_list)
    tokenized_context = tokenize_text(previous_context)
    truncated_tokens = truncate_to_max_tokens(tokenized_context, max_tokens)
    # Use the current phase from the most recent session (sorted by last_updated)
    current_phase = sessions[0].get('current_phase', "Initial Phase")
    return " ".join(truncated_tokens), current_phase

def detokenize_text(tokens):
    return ' '.join(tokens)


def log_session(session_id: str, user_id: str, current_phase: str, prompt: str, response: str, user_situation,
                phase_decision: str):
    """
    Log the conversation session in MongoDB.
    Each session document stores a dictionary with keys for each phase, and each phase is a list of logs.
    """
    phase_log = {
        "user_prompt": prompt,
        "ai_response": response,
        "phase_decision": phase_decision,
        "timestamp": datetime.utcnow().isoformat()
    }
    # Retrieve existing session if any
    existing = db['sessions'].find_one({"_id": session_id})
    if existing and "phases" in existing:
        phases = existing["phases"]
    else:
        phases = {}

    # Append the new log entry to the list for the current phase.
    if current_phase in phases:
        if isinstance(phases[current_phase], list):
            phases[current_phase].append(phase_log)
        else:
            phases[current_phase] = [phases[current_phase], phase_log]
    else:
        phases[current_phase] = [phase_log]

    session_data = {
        "user_id": user_id,
        "current_phase": current_phase,
        "user_situation": user_situation,
        "phases": phases,
        "last_updated": datetime.utcnow()
    }
    result = db['sessions'].update_one({"_id": session_id}, {"$set": session_data}, upsert=True)
    logger.info(
        f"Logged session update for session_id {session_id} in phase {current_phase}. Modified: {result.modified_count}")


def generate_advance_questions(previous_context: str, prompt: str, current_phase: str, user_id: str):
    """
    Generate advance questions (or feedback) relevant to the current phase.
    """
    user_profile = db['profiles'].find_one({'_id': user_id})
    if not user_profile:
        user_profile = {
            "emotional_state": "neutral",
            "current_issue": "none reported",
            "emotional_history": "no prior history available"
        }
    phase_intent = {
        "Initial Phase": "In the Initial Phase, our goal is to gather behavioral insights and establish your baseline. End goal: Comprehensive baseline data.",
        "Intake Phase": "In the Intake Phase, we gather detailed accounts of your current emotional experiences. End goal: Clear understanding of immediate challenges.",
        "Exploratory Inquiry Phase": "In the Exploratory Inquiry Phase, we probe deeper into emotional triggers. End goal: Identify underlying issues.",
        "Scenario Validation Phase": "In the Scenario Validation Phase, we validate your responses with targeted scenarios. End goal: Confirm specific challenges.",
        "Solution Retrieval Phase": "In the Solution Retrieval Phase, we offer actionable strategies. End goal: Provide practical interventions.",
        "Intervention & Follow-Up Phase": "In the Intervention & Follow-Up Phase, we monitor your progress. End goal: Noticeable improvement.",
        "Progress Evaluation Phase": "In the Progress Evaluation Phase, we assess the outcomes of interventions. End goal: Determine effectiveness and plan next steps.",
        "Termination/Closure Phase": "In the Termination/Closure Phase, we conclude the session. End goal: Remind you of recommendations and set a 7-day observation period before the next session.",
        "Crisis Phase": "In the Crisis Phase, your responses indicate severe distress. End goal: Immediately advise seeking in-person help."
    }
    user_situation_text = (
        f"The user has described their emotional state as {user_profile.get('emotional_state', 'neutral')}, "
        f"and is currently dealing with {user_profile.get('current_issue', 'none reported')}. "
        f"Emotional history: {user_profile.get('emotional_history', 'no prior history available')}."
    )
    full_prompt = (
        f"Act as a Therapist and your work is to ask questions to the user in a therapy session.\n\n"
        f"The Phases are as follows:{phase_intent}\n"
        f"You are here to ask question based on Previous Context, Current Phase, Current Phase Intent, User Situation and User Current Answers to last question asked.\n\n"
        f"Make Sure your questions alings with the phase we are in.\n\n"
        f"We need one single question in the advance_question field.\n\n"
        f"Our output should be in JSON format.\n\n"
        f"Our Output should be a single object with key advance_question and value as the question you want to ask.\n\n"
        f"Make Sure your goal is to gather behavioral insights and Intent of the Current Phase.\n\n"
        f"Current Phase : {current_phase} \n"
        f"Current Phase Intent: {phase_intent.get(current_phase, 'Unknown Phase')}\n"
        f"User Situation: {user_situation_text}\n"
        f"Previous Context: {previous_context}\n"
        f"User's Prompt: '{prompt}'\n"
        f"Intent: Craft empathetic advance questions that help clarify your experiences and guide you toward the next phase.\n"
        f"Response Format: ```json\n{{\"advance_question\": \"value\", \"intention\": \"explanation\"}}\n```"
    )
    response = generate_response(full_prompt)
    advance_question = response.get("advance_question", "")
    return advance_question


def generate_follow_up_questions(previous_context: str, prompt: str, current_phase: str, user_id: str):
    """
    Generate follow-up questions based on the current phase.
    """
    user_profile = db['profiles'].find_one({'_id': user_id})
    if not user_profile:
        user_profile = {
            "emotional_state": "neutral",
            "current_issue": "none reported",
            "emotional_history": "no prior history available"
        }
    phase_intent = {
        "Initial Phase": "In the Initial Phase, we focus on understanding your behaviors and emotional patterns.",
        "Intake Phase": "In the Intake Phase, we seek detailed accounts of your recent challenges.",
        "Exploratory Inquiry Phase": "In the Exploratory Inquiry Phase, we probe deeper into your emotional triggers.",
        "Scenario Validation Phase": "In the Scenario Validation Phase, we validate your responses with specific scenarios.",
        "Solution Retrieval Phase": "In the Solution Retrieval Phase, we provide actionable strategies for you.",
        "Intervention & Follow-Up Phase": "In the Intervention & Follow-Up Phase, we follow up on your progress.",
        "Progress Evaluation Phase": "In the Progress Evaluation Phase, we evaluate the outcomes of interventions.",
        "Termination/Closure Phase": "In the Termination/Closure Phase, we offer closure, reminding you of recommendations and setting a 7-day observation period before the next session.",
        "Crisis Phase": "In the Crisis Phase, we advise immediate in-person help due to severe distress."
    }
    user_situation_text = (
        f"The user has described their emotional state as {user_profile.get('emotional_state', 'neutral')}, "
        f"and is currently dealing with {user_profile.get('current_issue', 'none reported')}. "
        f"Emotional history: {user_profile.get('emotional_history', 'no prior history available')}."
    )
    full_prompt = (
        f"Current Phase: {phase_intent.get(current_phase, 'Unknown Phase')}\n"
        f"User Situation: {user_situation_text}\n"
        f"Previous Context: {previous_context}\n"
        f"User's Prompt: '{prompt}'\n"
        f"Intent: Craft empathetic follow-up questions to gather more insights about your experiences and emotional state. "
        f"Encourage open dialogue so you can articulate feelings, triggers, and experiences.\n"
        f"Response Format: ```json\n{{\"follow_up_question\": \"value\", \"intention\": \"explanation\"}}\n```"
    )
    response = generate_response(full_prompt)
    follow_up_question = response.get("follow_up_question", "")
    return follow_up_question


def tokenize_text(text: str):
    return text.split(" ")


def truncate_to_max_tokens(tokens, max_tokens):
    return tokens[:max_tokens]

