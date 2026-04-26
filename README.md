# CivicIQ - Global Election Education Platform

CivicIQ is a transparent, data-driven educational platform built to make global democracy understandable. It demystifies the chaotic worldwide electoral landscape using interactive timelines, dynamic voting guides, and a highly contextual AI-powered Google Gemini assistant.

## 🎯 Our Chosen Vertical

**Civic Education & Global Literacy**

In a world where international politics heavily influence local realities, the average citizen struggles to understand how foreign governments legally operate. Is the UK a republic? How does the Electoral College work? What is the EU Parliament?

CivicIQ solves this directly by consolidating, standardizing, and educating users on the democratic processes characterizing five of the world's most globally influential electoral systems.

## 🧠 Approach and Logic

We built CivicIQ prioritizing **empathy, accessibility, and architectural efficiency**:
- **Empathy:** Information regarding state legislature is stereotypically extremely dense. We approached this by building a highly visual, SPA (Single Page Application) frontend. We replaced massive textbook walls of text with interactive timelines, bold infographics, and a live "Compare" system.
- **Accessibility:** Instead of treating "Access" as a checklist, we natively built in ARIA labels, skip-links, and most importantly, a Google Text-to-Speech (gTTS) implementation. AI Assistant interactions aren't just readable; they are globally audible at the click of a button.
- **Context Handling:** Our logic strictly connects our AI integrations to user behaviors. Rather than slapping a generic chatbot sidebar on the app, the CivicIQ Assistant actively logs what country screen you are browsing, injecting logical "System Prompts" over the connection to provide hyper-focused answers without forcing the user to repeat themselves.

## ⚙️ How the Solution Works

CivicIQ is a heavily decoupled **Flask/Python Monolith** architecture routing into a dynamic vanilla HTML/JS frontend overlay.

1. **The Navigation Layer:** Users shift between "Explore", "Compare", "Quiz", and "AI Chat" views entirely client-side. The DOM renders dynamically to prevent heavy page reloads, maximizing bandwidth efficiency.
2. **The API Layer:** When heavy actions are needed, the JS frontend uses asynchronous `fetch` requests pinging Flask `routes/` (e.g., `/api/elections`, `/api/chat`, `/api/tts`, `/api/quiz/generate`).
3. **The ML Layer (Google Ecosystem):** 
   - When users query the assistant, `gemini_service.py` pings **Google Gemini 1.5 Flash** for high-speed, grounded LLM analysis. Let's say you ask about Brazilian election cycles—Gemini receives your implicit viewing context and securely generates the output.
   - When a user starts a Quiz, the backend generates dynamic trivia on-the-fly directly from Gemini returning strict serialized JSON components. 
4. **The Security Layer:** Every backend request passes through a `Flask-Limiter` proxy. All user chat data is strictly cleansed of malicious HTML via Python's `bleach` module. Outbound data payloads organically compress under `Flask-Compress`, while the HTML securely enforces an explicit `Content-Security-Policy`.

## 🤔 Assumptions Made

During the development and architectural planning of CivicIQ, several calculated decisions/assumptions were structured:
1. **Fallback Supremacy over ML Fidelity:** We assume that API credentials may sometimes rotate, fail, or be exhausted. Therefore, the core services (like generating quizzes or chat answers) have hard-coded dynamic fallback variables. If Gemini completely crashes, the app will instantly flip to local JSON backups, intentionally choosing to keep the user engaged instead of throwing 500 server errors.
2. **Text-To-Speech Lightweight Tooling:** We assumed executing a native API integration via the basic `gTTS` library was highly preferable over an enterprise-authenticated GCP Speech-to-Text authorization key, to maximize ease-of-deployment for open-source evaluators.
3. **Monolith vs Microservices:** To keep the footprint simple for rapid hackathon testing and deployment locally via `python3 app.py`, we assumed a modular Flask app architecture (separating `/routes` and `/services`) offered all of the scaling benefits of Microservices while retaining the sanity and singular deployment layer of a Monolith (`cloudbuild.yaml`).

## 💻 Tech Stack & Features
- **Backend**: Flask 3.1.0, Flask-Compress, Flask-Limiter
- **AI Integrations**: Google Gemini 1.5 Flash (Dynamic Quiz + Context Chat)
- **Speech Synthesis**: gTTS (Google Translate API)
- **Deployment**: Google Cloud Run Ready
- **Testing**: Native Pytest wrappers (`tests/`)

## 🚀 Local Setup

```bash
# 1. Install dependencies
python3 -m pip install -r requirements.txt

# 2. Run the secure Flask server 
python3 app.py

# 3. Access locally
Open your browser to http://localhost:5000
```
