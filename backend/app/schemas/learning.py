"""Pydantic schemas for planner, quizzes, notes, analytics, and recommendations."""
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

# ---------- Planner ----------


class PlannerInput(BaseModel):
    subjects: list[str] = Field(min_length=1)
    goals: str = Field(min_length=1, max_length=500)
    exam_date: date | None = None
    weak_topics: list[str] = Field(default_factory=list)
    hours_per_day: float = Field(gt=0, le=16)
    days_to_plan: int = Field(default=7, ge=1, le=30)


class PlanBlock(BaseModel):
    subject: str
    topic: str
    minutes: int
    notes: str | None = None


class PlanDay(BaseModel):
    date: str  # ISO date
    blocks: list[PlanBlock]


class StudyPlanRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    payload: dict  # {"days": [PlanDay...]}
    inputs: dict
    created_at: datetime


# ---------- Quizzes ----------

Difficulty = Literal["easy", "medium", "hard"]


class QuizGenerateRequest(BaseModel):
    topic: str = Field(min_length=2, max_length=200)
    difficulty: Difficulty = "medium"
    num_questions: int = Field(default=5, ge=1, le=20)


class QuizQuestion(BaseModel):
    id: int
    prompt: str
    choices: list[str]
    correct_index: int
    explanation: str


class QuizRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    topic: str
    difficulty: str
    questions: list[QuizQuestion]
    created_at: datetime


class QuizPublicQuestion(BaseModel):
    """Question shape sent to the client — correct_index hidden."""

    id: int
    prompt: str
    choices: list[str]


class QuizPublic(BaseModel):
    id: int
    topic: str
    difficulty: str
    questions: list[QuizPublicQuestion]


class QuizSubmission(BaseModel):
    answers: dict[int, int]  # question_id -> chosen_index


class QuizResultItem(BaseModel):
    question_id: int
    correct: bool
    correct_index: int
    explanation: str


class QuizResult(BaseModel):
    quiz_id: int
    score: float
    results: list[QuizResultItem]


# ---------- Notes ----------


class NoteCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    source_text: str = Field(min_length=20)


class NoteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    summary: str | None
    key_points: list[str] | None
    flashcards: list[dict] | None
    created_at: datetime


# ---------- Analytics ----------


class AnalyticsSummary(BaseModel):
    total_study_minutes: int
    sessions_this_week: int
    current_streak_days: int
    average_quiz_score: float
    quizzes_taken: int
    weak_topics: list[str]
    by_subject_minutes: dict[str, int]
    daily_minutes_last_14: list[dict]  # [{"date": "YYYY-MM-DD", "minutes": int}]
    suggestions: list[str]


# ---------- Recommendations ----------


class Recommendation(BaseModel):
    kind: Literal["topic", "practice", "resource"]
    title: str
    reason: str
    action_url: str | None = None
