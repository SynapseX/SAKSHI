# backend/services/phase_shifter.py
import random
from backend.app.services.llm_connector import generate_response
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


    # Construct the improved prompt for phase shifting.
    full_prompt_text = (
        f""" Context:
            Previous Conversation: {prev_conversation_log}
            
            Current Phase: {current_phase}
            Phases : {phase_intent}
            Phase Intent: {phase_intent.get(current_phase, 'No detailed intent provided.')}
            User Situation: The client is described as having an emotional state of '{user_situation.get('emotional_state', 'unclear')}' and facing '{user_situation.get('current_issue', 'an undefined challenge')}'. Consider also the client's emotional history and recurring patterns observed over multiple sessions.
            Last Question Asked: {recent_question}
            Latest User Answer: {prompt}
            
            Additional Context:
            - The client has participated in multiple sessions addressing key emotional themes.
            - While some progress is noted, there may be inconsistencies, hesitations, or isolated unresolved issues that could indicate incomplete processing.
            - The objective is to remain in the current phase until there is overwhelming, repeated, and unambiguous evidence (across several sessions) that every element of the phase objectives is fully resolved.
            - Even a single instance of lingering ambiguity, hesitation, or minor unresolved issues should prompt further probing rather than a phase transition.
            - Your role is to act as a supportive assistant to the therapist, ensuring that the client’s progress is sustained and comprehensive, not just momentarily clear.
            
            Chain-of-Thought Reasoning:
            1. **Thorough Emotional Evaluation:**
               - Examine the client's latest response for clear, deep, and consistent emotional processing.
               - Compare with prior sessions to confirm repeated demonstrations of insight and resolution.
            2. **Robust Phase Verification:**
               - Confirm that every component of the current phase’s intent has been addressed thoroughly and repeatedly.
               - Identify any lingering doubts, inconsistencies, or unresolved issues, no matter how minor.
            3. **Deliberate Caution Against Premature Transition:**
               - Even if a positive response is observed, check for any signs of partial resolution or residual hesitation.
               - Do not advance if even one element remains ambiguous or inconsistently addressed across sessions.
            4. **Targeted Probing for Full Resolution:**
               - If any gaps or uncertainties exist, generate probing questions that explicitly target these areas to drive further clarification.
            5. **Safety and Stability Confirmation:**
               - Continuously monitor for any signs of distress or instability; any such signals demand continued probing.
            
            ---
            Decision Task:
            - **Advance:**  
              Recommend a phase transition **only if** there is overwhelming, repeated, and unequivocal evidence that every aspect of the current phase’s objectives has been completely resolved. This requires:
              - Multiple sessions in which the client consistently demonstrates deep emotional processing and clear, sustained behavioral change.
              - No isolated instances of hesitation, ambiguity, or partial resolution—every signal must confirm complete resolution.
              - If the evidence is robust and unambiguous, the decision to advance is appropriate.
              - If the client's responses are consistently clear, insightful, and fully aligned with the phase objectives, consider advancing.
              - If there is more than 2 questions in a single phase then consider advancing.
              
            - **More Questions:**  
              If there is even a single instance of lingering ambiguity, hesitation, or partial resolution in any response—even if most responses are positive—continue to ask additional, targeted probing questions. This ensures:
              - Every element of the phase’s objectives is fully addressed before moving on.
              - The therapist remains in the current phase to foster comprehensive and stable progress.
              
            - **Crisis:**  
              Immediately indicate a crisis if clear and serious signs of distress or risk are detected. This includes:
              - Direct signals of acute emotional instability, such as expressions of self-harm, overwhelming panic, or severe despair.
              - Any behavior that suggests immediate danger to the client’s safety, regardless of phase progress.
            
            Instructions:
            Please provide your final answer in JSON format with the following keys:
            - "decision": (choose one of "advance", "more_questions", or "crisis")
            - "reason": (a concise explanation of your decision, clearly referencing the need for repeated, unambiguous evidence before advancing, or the presence of even minor ambiguities)
            - "chain_of_thought": (a detailed bullet-point list outlining each step of your reasoning process, explicitly stating why any lingering issues necessitate further exploration)
            
            Example Output:
            ```json
            {{
              "decision": "more_questions",
              "reason": "Although there is some positive evidence, multiple sessions reveal isolated ambiguities and minor unresolved issues. The evidence is not yet robust and repeated enough to confirm full resolution, so further probing is required.",
              "chain_of_thought": "- Analyzed recent response for emotional clarity; - Compared with previous sessions and found intermittent inconsistencies; - Noted isolated instances of hesitation; - Determined that not all phase objectives have been fully and repeatedly met; - Chose 'more_questions' to ensure complete resolution."
            }}
            ```
    """)

    # Get the LLM response.`
    response = generate_response(full_prompt_text)
    # Extract the decision from the LLM output.
    decision = response.get('decision', 'advance')
    # If the decision is not one of the valid options, fallback to random selection.
    if decision not in ["advance", "more_questions", "crisis"]:
        decision = random.choice(["advance", "more_questions"])

    return decision, user_situation
