# AI Virtual Teaching Assistant

A full-stack, production-grade learning platform that pairs students with an intelligent AI tutor. Students can chat with the tutor, generate personalized study plans, take adaptive quizzes, summarize their own notes, and track progress over time.

> Built end-to-end: Next.js 14 (App Router) + Tailwind + Framer Motion on the frontend, FastAPI + SQLAlchemy + PostgreSQL on the backend, OpenAI / Gemini for the AI layer, and JWT auth throughout.

Live site: https://lumen-ai-gilt.vercel.app/
---

## Features

**Authentication** — JWT-based signup/login, hashed passwords (bcrypt), student profiles, role-based access (student / admin).

**AI Chat Tutor** — Streaming chat with conversation memory, follow-up support, step-by-step explanations, persistent chat history per user.

**Personalized Study Planner** — Students enter subjects, goals, exam dates, weak topics, and available hours. The AI returns a daily/weekly schedule which is then editable.

**Analytics Dashboard** — Study hours, quiz scores, learning streaks, weak-area heatmap, and AI-generated improvement suggestions. Charts via Recharts.

**Quiz Engine** — AI-generated MCQs at three difficulty levels with instant feedback, explanations, and score history.

**Voice + Text** — Web Speech API for speech-to-text input and text-to-speech responses.

**Notes & Resources** — Upload PDF / text, get an AI-generated summary, flashcards, and key-point extraction.

**Smart Recommendations** — A daily recommendation feed driven by the student's recent activity and weak areas.

**Admin Panel** — User management, platform metrics, content moderation.

---

## Tech Stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 14, React 18, Tailwind CSS, Framer Motion, Recharts, lucide-react |
| Backend | FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic |
| Database | PostgreSQL (SQLite for local dev) |
| AI | OpenAI (`gpt-4o-mini`) with a Gemini fallback adapter, LangChain for the planner chain |
| Auth | JWT (PyJWT) + bcrypt |
| Infra | Docker, docker-compose, GitHub Actions CI |

---

## Repository Layout

```
ai-tutor/
├── frontend/                  # Next.js 14 app
│   ├── app/                   # App Router pages
│   ├── components/            # Reusable UI components
│   ├── lib/                   # API client, hooks, utils
│   └── styles/                # Global CSS
├── backend/                   # FastAPI service
│   ├── app/
│   │   ├── core/              # Config, security, JWT
│   │   ├── db/                # SQLAlchemy session & base
│   │   ├── models/            # ORM models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── routers/           # API route modules
│   │   ├── services/          # Business + AI logic
│   │   └── main.py            # FastAPI app entry
│   └── tests/                 # Pytest suite
├── docker-compose.yml
└── README.md
```

---

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # add your OPENAI_API_KEY
uvicorn app.main:app --reload
```

API docs: <http://localhost:8000/docs>

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

App: <http://localhost:3000>

### Docker (everything)

```bash
docker-compose up --build
```

---

## Environment Variables

**Backend (`backend/.env`)**

```
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/aitutor
JWT_SECRET=change-me-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=                       # optional fallback
CORS_ORIGINS=http://localhost:3000
```

**Frontend (`frontend/.env.local`)**

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## API Surface (overview)

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Create student account |
| POST | `/auth/login` | Returns JWT |
| GET  | `/auth/me` | Current user |
| POST | `/chat/messages` | Send message, get AI reply |
| GET  | `/chat/history` | Paginated chat history |
| POST | `/planner/generate` | Build a study plan from inputs |
| GET  | `/planner/me` | Current plan |
| POST | `/quizzes/generate` | Generate a quiz on a topic |
| POST | `/quizzes/{id}/submit` | Submit answers, get feedback |
| POST | `/notes/upload` | Upload PDF/text, returns summary |
| GET  | `/notes/{id}/flashcards` | Generate flashcards from a note |
| GET  | `/analytics/dashboard` | Aggregated stats |
| GET  | `/recommendations` | Personalized feed |
| GET  | `/admin/users` | (admin) list users |

Full schema lives at `/docs` (Swagger UI) once the backend is running.

---

## Database Schema (simplified)

```
users(id, email, hashed_password, full_name, role, created_at)
chat_sessions(id, user_id, title, created_at)
chat_messages(id, session_id, role, content, created_at)
study_plans(id, user_id, payload_json, created_at)
quizzes(id, user_id, topic, difficulty, questions_json, created_at)
quiz_attempts(id, quiz_id, user_id, answers_json, score, created_at)
notes(id, user_id, title, source_text, summary, flashcards_json, created_at)
study_sessions(id, user_id, subject, minutes, created_at)
```

---

## Testing

```bash
cd backend && pytest                  # backend
cd frontend && npm run lint           # frontend
```

---

## License

MIT — see `LICENSE`.
