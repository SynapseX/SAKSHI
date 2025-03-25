# backend/services/phase_shifter.py
import random
from datetime import datetime

from backend.app.services.llm_connector import generate_json_response
from backend.app.services.phase_intent import phase_intent


def analyze_user_situation(prompt: str) -> dict:
    """
    Analyzes the user's prompt to extract their emotional state, current issues, emotional history,
    and identifies the appropriate therapeutic phase for intervention.
    """
    llm_prompt = (
        f"Analyze the following user response to extract their emotional state, current issues, "
        f"emotional history, and determine the appropriate therapeutic phase:\n"
        f"User's response: '{prompt}'\n"
        "Return the result as a JSON object, for example:\n"
        "{\"emotional_state\": \"anxious\", \"current_issues\": \"work stress\", "
        "\"emotional_history\": \"has felt anxious for months due to workload\", "
        "\"therapeutic_phase\": \"stabilization\"}"
    )
    response = generate_json_response(llm_prompt)
    try:
        return response if isinstance(response, dict) else {}
    except Exception:
        return {
            "emotional_state": "neutral",
            "current_issues": "none reported",
            "emotional_history": "no prior history available",
            "therapeutic_phase": "assessment"
        }


def phase_shifter(session, prev_conversation_log: str, prompt: str, current_phase: str, user_id: str, db, recent_question: str,
                  max_tokens: int = 4096) -> (str, dict):
    """
    Uses LLM analysis of the recent prompt to extract the user's situation and decide whether the current
    phase's goals have been met. It then outputs a decision:
      - "advance": The user's responses indicate that the current phase objectives are met.
      - "more_questions": More probing is needed.
      - "crisis": The user's responses indicate severe distress.

    Returns:
        (decision: str, user_situation: dict)
    """
    # Analyze the user's situation from the latest prompt.
    user_situation = analyze_user_situation(prompt)

    # Define detailed phase intents and clear end goals.


    # Construct the improved prompt for phase shifting.
    full_prompt_text = (
        f""" 
                **Context:**  
        You are a structured assistant ensuring a therapist's session remains on track. Your goal is to determine when to shift to the next phase while ensuring all phases are completed before the session ends.  
        
        - **Session Start:** {session['created_at']}  
        - **Session End:** {session['expires_at']}  
        - **Phase End Timing Calculated**: {session['phase_end_times']}
        - **Current Time:** {datetime.utcnow()}  
        - **Phases & Weightage:** {phase_intent}  
        - **Current Phase:** {current_phase}  
        - **User Situation:** {user_situation}
        
        ---
        
        **Decision Process:**  
        1️⃣ **Time-Based Positioning:** Convert the session timeline into a **100-unit scale** and compare the **current phase’s expected time window** with the actual progress.  
        
        2️⃣ **Phase Objective Check:** If the current phase is **not fully resolved**, determine if there's still time to ask more questions.  
        
        3️⃣ **Phase Transition Rules:**  
           - **If the session is behind schedule**, prioritize **efficiency**.  
           - **If time is running out**, advance even if some uncertainty remains.  
           - **If phase objectives are met ahead of time**, advance early.  
        
        4️⃣ **Final Completion Guarantee:** Ensure **no phase is skipped** before the session ends.  
        
        ---
        
        **Decision Guidelines:**  
        - **"advance"** if phase objectives are met and session timing demands it.  
        - **"more_questions"** if phase objectives are unclear and time permits.  
        - **"crisis"** if immediate emotional distress is detected.  
        
        ---
        
        **JSON Output Format:**
        ```json
        {{
          "decision": "more_questions",
          "reason": "User has unresolved concerns, and there is still time available for probing.",
          "chain_of_thought": [
            "Checked current session progress: 35% complete.",
            "Phase 2 ideally should end by 30%, but user responses show uncertainty.",
            "Remaining time allows further exploration without disrupting the session.",
            "Decided to ask more questions."
          ]
        }}

    """)

    # Get the LLM response.`
    response = generate_json_response(full_prompt_text)
    # Extract the decision from the LLM output.
    decision = response.get('decision', 'advance')
    # If the decision is not one of the valid options, fallback to random selection.
    if decision not in ["advance", "more_questions", "crisis"]:
        decision = random.choice(["advance", "more_questions"])

    return decision, user_situation
