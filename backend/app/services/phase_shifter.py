# backend/services/phase_shifter.py
import random
from backend.app.services.llm_connector import generate_response

def analyze_user_situation(prompt: str) -> dict:
    """
    Uses an LLM to analyze the user's latest prompt and extract their emotional state and challenges.
    """
    llm_prompt = (
        f"Analyze the following user response to extract their emotional state, current issue, and emotional history:\n"
        f"User's response: '{prompt}'\n"
        "Return the result as a JSON object, for example:\n"
        "{\"emotional_state\": \"anxious\", \"current_issue\": \"work stress\", \"emotional_history\": \"has felt anxious for months due to workload\"}"
    )
    response = generate_response(llm_prompt)
    try:
        return response if isinstance(response, dict) else {}
    except Exception:
        return {
            "emotional_state": "neutral",
            "current_issue": "none reported",
            "emotional_history": "no prior history available"
        }

def phase_shifter(prev_conversation_log: str, prompt: str, current_phase: str, user_id: str, db, recent_prompt: str,
                  max_tokens: int = 4096) -> (str, dict):
    """
    Uses LLM analysis of the recent prompt to extract the user's situation and decides whether to advance,
    ask more questions, or trigger crisis intervention.

    Returns a tuple of (decision, user_situation), where decision can be:
      - "advance": move to the next phase,
      - "more_questions": probe further, or
      - "crisis": trigger a crisis phase.
    """
    user_situation = analyze_user_situation(recent_prompt)

    phase_intent = {
        "Initial Phase": "In the Initial Phase, we aim to gather behavioral insights and establish a baseline. End goal: Comprehensive baseline data.",
        "Intake Phase": "In the Intake Phase, we gather detailed accounts of the user's current emotional experiences. End goal: Clear understanding of immediate challenges.",
        "Exploratory Inquiry Phase": "In the Exploratory Inquiry Phase, we probe deeper into emotional triggers and psychological factors. End goal: Identification of underlying issues.",
        "Scenario Validation Phase": "In the Scenario Validation Phase, we validate the user's responses with targeted scenarios. End goal: Confirmation of issue specifics.",
        "Solution Retrieval Phase": "In the Solution Retrieval Phase, we provide actionable strategies to manage identified issues. End goal: A set of practical interventions.",
        "Intervention & Follow-Up Phase": "In the Intervention & Follow-Up Phase, we monitor progress and adjust strategies. End goal: Improvement in emotional well-being.",
        "Progress Evaluation Phase": "In the Progress Evaluation Phase, we assess outcomes and effectiveness of interventions. End goal: Determination of progress and planning next steps.",
        "Termination/Closure Phase": "In the Termination/Closure Phase, we offer closure and provide guidelines on what to do before the next session, including a timeframe for observing changes.",
        "Crisis Phase": "In the Crisis Phase, the user's responses indicate severe distress. End goal: Immediately recommend that the user seek in-person help from a physical doctor or crisis intervention service."
    }

    full_prompt_text = (
        f"Previous Context (truncated to {max_tokens} tokens): {prev_conversation_log[:max_tokens]}\n\n"
        f"Current Phase: {phase_intent.get(current_phase, 'Unknown Phase')}\n"
        f"User Situation: The user is described as {user_situation.get('emotional_state', 'unclear')}, "
        f"facing {user_situation.get('current_issue', 'an undefined challenge')}.\n\n"
        "Decision: Based on the user's situation and the goals of the current phase, "
        "should we advance to the next phase, ask more questions, or trigger a crisis intervention? "
        "Provide your decision in JSON format like "
        "decision should always be in within these values advance, more_questions, crisis]" 
        "{\"decision\": \"advance\", \"reason\": \"Explanation\"}."
    )

    response = generate_response(full_prompt_text)
    decision = response.get('final_response', 'advance')
    # Ensure decision is one of the valid options
    if decision not in ["advance", "more_questions", "crisis"]:
        decision = random.choice(["advance", "more_questions"])
    return decision, user_situation
