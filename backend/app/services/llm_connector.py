# backend/services/llm_connector.py
import os
import json
from google import genai

# Load API Key from environment variable
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def create_prompt(previous_context: str, user_response: str, therapist_response: str) -> str:
    """
    Creates a full prompt for the LLM based on the previous context and the new prompt.
    """
    return (
        "You are an empathetic therapy assistant who helps users gain self-awareness and manage stress. "
        "Your goal is to analyze the user's previous sessions and current input using a chain-of-thought process, "
        "and then produce actionable, concise feedback (e.g., mindfulness exercises, journaling recommendations).\n\n"
        "Instructions: Think step-by-step about the user's context. First, list your reasoning, then produce a final, concise, actionable response.\n\n"
        f"Context from Previous Sessions:\n{previous_context}\n\n"
        f"User's New Prompt:\n{user_response}\n\n"
        f"Therapist Response:\n{therapist_response}\n\n"
        "Format your answer as a JSON object with two keys: 'chain_of_thought' and 'final_response'."
    )

def generate_json_response(full_prompt: str) -> dict:
    """
    Generates an LLM response using Google Gemini with chain-of-thought reasoning.
    Returns a JSON object with keys: 'chain_of_thought' and 'final_response'.
    """
    response = client.models.generate_content(model='gemini-2.0-flash', contents=full_prompt)
    try:
        value = response.text.strip().strip('```').strip('json').strip()
        result = json.loads(value)
        return result
    except Exception as e:
        return {
            "chain_of_thought": "",
            "final_response": f"Error parsing response: {str(e)}. Raw output: {value}"
        }

def generate_response(prompt: str) -> str:
    """
    Generates an LLM response using Google Gemini.
    """
    response = client.models.generate_content(model='gemini-2.0-flash', contents=prompt)
    return response.text