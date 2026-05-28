"""Quiz endpoints: generate, list, submit attempts, view history."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.quiz import Quiz, QuizAttempt
from app.models.user import User
from app.schemas.learning import (
    QuizGenerateRequest,
    QuizPublic,
    QuizPublicQuestion,
    QuizResult,
    QuizResultItem,
    QuizSubmission,
)
from app.services.quiz import generate_quiz, grade_quiz

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router.post("/generate", response_model=QuizPublic, status_code=201)
def create_quiz(
    payload: QuizGenerateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> QuizPublic:
    questions = generate_quiz(payload.topic, payload.difficulty, payload.num_questions)
    quiz = Quiz(
        user_id=user.id,
        topic=payload.topic,
        difficulty=payload.difficulty,
        questions=questions,
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return QuizPublic(
        id=quiz.id,
        topic=quiz.topic,
        difficulty=quiz.difficulty,
        questions=[
            QuizPublicQuestion(id=q["id"], prompt=q["prompt"], choices=q["choices"])
            for q in quiz.questions
        ],
    )


@router.get("/{quiz_id}", response_model=QuizPublic)
def get_quiz(
    quiz_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> QuizPublic:
    quiz = db.execute(
        select(Quiz).where(Quiz.id == quiz_id, Quiz.user_id == user.id)
    ).scalar_one_or_none()
    if quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return QuizPublic(
        id=quiz.id,
        topic=quiz.topic,
        difficulty=quiz.difficulty,
        questions=[
            QuizPublicQuestion(id=q["id"], prompt=q["prompt"], choices=q["choices"])
            for q in quiz.questions
        ],
    )


@router.post("/{quiz_id}/submit", response_model=QuizResult)
def submit(
    quiz_id: int,
    payload: QuizSubmission,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> QuizResult:
    quiz = db.execute(
        select(Quiz).where(Quiz.id == quiz_id, Quiz.user_id == user.id)
    ).scalar_one_or_none()
    if quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found")
    score, results = grade_quiz(quiz.questions, payload.answers)
    attempt = QuizAttempt(
        quiz_id=quiz.id, user_id=user.id, answers=payload.answers, score=score
    )
    db.add(attempt)
    db.commit()
    return QuizResult(
        quiz_id=quiz.id,
        score=score,
        results=[QuizResultItem(**r) for r in results],
    )


@router.get("/", response_model=list[dict])
def my_quizzes(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> list[dict]:
    rows = list(
        db.execute(
            select(Quiz).where(Quiz.user_id == user.id).order_by(Quiz.created_at.desc()).limit(50)
        ).scalars()
    )
    return [
        {
            "id": q.id,
            "topic": q.topic,
            "difficulty": q.difficulty,
            "created_at": q.created_at,
            "num_questions": len(q.questions),
        }
        for q in rows
    ]
