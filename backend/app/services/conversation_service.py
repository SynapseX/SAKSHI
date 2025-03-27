# backend/services/conversation_service.py
import json
import random
from datetime import datetime
import logging

from backend.app.services.llm_connector import generate_json_response, create_prompt
from backend.app.services.mongodb_service import db
from backend.app.services.phase_intent import phase_intent
from backend.app.services.phase_shifter import phase_shifter
from backend.app.services.session_manager import SessionManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

session_manager = SessionManager()
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
    previous_context, current_phase = analyze_previous_chats(session_id, max_tokens)
    session = session_manager.get_session(session_id)
    if not previous_context:
        logger.info(f"No previous context found for user: {user_id}. Starting Initial Phase.")
        current_phase = "Initial Phase"
        previous_context = ""

    logger.info(f"Processing prompt for user {user_id} in {current_phase}: {prompt}")

    # Phase shifting decision based on previous context and latest prompt.
    phase_decision, user_situation = phase_shifter(session, previous_context, prompt, current_phase, user_id, db, recent_question, max_tokens)

    if phase_decision == "advance":
        next_phase = get_next_phase(current_phase)
        advance_questions = generate_advance_questions(previous_context, prompt, current_phase, user_id)

        # Update current_phase to next_phase in the log
        log_session(session_id, user_id, next_phase, prompt, advance_questions, user_situation, phase_decision)

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


