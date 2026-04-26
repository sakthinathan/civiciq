# 🗳️ CivicIQ — Global Election Education Platform

> **AI-powered election education. Built for the world's democracies.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Cloud%20Run-4285F4?style=for-the-badge&logo=google-cloud)](https://civiciq-728645350771.us-central1.run.app/)
[![GitHub](https://img.shields.io/badge/GitHub-sakthinathan%2Fciviciq-181717?style=for-the-badge&logo=github)](https://github.com/sakthinathan/civiciq)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1.0-000000?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com)

---

## 🌍 What is CivicIQ?

**CivicIQ** is an interactive, AI-powered web platform that makes understanding global elections accessible to everyone. Users can explore how elections work across **5 major democracies**, get instant answers from a **context-aware AI assistant**, test their knowledge with dynamically generated **AI quizzes**, and even access India's complete **state-wise Lok Sabha constituency breakdown** — all powered by the **Google Cloud ecosystem**.

---

## 🎯 Chosen Vertical

**Civic Education & Democratic Participation**

Democracy only works when citizens are informed. CivicIQ bridges the gap between complex electoral processes and everyday understanding — enabling any citizen, student, or researcher to deeply explore how their vote is counted.

---

## ✨ Key Features

### 🌐 Global Explorer
- Explore election systems across **India 🇮🇳, USA 🇺🇸, UK 🇬🇧, EU 🇪🇺, and Brazil 🇧🇷**
- Interactive **election timelines** with day-by-day breakdowns
- Step-by-step **"How to Vote"** guides with embedded official video guides (YouTube API)
- **📅 Google Calendar integration** — add polling reminders directly to your Google Calendar

### 🇮🇳 India Deep Dive (State-Wise Breakdown)
- Web-scraped constituency data from Wikipedia using **BeautifulSoup4**
- Complete breakdown of all **28 States + 8 Union Territories** with Lok Sabha seat counts
- **Google Maps embed** showing the Election Commission of India location in context

### 🤖 Civic Assistant (Google Gemini 1.5 Flash)
- Context-aware AI chat — automatically detects the country you're reading and grounds its responses accordingly
- Full conversation history (last 8 messages)
- Fallback responses when the API is unavailable — the app **never breaks**

### 🧠 Trivia Quest (AI-Generated Quizzes)
- Dynamic AI quiz generation via **Google Gemini** — fresh unique questions on every attempt
- Country-specific multiple choice with instant scoring feedback
- Static fallback questions if AI is unavailable

### 🔊 Voice Accessibility (Text-to-Speech)
- Every AI chat response includes a **🔊 Listen** button
- Uses **gTTS (Google Text-to-Speech)** to generate audio playback on the fly

### 🌐 Multilingual Support
- Translate the entire platform into **Hindi, Tamil, Spanish, French, German, Portuguese**
- Powered by **Google Cloud Translation API**

### 📊 System Compare
- Side-by-side comparison of election systems, governing bodies, and voter populations

---

## 🏗️ Architecture & Approach

### Frontend
- Vanilla HTML5, CSS3, and JavaScript (SPA-style navigation with zero page reloads)
- Premium design: dark forest-green editorial theme with Playfair Display typography
- Fully accessible: ARIA labels, keyboard navigation, skip links, screen reader support

### Backend
- **Flask 3.1** modular blueprint architecture
- **Gzip compression** via Flask-Compress for all API responses
- **Rate limiting** (Flask-Limiter) on all AI endpoints
- **Input sanitization** via `bleach` to prevent XSS
- **Strict Content Security Policy** headers (both HTTP headers + meta tags)
- Graceful **404/500 JSON error handlers**

### Data Layer
- `data/elections.json` — structured election data for 5 countries (timelines, steps, facts, YouTube IDs)
- `data/india_states.json` — web-scraped Lok Sabha constituency data per state
- `data/glossary.json` — civic education glossary

---

## 🔑 Google Services Integration

| Service | Purpose | Status |
|---|---|---|
| **Google Gemini 1.5 Flash** | AI Chat + Quiz Generation | ✅ Active |
| **Google Maps Embed API** | India State Constituency Map | ✅ Active |
| **YouTube Embed API** | Official Election Video Guides | ✅ Active |
| **Google Calendar API** | Voter Reminder Links | ✅ Active |
| **Google Cloud Translation** | Multilingual Support | ✅ Configured |
| **Google Text-to-Speech (gTTS)** | Audio AI Responses | ✅ Active |
| **Google Cloud Run** | Production Deployment | ✅ Live |
| **Google Fonts** | Playfair Display + DM Sans Typography | ✅ Active |
| **Vertex AI Grounding** | Fact-Checked Responses | 🔧 Optional |
| **Firebase Firestore** | Chat Session Persistence | 🔧 Optional |

---

## 🚀 Running Locally

### Prerequisites
- Python 3.11+
- A Google Gemini API Key from [aistudio.google.com](https://aistudio.google.com/)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/sakthinathan/civiciq.git
cd civiciq

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create your environment file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY and MAPS_API_KEY

# 4. Run the app
python3 app.py
```

Open `http://localhost:8080` in your browser.

---

## ☁️ Deploying to Google Cloud Run

```bash
# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Deploy
gcloud run deploy civiciq \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=YOUR_KEY,MAPS_API_KEY=YOUR_KEY,GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID"
```

---

## 🧪 Testing

```bash
# Run the full test suite
pytest tests/ -v --tb=short

# Run with coverage report
pytest tests/ --cov=. --cov-report=term-missing
```

The test suite covers:
- `test_routes.py` — API endpoint validation
- `test_security.py` — XSS, injection, and rate limiting tests
- `test_accessibility.py` — ARIA and semantic HTML checks
- `test_services.py` — Gemini and Firebase service mocks
- `test_data.py` — Election data integrity validation

CI runs automatically on every push via **GitHub Actions** (`.github/workflows/test.yml`).

---

## 📁 Project Structure

```
civiciq/
├── app.py                  # Flask app factory & main routes
├── config.py               # All environment variables & settings
├── requirements.txt        # Pinned dependencies
├── Dockerfile              # Container definition for Cloud Run
├── cloudbuild.yaml         # Google Cloud Build pipeline
├── data/
│   ├── elections.json      # Election data for 5 countries
│   ├── india_states.json   # Web-scraped Lok Sabha constituency data
│   └── glossary.json       # Civic education glossary
├── routes/
│   ├── elections.py        # /api/elections endpoints
│   ├── chat.py             # /api/chat + /api/quiz/generate
│   ├── translate.py        # /api/translate
│   ├── tts.py              # /api/tts (Text-to-Speech)
│   └── health.py           # /health check endpoint
├── services/
│   ├── gemini_service.py   # Google Gemini AI integration
│   ├── firebase_service.py # Firebase Firestore session storage
│   └── translate_service.py# Google Cloud Translation
├── static/
│   ├── css/style.css       # Full design system (dark editorial theme)
│   ├── js/app.js           # Core SPA navigation & rendering
│   ├── js/chat.js          # AI chat interface
│   ├── js/timeline.js      # Timeline, voting steps, Calendar & YouTube
│   ├── js/translate.js     # Translation UI logic
│   ├── robots.txt          # SEO crawler directives
│   └── sitemap.xml         # XML sitemap for search engines
├── templates/
│   └── index.html          # Main SPA template (CSP, OG tags, Maps key)
├── tests/                  # Comprehensive pytest test suite
└── scrape_india.py         # Wikipedia scraper for constituency data
```

---

## 🔒 Security Measures

- **Content Security Policy** — Enforced via both HTTP response headers and HTML meta tags
- **Rate Limiting** — All AI/chat endpoints limited to 20 req/min per IP
- **Input Sanitization** — All user input cleaned via `bleach` before processing
- **API Key Security** — Maps API key injected server-side via Flask template (never exposed in source code)
- **XSS Prevention** — `escapeHtml()` applied to all dynamic DOM injections
- **Referrer Policy** — `strict-origin-when-cross-origin` across all responses

---

## 🌱 Assumptions Made

1. **Elections data is current as of 2025** — timelines use relative day-offsets to remain always relevant.
2. **Web-scraped India data** is sourced from Wikipedia's Lok Sabha constituency list and may differ slightly from official ECI figures.
3. **Gemini API** is assumed available. The platform is designed with full fallback logic — every AI feature degrades gracefully to static content when the API is unavailable.
4. **gTTS audio** requires an internet connection on the server to generate speech audio from Google's TTS service.

---

## 👨‍💻 Author

**Sakthinathan N** — [github.com/sakthinathan](https://github.com/sakthinathan)

Built for **#PromptWarsVirtual | #BuildwithAI** Hackathon 2026  
Powered by **Google Cloud, Gemini AI, Maps, YouTube, and Calendar APIs**

---

*"Democracy is too important to be confusing." — CivicIQ*
