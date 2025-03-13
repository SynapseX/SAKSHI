# backend/services/phase_shifter.py
import random
from backend.app.services.llm_connector import generate_response


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
    response = generate_response(llm_prompt)
    try:
        return response if isinstance(response, dict) else {}
    except Exception:
        return {
            "emotional_state": "neutral",
            "current_issues": "none reported",
            "emotional_history": "no prior history available",
            "therapeutic_phase": "assessment"
        }


def phase_shifter(prev_conversation_log: str, prompt: str, current_phase: str, user_id: str, db, recent_question: str,
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
    phase_intent = {
        "Initial Phase": (
            "Goal: Gather foundational insights about your behaviors, emotions, and immediate concerns. "
            "Transition only when the user provides detailed descriptions of their daily emotional patterns."
        ),
        "Intake Phase": (
            "Goal: Collect detailed accounts of recent emotional experiences and stressors. "
            "Advance when the user clearly describes specific events and feelings that capture their current challenges."
        ),
        "Exploratory Inquiry Phase": (
            "Goal: Delve deeper into the underlying causes and triggers of the user's emotions. "
            "Transition when recurring patterns or root causes become evident."
        ),
        "Scenario Validation Phase": (
            "Goal: Validate the user's self-reported issues using targeted scenarios. "
            "Advance when responses consistently confirm the nature and intensity of the challenges."
        ),
        "Solution Retrieval Phase": (
            "Goal: Provide actionable strategies tailored to the user's issues. "
            "Advance when the user understands and acknowledges these interventions."
        ),
        "Intervention & Follow-Up Phase": (
            "Goal: Monitor progress and adjust strategies based on the user's feedback. "
            "Transition when improvements are observed or further adjustment is clearly needed."
        ),
        "Progress Evaluation Phase": (
            "Goal: Assess outcomes of interventions and determine future steps. "
            "Advance when measurable progress or a clear plan for next steps is established."
        ),
        "Termination/Closure Phase": (
            "Goal: Conclude the session by reviewing recommendations, setting a 7-day observation period, "
            "and providing relapse prevention guidance."
        ),
        "Crisis Phase": (
            "Goal: Immediately respond to severe distress. "
            "Trigger this phase if the user's language indicates crisis and an urgent need for in-person help."
        )
    }

    # Construct the improved prompt for phase shifting.
    full_prompt_text = (
        f"Context:\n"
        f"Previous Conversation (truncated to {max_tokens} tokens): {prev_conversation_log[:max_tokens]}\n\n"
        f"Current Phase: {current_phase}\n"
        f"Phase Intent: {phase_intent.get(current_phase, 'No detailed intent provided.')}\n\n"
        f"User Situation: The user is described as having an emotional state of '{user_situation.get('emotional_state', 'unclear')}' "
        f"and facing '{user_situation.get('current_issue', 'an undefined challenge')}'.\n\n"
        f"Last Question Asked: {recent_question}\n"
        f"Latest User Answer: {prompt}\n\n"
        "Decision Task: Evaluate whether the user's latest response and the accumulated conversation history indicate "
        "that the objectives of the current phase have been met. \n"
        "If they have, respond with 'advance' and explain why. \n"
        "If additional probing is needed, respond with 'more_questions' and explain what further information is required. \n"
        "If the response indicates severe distress, respond with 'crisis'.\n\n"
        "Format your answer as a JSON object with keys 'decision' and 'reason', for example: \n"
        "{\"decision\": \"advance\", \"reason\": \"The user provided detailed insights meeting the phase objectives.\"}"
    )

    # Get the LLM response.
    response = generate_response(full_prompt_text)
    # Extract the decision from the LLM output.
    decision = response.get('final_response', 'advance')
    # If the decision is not one of the valid options, fallback to random selection.
    if decision not in ["advance", "more_questions", "crisis"]:
        decision = random.choice(["advance", "more_questions"])

    return decision, user_situation
