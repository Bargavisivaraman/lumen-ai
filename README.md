# Lumen AI — Virtual Teaching Assistant

> A full-stack AI-powered learning platform that combines a personalized tutor chat, AI-generated study plans, adaptive quizzes, PDF note summarization, and a real-time analytics dashboard.

**🔗 Live demo:** [lumen-ai-gilt.vercel.app](https://lumen-ai-gilt.vercel.app)
**📦 Stack:** Next.js 14 · FastAPI · PostgreSQL · OpenAI GPT-4 · TypeScript · Tailwind CSS

---

## ✨ Features

- **AI Tutor Chat** — GPT-4 powered tutor with conversation memory, Markdown rendering, and voice input/output via the Web Speech API.
- **AI Study Planner** — Generates a day-by-day schedule based on your subjects, exam dates, weak topics, and available hours.
- **Adaptive Quizzes** — Generate multiple-choice quizzes on any topic at easy / medium / hard difficulty, with instant grading and per-question explanations.
- **Smart Notes** — Upload a PDF or paste class notes, and get an AI-generated summary, key points, and flashcards in seconds.
- **Analytics Dashboard** — Streak tracking, weak-topic detection, daily study time, and AI coach suggestions.
- **Voice + Text** — Speak your question, hear the reply, study hands-free.
- **Admin Panel** — Role-based access for platform-wide metrics and user management.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts |
| **Backend** | FastAPI, SQLAlchemy 2.0, Pydantic v2, Uvicorn |
| **Database** | PostgreSQL (Neon serverless) |
| **Auth** | JWT (python-jose) + bcrypt password hashing |
| **AI** | OpenAI GPT-4 / GPT-4o-mini with deterministic offline fallback |
| **PDF** | pypdf for note extraction |
| **Deployment** | Vercel (frontend) · Render (backend) · Neon (database) |

---

## 🏗 Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│  Next.js (Vercel)│ ──HTTPS─→│  FastAPI (Render)│ ──TCP──→│ Postgres (Neon)  │
│  React + TS     │         │  JWT + Bcrypt    │         │  SQLAlchemy ORM  │
└────────┬────────┘         └─────────┬────────┘         └──────────────────┘
         │                            │
         │                            └──→ OpenAI API (GPT-4)
         │
         └──→ Web Speech API (voice in/out)
```

The backend exposes a typed REST API consumed by the Next.js client. An `AIProvider` abstraction lets the app gracefully degrade to a deterministic offline mode when no API key is present, so every feature stays demoable.

---

## 🚀 Run locally

### Prerequisites
- Node.js 20+
- Python 3.12+
- A PostgreSQL connection (or use the SQLite fallback)

### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env       # then edit with your secrets
uvicorn app.main:app --reload
```

Backend at http://localhost:8000 · API docs at http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend at http://localhost:3000

### Docker (full stack)
```bash
docker compose up --build
```

---

## 🔐 Environment variables

### Backend (`.env`)
```env
DATABASE_URL=postgresql+psycopg://user:pass@host/db?sslmode=require
JWT_SECRET=your-long-random-secret
OPENAI_API_KEY=sk-...
CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📡 API surface

| Route | Description |
|---|---|
| `POST /auth/register` · `POST /auth/login` · `GET /auth/me` | JWT-based auth |
| `POST /chat/messages` · `GET /chat/sessions` | Tutor chat with persistent history |
| `POST /planner/generate` · `GET /planner/me` | AI study plan generation |
| `POST /quizzes/generate` · `POST /quizzes/{id}/submit` | Adaptive quizzes |
| `POST /notes/text` · `POST /notes/upload` | Notes → summary + flashcards |
| `GET /analytics/dashboard` | Streak, weak topics, suggestions |
| `GET /recommendations/` | Personalized next-step recommendations |
| `GET /admin/users` · `GET /admin/stats` | Admin-only platform metrics |

Full interactive docs at `/docs` when the backend is running.

---

## 🧪 Testing
```bash
cd backend
pytest
```

Includes test coverage for auth flows and the quiz grading logic.

---

## 🧠 Engineering highlights

- **AI provider abstraction** with a deterministic offline fallback so every feature is demoable without an API key.
- **Resolved a Python 3.13 / passlib / bcrypt incompatibility** by switching to direct bcrypt calls with manual 72-byte truncation.
- **Fixed IPv6 routing failures** between Render and Neon by switching to the direct (non-pooled) Postgres endpoint.
- **CORS-restricted origins** with environment-based allowlisting for production vs. preview deployments.
- **Persistent storage** — every chat, plan, quiz, note, and study session lives in Postgres and survives logout.

---

## 📂 Project structure

```
ai-tutor/
├── backend/
│   ├── app/
│   │   ├── core/         # config, security, deps
│   │   ├── db/           # SQLAlchemy session + base
│   │   ├── models/       # User, ChatSession, StudyPlan, Quiz, Note, StudySession
│   │   ├── schemas/      # Pydantic v2 request/response models
│   │   ├── services/     # AI provider, tutor, planner, quiz, notes, analytics
│   │   └── routers/      # auth, chat, planner, quizzes, notes, analytics, admin
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Sidebar, mobile nav, page-header, stat-card, etc.
│   ├── lib/              # API client, auth store, speech hooks
│   ├── styles/           # globals.css with design tokens
│   └── tailwind.config.js
└── docker-compose.yml
```

---

## 📜 License

MIT — feel free to use this as inspiration for your own projects.
