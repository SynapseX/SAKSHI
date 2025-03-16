"""
phase_intent.py

This module defines the `phase_intent` object, encapsulating therapy session phases.
Each phase entry includes:
    - intent: A description of the therapeutic objectives for the phase.
    - weightage: The relative importance (in percentage) assigned to the phase.
    - approach: Indicates whether to focus on asking questions, providing statements, or both.
    - examples: Specific questions or statements relevant to the phase.
"""

phase_intent = {
    "Initial Phase": {
        "intent": (
            "Establish rapport and create a safe environment. "
            "Gather preliminary information about the client's emotional baseline, current mood, and general concerns."
        ),
        "weightage": 10,
        "approach": "questions",
        "examples": [
            "What brings you to therapy at this time?",
            "How have you been feeling lately?"
        ]
    },
    "Intake Phase": {
        "intent": (
            "Collect detailed information about the client's presenting issues, history, and context. "
            "Understand the immediate challenges and triggers affecting the client."
        ),
        "weightage": 15,
        "approach": "questions",
        "examples": [
            "Can you tell me more about the challenges you're currently facing?",
            "Have you experienced similar issues in the past?"
        ]
    },
    "Exploratory Inquiry Phase": {
        "intent": (
            "Facilitate a deeper exploration of the client’s thoughts, feelings, and behaviors. "
            "Identify underlying causes and emotional triggers through reflective questioning."
        ),
        "weightage": 20,
        "approach": "questions",
        "examples": [
            "What emotions come up for you when you think about this situation?",
            "How do you typically respond when faced with these feelings?"
        ]
    },
    "Scenario Validation Phase": {
        "intent": (
            "Validate the insights gathered by discussing concrete examples and real-life scenarios. "
            "Ensure the client's self-assessment aligns with observable patterns."
        ),
        "weightage": 10,
        "approach": "questions",
        "examples": [
            "Can you provide an example of when you felt this way?",
            "How did you handle that specific situation?"
        ]
    },
    "Solution Retrieval Phase": {
        "intent": (
            "Introduce and discuss practical strategies and coping mechanisms tailored to the client's needs. "
            "Collaboratively identify actionable steps and interventions."
        ),
        "weightage": 15,
        "approach": "statements",
        "examples": [
            "Together, we can develop strategies that suit your unique situation.",
            "Implementing tailored coping mechanisms can enhance your well-being."
        ]
    },
    "Intervention & Follow-Up Phase": {
        "intent": (
            "Support the client in implementing agreed-upon interventions while monitoring their progress. "
            "Provide ongoing guidance, feedback, and adjustments as needed."
        ),
        "weightage": 15,
        "approach": "both",
        "examples": [
            "How have the strategies we've discussed been working for you?",
            "It's normal to adjust strategies as we learn what works best."
        ]
    },
    "Progress Evaluation Phase": {
        "intent": (
            "Assess the effectiveness of interventions by reviewing measurable outcomes and gathering client feedback. "
            "Determine if therapeutic objectives have been met and plan next steps."
        ),
        "weightage": 10,
        "approach": "questions",
        "examples": [
            "What changes have you noticed since we started implementing these strategies?",
            "Do you feel that you're moving closer to your goals?"
        ]
    },
    "Termination/Closure Phase": {
        "intent": (
            "Summarize insights and progress made throughout the therapy process. "
            "Offer clear recommendations and relapse prevention strategies for a smooth transition out of active therapy."
        ),
        "weightage": 3,
        "approach": "statements",
        "examples": [
            "You've made remarkable progress, and it's been a privilege to work with you.",
            "Remember, the skills you've developed will support you moving forward."
        ]
    },
    "Crisis Phase": {
        "intent": (
            "Respond immediately to signs of severe distress or potential danger. "
            "Provide urgent, empathetic support and direct the client to appropriate crisis intervention resources."
        ),
        "weightage": 2,
        "approach": "both",
        "examples": [
            "Are you feeling safe at this moment?",
            "Your safety is our top priority."
        ]
    }
}
