"""Admin endpoints: list users, basic platform stats."""
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.db.session import get_db
from app.models.chat import ChatMessage
from app.models.quiz import QuizAttempt
from app.models.study import StudySession
from app.models.user import User
from app.schemas.user import UserRead

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserRead])
def list_users(
    _: User = Depends(require_admin), db: Session = Depends(get_db)
) -> list[UserRead]:
    rows = list(db.execute(select(User).order_by(User.created_at.desc())).scalars())
    return [UserRead.model_validate(u) for u in rows]


@router.get("/stats")
def platform_stats(
    _: User = Depends(require_admin), db: Session = Depends(get_db)
) -> dict:
    total_users = db.execute(select(func.count(User.id))).scalar_one()
    total_messages = db.execute(select(func.count(ChatMessage.id))).scalar_one()
    total_attempts = db.execute(select(func.count(QuizAttempt.id))).scalar_one()
    total_minutes = db.execute(select(func.coalesce(func.sum(StudySession.minutes), 0))).scalar_one()
    avg_score = db.execute(select(func.coalesce(func.avg(QuizAttempt.score), 0.0))).scalar_one()
    return {
        "total_users": int(total_users),
        "total_chat_messages": int(total_messages),
        "total_quiz_attempts": int(total_attempts),
        "total_study_minutes": int(total_minutes),
        "average_quiz_score": round(float(avg_score), 2),
    }
