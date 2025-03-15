import os

import requests
import json
import time
import random
import uuid
from datetime import datetime
from fpdf import FPDF
from google import genai

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Configuration
BASE_URL = "http://localhost:8000"  # Adjust as needed
PROMPT_ENDPOINT = f"{BASE_URL}/prompt"

# Updated user & session values
USER_ID = "076b1af1-97a1-4b7f-982a-f6363bd0bd93"
SESSION_ID = str(uuid.uuid4())

# Define an array of critic personalities
CRITIC_PERSONALITIES = [
    {
        "name": "Analytical Critic",
        "tone": "analytical",
        "speaking_style": "precise and methodical",
        "issue": "Focuses on details, logical evaluation, and structured reasoning."
    },
    {
        "name": "Empathetic Critic",
        "tone": "empathetic",
        "speaking_style": "gentle and reflective",
        "issue": "Prioritizes emotional understanding, reflective listening, and support."
    },
    {
        "name": "Cynical Critic",
        "tone": "cynical",
        "speaking_style": "sarcastic and blunt",
        "issue": "Challenges assumptions, questions inconsistencies, and offers a skeptical view."
    },
    {
        "name": "Encouraging Critic",
        "tone": "encouraging",
        "speaking_style": "optimistic and supportive",
        "issue": "Highlights strengths, motivates improvement, and provides constructive feedback."
    }
]


# Provided LLM response method using Google Gemini.
def generate_response(full_prompt: str) -> dict:
    """
    Generates an LLM response using Google Gemini with chain-of-thought reasoning.
    Returns a JSON object with keys: 'chain_of_thought' and 'final_response'.
    """
    try:
        response = client.models.generate_content(model='gemini-2.0-flash', contents=full_prompt)
        value = response.text.strip().strip('```').strip('json').strip()
        result = json.loads(value)
        return result
    except Exception as e:
        return {
            "Error": "",
            "final_response": f"Error parsing response: {str(e)}. Raw output: {value}"
        }