def analyze_previous_chats(session_id: str, max_tokens: int):
    """
    Retrieve and analyze previous conversations from MongoDB to create context for the current session.
    Aggregates conversation logs from each phase (stored as lists) and returns a tuple:
    (truncated conversation context, current phase based on the latest session document).
    """
    session = session_manager.get_session(session_id)
    if not session:
        return None, None

    all_chats_list = []
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
    current_phase = session.get('current_phase', "Initial Phase")
    return " ".join(truncated_tokens), current_phase


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
    existing = session_manager.get_session(session_id)
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
    result = session_manager.upsert_session(session_id, session_data)
    logger.info(
        f"Logged session update for session_id {session_id} in phase {current_phase}")


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


    user_situation_text = (
        f"The user has described their emotional state as {user_profile.get('emotional_state', 'neutral')}, "
        f"and is currently dealing with {user_profile.get('current_issue', 'none reported')}. "
        f"Emotional history: {user_profile.get('emotional_history', 'no prior history available')}."
    )
    full_prompt = (
       f"""
        Act as an AI therapist guiding a client through a structured session. Your task is to generate one empathetic advance question that bridges the client’s current emotional state to the next phase, addresses any potential resistance or ambiguity, and reinforces the session's objectives.
        
        **Inputs Provided:**
        - **Current Phase:** {current_phase}
        - **Phase** : {phase_intent}
        - **Phase Intent:** {phase_intent.get(current_phase, 'Unknown Phase')}
        - **User Situation:** {user_situation_text}  
          *(Example: "The user has described their emotional state as neutral, is currently dealing with none reported, and has no prior history available.")*
        - **Previous Context:** {previous_context}
        - **User's Prompt:** '{prompt}'
        
        **NOTE** : SHOULD FOLLOW THE Phase Intent Approach it can Either be Questions, Statements, Both. 
        
        Chain-of-Thought Reasoning:
        1. **Context Analysis:** Examine the previous conversation and the client's most recent prompt to identify key emotional cues and any gaps or resistance in their narrative.
        2. **Phase Alignment:** Reflect on the goals of the current phase—what is the next piece of information needed to ensure progress towards the phase objectives?
        3. **Resistance & Ambiguity Check:** Identify any subtle signs of hesitation, lack of clarity, or resistance that need to be addressed.
        4. **Bridging the Gap:** Formulate a question that not only deepens self-reflection but also helps transition the client toward the objectives of the next phase.
        5. **Empathy & Clarity:** Ensure the question is open-ended, empathetic, and encourages further elaboration on their experiences.
        
        Task:
        Generate one advance question/statement based on the above Current Phase examples, intent, goal.
                    
        **Methodology:**
        1. Under follow-up-question, provide the value strictly as per the format specified in the Approach. 
            a. If the Approach says Questions then provide a question.
            b. If the Approach says Statements then provide a statement.
            c. If the Approach says Both Then provide Both a question and a statement.
            d. If the Approach says question and still there is a question from user in user prompt then you need address the question first by providing an answer and following up with a question.
        2. Under intention, provide a brief explanation of why this question/statement is appropriate, how it addresses potential resistance or ambiguity, and how it aligns with the current phase. 
        
        Response Format:
        Please provide your final answer in JSON format with the following keys:
        - "advance_statement": (The advance question/statement based on the Phase Intent Approach you generated) Strictly its a String. 
        - "intention": (A brief explanation of why this question/statement is appropriate and how it bridges the client's current state with the next phase)
        
        Example Output:
        ```json
        {{
          "advance_statement": "Can you describe a recent experience where you sensed a shift in your emotions, and what do you think contributed to that change?",
          "intention": "This question invites deeper reflection on the client's recent emotional shifts, clarifies any ambiguity, and helps transition them toward the next phase by addressing gaps in understanding.",
        }}
        ```
       """
    )
    response = generate_json_response(full_prompt)
    advance_statement = response.get("advance_statement", "")
    return advance_statement


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
    user_situation_text = (
        f"The user has described their emotional state as {user_profile.get('emotional_state', 'neutral')}, "
        f"and is currently dealing with {user_profile.get('current_issue', 'none reported')}. "
        f"Emotional history: {user_profile.get('emotional_history', 'no prior history available')}."
    )
    full_prompt = (
        f"""
        Act as an AI therapist engaged in a structured session with a client. Your task is to generate one empathetic follow-up question that not only deepens the client's self-reflection but also addresses any possible resistance or ambiguity in their responses. Additionally, if the user asks any questions, provide a thoughtful and supportive answer. Ensure that your inquiry is aligned with the current phase's goals, helps clarify the client's emotions, and checks for any signs of distress.
            
            **Inputs Provided:**
            - **Current Phase:** {current_phase}
            - **Phase** : {phase_intent}
            - **Phase Intent:** {phase_intent.get(current_phase, 'Unknown Phase').get('intent', 'Unknown Intent')}
            - **Approach**: {phase_intent.get(current_phase, {}).get("approach", "questions")}
            - **User Situation:** {user_situation_text}  
            - **(Example: "The user has described their emotional state as neutral, is currently dealing with none reported, and has no prior history available.")*
            - **Previous Context:** {previous_context}
            - **User's Prompt:** '{prompt}'
            
            **Task:**
            Generate one follow-up question/statement based on the above details that the client has shared, the current phase's intent, and the need to address potential resistance or ambiguity. If the user asks any questions, provide a thoughtful and supportive answer.
            
            **Methodology:**
            1. Under follow-up-question, provide the value strictly as per the format specified in the Approach. 
                a. If the Approach says Questions then provide a question.
                b. If the Approach says Statements then provide a statement.
                c. If the Approach says Both Then provide Both a question and a statement.
                d. If the Approach says question and still there is a question from user in user prompt then you need address the question first by providing an answer and following up with a question.
            2. Under intention, provide a brief explanation of why this question/statement is appropriate, how it addresses potential resistance or ambiguity, and how it aligns with the current phase. 
            **Response Format:**
            Please provide your final answer in JSON format with the following keys:
            - `"follow_up_question"`: The follow-up question/statement based on Approach. Strictly its a String.
            - `"intention"`: A brief explanation of why this question/statement is appropriate, how it addresses potential resistance or ambiguity, and how it aligns with the current phase.
            
            **Example Output:**
            ```json
            {{
              "follow_up_statement": "Can you tell me more about what you experienced when you mentioned feeling uncertain about your emotions, and what you think might be causing that uncertainty?",
              "intention": "This question is designed to explore potential ambivalence in the client's response, encouraging deeper reflection on their emotional state and underlying causes, which is essential for progressing in the current phase.",
            }}
            ```
        """
    )
    response = generate_json_response(full_prompt)
    follow_up_statement = response.get("follow_up_statement", "")
    return follow_up_statement


def tokenize_text(text: str):
    return text.split(" ")

def detokenize_text(tokens):
    return ' '.join(tokens)

def truncate_to_max_tokens(tokens, max_tokens):
    return tokens[:max_tokens]

