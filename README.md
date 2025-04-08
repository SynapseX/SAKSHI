# 🧠 SAKSHI AI  
**Sentient AI for Knowledge, Support & Healing Interactions**

> *Your Personal AI Therapist — Empathetic, Confidential, Always Available.*

---

## 📌 Overview

**SAKSHI AI** is an AI-powered therapeutic companion designed to understand human emotions, simulate real therapist interactions, and support users in navigating their mental well-being. Built with empathy at its core, SAKSHI listens, learns, and responds like a therapist — providing a safe, supportive environment for self-reflection and emotional growth.

---

### 🌟 Key Features

- 🗣️ **Natural Conversations**  
  Engage in human-like dialogue with an intelligent, responsive AI therapist.

- 🧠 **Emotion Recognition** *(In Progress)*  
  Understands emotional cues from your language and responds accordingly.

- 💬 **Reflective Feedback Generation** *(Planned)*  
  Offers insights and therapeutic responses that help users reflect and grow.

- 🔐 **Privacy-First**  
  All interactions remain local. No data is stored on the cloud.

- 📖 **Session Continuity**  
  Maintains conversation context for seamless therapy-like experience.

---

## 👤 Target Users

- Individuals seeking low-pressure, AI-assisted mental health support.
- People interested in emotional journaling or self-reflection.
- Users looking for a confidential, always-on companion.

---

## 🧩 Use Cases

- 🌙 End-of-day emotional check-ins  
- 💡 Self-awareness training  
- 🎯 Goal setting & tracking mental clarity  
- 😔 Coping support during difficult times  

---

## 🖼️ UI Preview *(Add Screenshots Here)*

> _Include user interface screenshots or diagrams here to show what the app looks like._

---

# ⚙️ Developer Guide

> This section is for contributors or developers looking to understand the architecture, flow, and how to run or extend SAKSHI AI.

---

## 🛠️ Tech Stack

| Layer     | Technology         |
|-----------|--------------------|
| Frontend  | AngularJS          |
| Backend   | Python (Flask - if used, TBD) |
| Execution | CLI (main.py)      |
| Hosting   | Localhost / On-Prem |

---

## 📂 Project Structure

```
sakshi-ai/
│
├── backend/
│   ├── main.py                # App entry point
│   ├── session_manager.py     # Session tracking per user
│   ├── emotion_detector.py    # (Planned) Emotional NLP processing
│   ├── feedback_generator.py  # (Planned) Therapist-style response engine
│   └── utils/                 # Utilities and helper methods
│
├── frontend/
│   └── [AngularJS App Files]  # Web-based UI
│
├── assets/
│   └── logo/, samples/, etc.
│
├── README.md
└── config/
    └── settings.json          # (Optional) Runtime configuration
```

---

## 🔄 Core Application Flow

1. **User Input** is entered through the AngularJS frontend UI.
2. **Backend API** (`main.py`) receives the text input.
3. **Session Manager** checks if it's a new or existing session.
4. (Future) **Emotion Detector** analyzes emotional tone.
5. (Future) **Feedback Generator** builds a reflective, helpful response.
6. **Response is returned** to frontend and displayed to user.
7. Conversation state is **stored locally** to preserve context.

---

## 🚀 Getting Started

### 🔧 Backend Setup

```bash
cd backend/
python main.py
```

> Ensure Python 3.9+ and required dependencies are installed.

### 💻 Frontend Setup (AngularJS)

Serve via any static web server or `lite-server`:

```bash
cd frontend/
lite-server
```

---

## 📅 Planned Roadmap

- [ ] Emotion analysis using sentiment NLP
- [ ] Reflective feedback with therapy scripts
- [ ] Voice-to-text & text-to-voice integration
- [ ] Local secure chat history
- [ ] Therapist session timeline visualization

---

## 🧑‍💻 Contributing

We welcome developers, therapists, and researchers!

1. Fork the repo
2. Create a feature branch
3. Submit a well-documented PR

---

## 🛡️ Privacy & Data Ethics

- All conversations are stored **locally**, not transmitted to third parties.
- Future versions will comply with **HIPAA-like standards** for data privacy.
- No behavioral data is used for training external models.

---

## 📃 License

> _License type to be finalized. All rights reserved until open-sourced._

---

## 👥 Authors & Credits

**SAKSHI AI** is developed by a team passionate about mental health, AI, and empathetic design.

> Created & Maintained by Sraban Kumar Patro 
> Contact: reg.sraban@gmail.com

---

## 📎 Appendix

- 📚 External Libs/Models: TBA  
- 🧠 Emotion Dataset Source: TBA  
- 🔍 Logs / Debugging: `logs/` or browser console  
- 🔒 Secure Config: Move secrets/envs to `.env` (Planned)

---