class Critic:
    def __init__(self, user_id, session_id, personality=None):
        self.user_id = user_id
        self.session_id = session_id
        # Randomly select a personality if none is provided.
        self.personality = personality or random.choice(CRITIC_PERSONALITIES)
        self.conversation_log = []  # List to hold each conversation turn.
        self.iteration = 1

    def get_conversation_history(self) -> str:
        """
        Compile the conversation history as a string.
        """
        history_lines = []
        for turn in self.conversation_log:
            line = (
                f"Timestamp: {turn['timestamp']}\n"
                f"Critic Prompt: {turn['critic_prompt']}\n"
                f"App Response: {turn['app_response']}\n"
                "-----------------------"
            )
            history_lines.append(line)
        return "\n".join(history_lines) if history_lines else "No previous history available."

    def build_explanation_prompt(self) -> str:
        """
        Build a complete scenario explanation prompt to instruct the LLM.
        This includes personality details, conversation history, and instructions
        to generate a text that can be sent via HTTP.
        """
        history = self.get_conversation_history()
        prompt = (
            f"You are acting as a evaluator who is disguised as a victim from an association to test the Therapist."
            f"You are disguised as a patient to the therapist. You need to answer questions from the therapist for evaluating the therapist."
            f"You are with the personality of {self.personality['name']} "
            f"({self.personality['speaking_style']}, {self.personality['tone']}).\n\n"
            f"Your task is to evaluate a therapist's performance. \n\n"
            f"{'You have the following conversation history: \n'+history if history != 'No previous history available.' else 'You have the following conversation history: Therapist: Hi how are you, What brings you here.'}\n\n"
            "Based on this complete scenario, generate a answer to the question asked else strike a conversation that the therapist would have with you."
            f"""Strictly follow the output format ```json {{"chain_of_thought": "...", "final_response": "..."}}```. Do Not add any extra infomration"""
        )
        return prompt

    def generate_critic_message(self) -> str:
        """
        Uses the generate_response method to have the LLM generate a critic message,
        based on the complete scenario explanation.
        """
        explanation_prompt = self.build_explanation_prompt()

        for _ in range(3):
            llm_result = generate_response(explanation_prompt)
            if isinstance(llm_result, dict) and "Error" not in llm_result:
                break
        else:
            llm_result = {"final_response": "No valid response generated after 3 attempts."}

        # Use the final_response as the generated text.
        generated_text = llm_result.get("final_response", "").strip()
        # If for some reason no text is generated, default to a simple probing question.
        if not generated_text:
            generated_text = f"{self.personality['name']} (Iteration {self.iteration}): Please provide a probing question for further evaluation."
        return generated_text

    def send_prompt(self, prompt_text: str) -> dict:
        """
        Sends the given prompt text to the API via a POST request.
        Includes the conversation history for context.
        Falls back to generate_response if the HTTP request fails.
        """
        payload = {
            "user_id": self.user_id,
            "session_id": self.session_id,
            "prompt": prompt_text,
            "previous_prompt": self.get_conversation_history()
        }
        try:
            response = requests.post(PROMPT_ENDPOINT, json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"HTTP request failed: {e}. Falling back to local LLM generation.")
            full_prompt = f"{self.get_conversation_history()}\n{prompt_text}"
            llm_result = generate_response(full_prompt)
            return {
                "chain_of_thought": llm_result.get("chain_of_thought", ""),
                "final_response": llm_result.get("final_response", "No response generated.")
            }

    def log_turn(self, critic_prompt: str, app_response: str):
        """
        Logs one turn of conversation with timestamp.
        """
        turn = {
            "timestamp": datetime.utcnow().isoformat(),
            "critic_prompt": critic_prompt,
            "app_response": app_response
        }
        self.conversation_log.append(turn)
        with open("conversation_log_phase_slower.json", "a") as f:
            f.write(json.dumps(turn) + "\n")

    def generate_pdf_report(self, pdf_filename="conversation_report.pdf"):
        """
        Generates a PDF report of the entire conversation log.
        """
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt="Conversation Report", ln=True, align='C')
        pdf.ln(10)
        for turn in self.conversation_log:
            pdf.multi_cell(0, 10, txt=f"Timestamp: {turn['timestamp']}")
            pdf.multi_cell(0, 10, txt=f"Critic Prompt: {turn['critic_prompt']}")
            pdf.multi_cell(0, 10, txt=f"App Response: {turn['app_response']}")
            pdf.ln(5)
        pdf.output(pdf_filename, 'F', encoding='utf-8')
        print(f"PDF report generated: {pdf_filename}")

    def start_conversation(self):
        """
        Starts the conversation loop.
        In each iteration, the critic explains the complete scenario to the LLM (via generate_response)
        to generate a text prompt. That text is sent to the API. The response (including conversation history)
        is logged, and the process repeats until the LLM indicates a final rating.
        """
        while True:
            # Generate critic message via LLM based on complete scenario.
            critic_message = self.generate_critic_message()
            print(f"Iteration {self.iteration} - Sending prompt:\n{critic_message}\n")

            # Send the generated prompt to the API.
            response_json = self.send_prompt(critic_message)
            # Determine what to log from the API response.
            response_to_log = response_json.get("final_response") or response_json.get(
                "follow_up_question") or json.dumps(response_json)
            self.log_turn(critic_message, response_to_log)

            # Check if the generated critic message or API response indicates a final rating.
            # if "FINAL_RATING:" in critic_message or "FINAL_RATING:" in response_to_log:
            #     print("Final rating detected. Ending conversation.")
            #     break

            time.sleep(2)  # Simulate pacing between turns.
            self.iteration += 1

        # Generate final PDF report after conversation ends.
        self.generate_pdf_report()


if __name__ == "__main__":
    critic = Critic(USER_ID, SESSION_ID)
    critic.start_conversation()
