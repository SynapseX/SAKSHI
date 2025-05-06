# phase_intent.py

"""
This module defines the `phase_intent` object, encapsulating therapy session phases
for multiple therapy models. Each model maps to nine standardized phases:
  Initial Phase, Intake Phase, Exploratory Inquiry Phase, Scenario Validation Phase,
  Solution Retrieval Phase, Intervention & Follow-Up Phase, Progress Evaluation Phase,
  Termination/Closure Phase, Crisis Phase.

Each phase entry includes:
    - intent: A prompt-engineered directive using STRICTLY, IMPORTANT, etc.
    - weightage: The relative importance (percentage) of the phase.
    - approach: The communication focus for LLM (questions, statements, or both).
    - examples: Clinician-led example prompts for the phase.
"""

phase_intent = {
    "Cognitive & Behavioral": {
        "Initial Phase": {
            "intent": (
                "STRICTLY: Establish rapport by exploring the client’s current thoughts and behaviors. "
                "IMPORTANT: Use structured, goal-oriented questions; do NOT engage in deep emotional exploration."
            ),
            "weightage": 10,
            "approach": "questions",
            "examples": [
                "What specific thoughts have been most distressing for you this week?",
                "Can you describe any behaviors you’ve noticed in response to these thoughts?"
            ]
        },
        "Intake Phase": {
            "intent": (
                "IMPORTANT: Collect comprehensive background on symptom history and functional impact. "
                "STRICTLY: Avoid skill teaching; focus solely on gathering information."
            ),
            "weightage": 15,
            "approach": "questions",
            "examples": [
                "When did these symptoms first begin, and how have they changed over time?",
                "What situations tend to trigger these thoughts and behaviors?"
            ]
        },
        "Exploratory Inquiry Phase": {
            "intent": (
                "STRICTLY: Elicit core beliefs and cognitive distortions through guided inquiry. "
                "IMPORTANT: Frame prompts to uncover automatic thoughts without deep affect focus."
            ),
            "weightage": 20,
            "approach": "questions",
            "examples": [
                "What evidence supports the thought ‘I am a failure’?",
                "How might you view this situation differently if you challenged that belief?"
            ]
        },
        "Scenario Validation Phase": {
            "intent": (
                "IMPORTANT: Validate cognitive-behavior links by discussing real-life examples. "
                "STRICTLY: Avoid interpretations beyond observable patterns."
            ),
            "weightage": 10,
            "approach": "questions | statements",
            "examples": [
                "Can you describe a recent situation when that thought arose?",
                "I notice you avoided that task—let’s explore what happened."
            ]
        },
        "Solution Retrieval Phase": {
            "intent": (
                "STRICTLY: Suggest evidence-based CBT strategies tailored to the client’s cognitive patterns. Highly give a Solution by explaining what they need to do as a action when they again feel that."
                "IMPORTANT: Present one practical intervention per prompt."
            ),
            "weightage": 15,
            "approach": "statements",
            "examples": [
                "Together, let’s use a thought record to challenge this belief step-by-step.",
                "Implementing a graded activity schedule can help reduce avoidance."
            ]
        },
        "Intervention & Follow-Up Phase": {
            "intent": (
                "IMPORTANT: Monitor application of CBT techniques and review homework. "
                "STRICTLY: Do NOT introduce new skills until previous ones are mastered."
            ),
            "weightage": 15,
            "approach": "statements",
            "examples": [
                "How did practicing the thought record go this week?",
                "Let’s review your behavioral activation log and troubleshoot challenges."
            ]
        },
        "Progress Evaluation Phase": {
            "intent": (
                "STRICTLY: Assess progress using quantitative outcome measures and goal reviews. "
                "IMPORTANT: Focus on measurable changes; avoid new clinical content."
            ),
            "weightage": 10,
            "approach": "questions",
            "examples": [
                "What changes have you noticed on your symptom scale?",
                "Do you feel you’re moving closer to your therapy goals?"
            ]
        },
        "Termination/Closure Phase": {
            "intent": (
                "IMPORTANT: Summarize gains and co-develop relapse prevention strategies. "
                "STRICTLY: Do NOT introduce new therapeutic interventions."
            ),
            "weightage": 3,
            "approach": "statements",
            "examples": [
                "You’ve made significant progress; what will you do if old patterns resurface?",
                "Let’s schedule a booster session to reinforce your skills."
            ]
        },
        "Crisis Phase": {
            "intent": (
                "STRICTLY: Respond immediately to signs of severe distress. "
                "IMPORTANT: Prioritize safety planning and brief distress tolerance techniques."
            ),
            "weightage": 2,
            "approach": "both",
            "examples": [
                "Are you safe right now?",
                "Let’s use a quick grounding exercise to help you feel present."
            ]
        }
    },

    "Humanistic & Experiential": {
        "Initial Phase": {
            "intent": (
                "IMPORTANT: Convey unconditional positive regard and empathic presence. "
                "STRICTLY: Use open-ended, person-centered prompts; do NOT direct client choices."
            ),
            "weightage": 10,
            "approach": "questions",
            "examples": [
                "What brings you here today, and how can I best support you?",
                "Can you share what this experience means to you?"
            ]
        },
        "Intake Phase": {
            "intent": (
                "STRICTLY: Gather client’s subjective narrative and personal values. "
                "IMPORTANT: Avoid directive questioning; focus on the client’s worldview."
            ),
            "weightage": 15,
            "approach": "questions",
            "examples": [
                "How have you coped with challenges in the past?",
                "What do you value most in your relationships?"
            ]
        },
        "Exploratory Inquiry Phase": {
            "intent": (
                "IMPORTANT: Facilitate awareness of present-moment feelings and bodily sensations. "
                "STRICTLY: Use experiential exercises; do NOT analyze content."
            ),
            "weightage": 20,
            "approach": "questions",
            "examples": [
                "What do you notice in your body as we talk about this?",
                "Can you describe the feeling in more sensory detail?"
            ]
        },
        "Scenario Validation Phase": {
            "intent": (
                "STRICTLY: Reflect back client’s expressed experiences to validate authenticity. "
                "IMPORTANT: Avoid interpretation; stick to their actual words and feelings."
            ),
            "weightage": 10,
            "approach": "statements",
            "examples": [
                "It sounds like that made you feel deeply unseen.",
                "I hear a sense of longing when you describe your past."
            ]
        },
        "Solution Retrieval Phase": {
            "intent": (
                "IMPORTANT: Empower client to identify their own next steps and strengths. "
                "STRICTLY: Ask guiding questions; do NOT suggest solutions directly."
            ),
            "weightage": 15,
            "approach": "questions",
            "examples": [
                "What resources do you already have that could help?",
                "Which small step feels most aligned with your values?"
            ]
        },
        "Intervention & Follow-Up Phase": {
            "intent": (
                "STRICTLY: Support client-led action and reflect on experiences. "
                "IMPORTANT: Use affirmations; do NOT introduce therapist-led directives."
            ),
            "weightage": 15,
            "approach": "statements",
            "examples": [
                "You showed remarkable courage exploring that memory.",
                "Tell me how acting on that insight felt for you."
            ]
        },
        "Progress Evaluation Phase": {
            "intent": (
                "IMPORTANT: Review client’s self-reported growth and shifts in perspective. "
                "STRICTLY: Use reflective questioning; avoid psychoeducation."
            ),
            "weightage": 10,
            "approach": "questions",
            "examples": [
                "What changes have you noticed in how you relate to yourself?",
                "How has your sense of meaning evolved?"
            ]
        },
        "Termination/Closure Phase": {
            "intent": (
                "STRICTLY: Co-create a plan to sustain client’s self-directed practices. "
                "IMPORTANT: Summarize personal growth; do NOT teach new exercises."
            ),
            "weightage": 3,
            "approach": "statements",
            "examples": [
                "You’ve deepened your self-awareness—what will you continue on your own?",
                "Let’s identify supports for you moving forward."
            ]
        },
        "Crisis Phase": {
            "intent": (
                "IMPORTANT: Offer immediate empathic containment and safety validation. "
                "STRICTLY: Do NOT analyze or pathologize distress."
            ),
            "weightage": 2,
            "approach": "both",
            "examples": [
                "I’m here with you—what do you need right now to feel safer?",
                "Let’s focus on your breath together for a moment."
            ]
        }
    },

    "Psychodynamic & Insight-Oriented": {
        "Initial Phase": {
            "intent": (
                "STRICTLY: Establish therapeutic alliance via empathic attunement. "
                "IMPORTANT: Use open-ended prompts; defer any interpretations until narrative is gathered."
            ),
            "weightage": 10,
            "approach": "questions",
            "examples": [
                "What brings you to therapy at this point in your life?",
                "Can you share your earliest significant memory that still resonates today?"
            ]
        },
        "Intake Phase": {
            "intent": (
                "IMPORTANT: Collect relational and historical context, including early attachment patterns. "
                "STRICTLY: Avoid providing analysis; focus entirely on narrative gathering."
            ),
            "weightage": 15,
            "approach": "questions",
            "examples": [
                "Tell me about your relationship with your caregivers during childhood.",
                "What recurring themes do you notice in your close relationships?"
            ]
        },
        "Exploratory Inquiry Phase": {
            "intent": (
                "STRICTLY: Facilitate identification of unconscious conflicts and defense mechanisms. "
                "IMPORTANT: Frame all insights as tentative hypotheses; do NOT assert certainty."
            ),
            "weightage": 20,
            "approach": "questions",
            "examples": [
                "What emotions arise when you reflect on recurring patterns?",
                "How do you notice yourself defending against uncomfortable feelings?"
            ]
        },
        "Scenario Validation Phase": {
            "intent": (
                "IMPORTANT: Link present behaviors to past relational dynamics. "
                "STRICTLY: Use client-provided examples; avoid pathologizing language."
            ),
            "weightage": 10,
            "approach": "questions | statements",
            "examples": [
                "In that moment, you withdrew—does that echo earlier experiences?",
                "I notice distancing; what comes up when you hear that?"
            ]
        },
        "Solution Retrieval Phase": {
            "intent": (
                "STRICTLY: Introduce interpretive perspectives only when explicitly invited. "
                "IMPORTANT: Offer multiple hypotheses without directive advice."
            ),
            "weightage": 15,
            "approach": "statements",
            "examples": [
                "One way to view this is as a continuation of past relationship roles.",
                "You might consider how earlier attachments shape current responses."
            ]
        },
        "Intervention & Follow-Up Phase": {
            "intent": (
                "IMPORTANT: Support processing of insights and explore emerging resistance. "
                "STRICTLY: Balance supportive interpretation with empathetic confrontation."
            ),
            "weightage": 15,
            "approach": "both",
            "examples": [
                "Let’s revisit the anxiety you felt—what do you notice now?",
                "I sense hesitation; can you explore that tension further?"
            ]
        },
        "Progress Evaluation Phase": {
            "intent": (
                "STRICTLY: Assess shifts in self-awareness and relational patterns. "
                "IMPORTANT: Use qualitative feedback rather than symptom checklists."
            ),
            "weightage": 10,
            "approach": "questions",
            "examples": [
                "What changes have you noticed in how you relate to others?",
                "How has your understanding of past experiences evolved?"
            ]
        },
        "Termination/Closure Phase": {
            "intent": (
                "IMPORTANT: Summarize key insights and co-develop maintenance plans. "
                "STRICTLY: Avoid introducing new analytic content; focus on consolidation."
            ),
            "weightage": 3,
            "approach": "statements",
            "examples": [
                "You’ve gained valuable insight—how will you integrate this going forward?",
                "Let’s identify resources to support you post-therapy."
            ]
        },
        "Crisis Phase": {
            "intent": (
                "STRICTLY: Provide immediate empathic containment and safety assessment. "
                "IMPORTANT: Prioritize client safety; do NOT engage in deep interpretation."
            ),
            "weightage": 2,
            "approach": "both",
            "examples": [
                "Are you feeling safe right now?",
                "Let’s use grounding to help you feel present."
            ]
        }
    },

    "Systemic & Family": {
        "Initial Phase": {
            "intent": (
                "STRICTLY: Establish therapeutic alliance with all key family members. "
                "IMPORTANT: Use circular, open-ended questions; do NOT assign blame."
            ),
            "weightage": 10,
            "approach": "questions",
            "examples": [
                "How does each family member view the issue?",
                "When one member changes behavior, what shifts occur?"
            ]
        },
        "Intake Phase": {
            "intent": (
                "IMPORTANT: Gather family history, roles, and communication patterns. "
                "STRICTLY: Focus on systemic context; avoid individual pathology."
            ),
            "weightage": 15,
            "approach": "questions",
            "examples": [
                "Can you describe your family's decision-making style?",
                "Who usually takes on which responsibilities at home?"
            ]
        },
        "Exploratory Inquiry Phase": {
            "intent": (
                "STRICTLY: Explore interactional patterns and boundaries. "
                "IMPORTANT: Frame prompts to highlight systemic relationships."
            ),
            "weightage": 20,
            "approach": "questions",
            "examples": [
                "What happens when someone tries to set a new boundary?",
                "How does conflict typically resolve in your family?"
            ]
        },
        "Scenario Validation Phase": {
            "intent": (
                "IMPORTANT: Validate systemic observations with concrete examples. "
                "STRICTLY: Use family-provided scenarios; avoid therapeutic jargon."
            ),
            "weightage": 10,
            "approach": "questions | statements",
            "examples": [
                "In that conversation, who shifted roles?",
                "I noticed a pattern of triangulation—does that reflect your experience?"
            ]
        },
        "Solution Retrieval Phase": {
            "intent": (
                "STRICTLY: Suggest one systemic intervention (e.g., enactment, reframing). "
                "IMPORTANT: Tailor to family strengths; do NOT pathologize members."
            ),
            "weightage": 15,
            "approach": "statements",
            "examples": [
                "Let’s role-play setting a new boundary with supportive feedback.",
                "Consider using a weekly family meeting to open communication."
            ]
        },
        "Intervention & Follow-Up Phase": {
            "intent": (
                "IMPORTANT: Monitor implementation of systemic changes. "
                "STRICTLY: Do NOT introduce additional interventions until current ones are tried."
            ),
            "weightage": 15,
            "approach": "both",
            "examples": [
                "How did the new boundary affect your interactions?",
                "What challenges arose from the family meeting?"
            ]
        },
        "Progress Evaluation Phase": {
            "intent": (
                "STRICTLY: Assess shifts in family dynamics and roles. "
                "IMPORTANT: Use descriptive feedback; avoid symptom checklists."
            ),
            "weightage": 10,
            "approach": "questions",
            "examples": [
                "What improvements have you noticed in communication?",
                "How have responsibilities become more balanced?"
            ]
        },
        "Termination/Closure Phase": {
            "intent": (
                "IMPORTANT: Summarize systemic progress and plan maintenance rituals. "
                "STRICTLY: Avoid introducing new systemic concepts."
            ),
            "weightage": 3,
            "approach": "statements",
            "examples": [
                "You’ve shifted patterns—what routines will you keep?",
                "Let’s plan periodic check-ins to support these changes."
            ]
        },
        "Crisis Phase": {
            "intent": (
                "STRICTLY: Respond to acute family crises with safety-focused interventions. "
                "IMPORTANT: Prioritize immediate containment; do NOT analyze dynamics."
            ),
            "weightage": 2,
            "approach": "both",
            "examples": [
                "Is everyone safe right now?",
                "Let’s discuss immediate steps to ensure safety for all."
            ]
        }
    },

    "Third-Wave & Acceptance-Based": {
        "Initial Phase": {
            "intent": (
                "STRICTLY: Introduce mindfulness practice to ground the client. "
                "IMPORTANT: Use guided exercises; do NOT analyze experiences."
            ),
            "weightage": 10,
            "approach": "questions",
            "examples": [
                "Notice your breath for two minutes without judgment—what do you observe?"
            ]
        },
        "Intake Phase": {
            "intent": (
                "IMPORTANT: Clarify personal values and life directions. "
                "STRICTLY: Elicit client-generated values; avoid prescribing them."
            ),
            "weightage": 15,
            "approach": "questions",
            "examples": [
                "What matters most to you in your relationships?",
                "How do these values guide your daily actions?"
            ]
        },
        "Exploratory Inquiry Phase": {
            "intent": (
                "STRICTLY: Teach cognitive defusion techniques to observe thoughts. "
                "IMPORTANT: Use experiential prompts; do NOT interpret thoughts."
            ),
            "weightage": 20,
            "approach": "questions",
            "examples": [
                "When a difficult thought arises, label it as 'just a thought'—what do you notice?"
            ]
        },
        "Scenario Validation Phase": {
            "intent": (
                "IMPORTANT: Apply mindfulness and defusion in real-life scenarios. "
                "STRICTLY: Avoid new exercises; use practiced techniques only."
            ),
            "weightage": 10,
            "approach": "questions | statements",
            "examples": [
                "In that stressful situation, how did labeling the thought help?",
                "I noticed you remained present—what felt different?"
            ]
        },
        "Solution Retrieval Phase": {
            "intent": (
                "STRICTLY: Collaboratively set SMART commitment goals aligned with values. "
                "IMPORTANT: Focus on one goal per prompt; avoid vagueness."
            ),
            "weightage": 15,
            "approach": "statements",
            "examples": [
                "Let’s define a specific action step in line with your top value."
            ]
        },
        "Intervention & Follow-Up Phase": {
            "intent": (
                "IMPORTANT: Monitor willingness and adherence to value-based actions. "
                "STRICTLY: Use check-in prompts; do NOT introduce new techniques."
            ),
            "weightage": 15,
            "approach": "questions",
            "examples": [
                "How have you engaged with your commitment goals this week?"
            ]
        },
        "Progress Evaluation Phase": {
            "intent": (
                "STRICTLY: Assess psychological flexibility and value-consistent behavior. "
                "IMPORTANT: Use client self-report; avoid symptom scales."
            ),
            "weightage": 10,
            "approach": "questions",
            "examples": [
                "What changes have you noticed in your ability to stay present?"
            ]
        },
        "Termination/Closure Phase": {
            "intent": (
                "IMPORTANT: Summarize gains and co-develop maintenance plans. "
                "STRICTLY: Avoid new exercises; focus on consolidation."
            ),
            "weightage": 3,
            "approach": "statements",
            "examples": [
                "You’ve embraced mindfulness—what practices will you maintain?"
            ]
        },
        "Crisis Phase": {
            "intent": (
                "STRICTLY: Use brief acceptance-based techniques to contain crisis. "
                "IMPORTANT: Prioritize grounding; do NOT analyze thoughts deeper."
            ),
            "weightage": 2,
            "approach": "both",
            "examples": [
                "When distress spikes, what grounding practice will you use?"
            ]
        }
    },

    "Trauma-Focused": {
        "Initial Phase": {
            "intent": (
                "STRICTLY: Prioritize safety and stabilization with grounding. "
                "IMPORTANT: Teach grounding techniques; defer trauma processing."
            ),
            "weightage": 10,
            "approach": "questions",
            "examples": [
                "Try the 5-4-3-2-1 grounding technique now—what do you notice?"
            ]
        },
        "Intake Phase": {
            "intent": (
                "IMPORTANT: Collect detailed trauma history and current triggers. "
                "STRICTLY: Use structured inquiry; avoid re-traumatization."
            ),
            "weightage": 15,
            "approach": "questions",
            "examples": [
                "Can you share when you first noticed these trauma responses?",
                "What situations tend to trigger distressing memories?"
            ]
        },
        "Exploratory Inquiry Phase": {
            "intent": (
                "STRICTLY: Facilitate trauma memory processing within client's window of tolerance. "
                "IMPORTANT: Use protocol guidelines; do NOT push beyond readiness."
            ),
            "weightage": 20,
            "approach": "questions",
            "examples": [
                "What image or memory arises when you focus on this feeling?"
            ]
        },
        "Scenario Validation Phase": {
            "intent": (
                "IMPORTANT: Validate client’s trauma narratives and responses. "
                "STRICTLY: Reflect back without analysis or judgment."
            ),
            "weightage": 10,
            "approach": "statements",
            "examples": [
                "I hear the fear in your voice—this was clearly distressing."
            ]
        },
        "Solution Retrieval Phase": {
            "intent": (
                "STRICTLY: Introduce one trauma-processing intervention (e.g., EMDR step). "
                "IMPORTANT: Follow protocol strictly; do NOT deviate."
            ),
            "weightage": 15,
            "approach": "statements",
            "examples": [
                "Using EMDR bilateral stimulation, what sensation arises first?"
            ]
        },
        "Intervention & Follow-Up Phase": {
            "intent": (
                "IMPORTANT: Support integration of processed material and conduct safety check-ins. "
                "STRICTLY: Do NOT revisit raw trauma without stabilization."
            ),
            "weightage": 15,
            "approach": "both",
            "examples": [
                "How are you feeling after our session today?"
            ]
        },
        "Progress Evaluation Phase": {
            "intent": (
                "STRICTLY: Assess symptom reduction and increases in safety perception. "
                "IMPORTANT: Use client self-report and standardized measures."
            ),
            "weightage": 10,
            "approach": "questions",
            "examples": [
                "What changes have you noticed in your distress levels?"
            ]
        },
        "Termination/Closure Phase": {
            "intent": (
                "IMPORTANT: Consolidate coping skills and future safety plans. "
                "STRICTLY: Avoid re-exposing to traumatic narratives."
            ),
            "weightage": 3,
            "approach": "statements",
            "examples": [
                "You’ve made progress—what grounding will you use if triggers reappear?"
            ]
        },
        "Crisis Phase": {
            "intent": (
                "STRICTLY: Implement immediate crisis management and de-escalation. "
                "IMPORTANT: Prioritize safety and stabilization; do NOT analyze trauma."
            ),
            "weightage": 2,
            "approach": "both",
            "examples": [
                "Are you in safe place now? What can we do to keep you safe?"
            ]
        }
    },

    "Narrative & Solution-Focused": {
        "Initial Phase": {
            "intent": (
                "STRICTLY: Elicit the client's problem narrative without interpretation. "
                "IMPORTANT: Use open-ended story prompts; do NOT impose structure."
            ),
            "weightage": 10,
            "approach": "questions",
            "examples": [
                "Tell me the story of when this problem first began."
            ]
        },
        "Intake Phase": {
            "intent": (
                "IMPORTANT: Identify exceptions where the problem was less severe. "
                "STRICTLY: Use scaling and exception questions; avoid focus on pathology."
            ),
            "weightage": 15,
            "approach": "questions",
            "examples": [
                "On a scale of 1–10, when was the last time this was less intense?"
            ]
        },
        "Exploratory Inquiry Phase": {
            "intent": (
                "STRICTLY: Deepen understanding of exceptions and personal resources. "
                "IMPORTANT: Frame prompts to uncover client strengths."
            ),
            "weightage": 20,
            "approach": "questions",
            "examples": [
                "What helped you achieve that exception?"
            ]
        },
        "Scenario Validation Phase": {
            "intent": (
                "IMPORTANT: Validate progress by reviewing client successes. "
                "STRICTLY: Use affirmative, resource-focused language."
            ),
            "weightage": 10,
            "approach": "statements",
            "examples": [
                "You’ve shown resilience when facing that challenge."
            ]
        },
        "Solution Retrieval Phase": {
            "intent": (
                "STRICTLY: Co-construct small, practical steps toward solutions. "
                "IMPORTANT: Focus on actionable strategies; avoid pathologizing."
            ),
            "weightage": 15,
            "approach": "statements",
            "examples": [
                "What’s one small step you can take to move toward your goal?"
            ]
        },
        "Intervention & Follow-Up Phase": {
            "intent": (
                "IMPORTANT: Support implementation of client-generated solutions. "
                "STRICTLY: Check progress; do NOT introduce new techniques."
            ),
            "weightage": 15,
            "approach": "both",
            "examples": [
                "How did your solution step go this week?"
            ]
        },
        "Progress Evaluation Phase": {
            "intent": (
                "STRICTLY: Assess client’s satisfaction with the chosen solutions. "
                "IMPORTANT: Use scaling questions and client feedback."
            ),
            "weightage": 10,
            "approach": "questions",
            "examples": [
                "On a scale of 1–10, how satisfied are you with your progress?"
            ]
        },
        "Termination/Closure Phase": {
            "intent": (
                "IMPORTANT: Celebrate achievements and plan follow-up check-ins. "
                "STRICTLY: Use positive reinforcement language; avoid problem talk."
            ),
            "weightage": 3,
            "approach": "statements",
            "examples": [
                "You’ve made great strides—when should we follow up to review your progress?"
            ]
        },
        "Crisis Phase": {
            "intent": (
                "STRICTLY: Provide immediate stabilizing narratives and resource reminders. "
                "IMPORTANT: Prioritize safety and coping; do NOT revisit problems."
            ),
            "weightage": 2,
            "approach": "both",
            "examples": [
                "What coping story or past success can you recall to feel safer?"
            ]
        }
    }
}
