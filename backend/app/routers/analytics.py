"""Analytics + study-session logging."""
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.study import StudySession
from app.models.user import User
from app.schemas.learning import AnalyticsSummary
from app.services.analytics import compute_dashboard

router = APIRouter(prefix="/analytics", tags=["analytics"])


class StudySessionCreate(BaseModel):
    subject: str = Field(min_length=1, max_length=120)
    topic: str | None = Field(default=None, max_length=200)
    minutes: int = Field(gt=0, le=600)


@router.post("/sessions", status_code=201)
def log_session(
    payload: StudySessionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    s = StudySession(
        user_id=user.id, subject=payload.subject, topic=payload.topic, minutes=payload.minutes
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return {"id": s.id, "created_at": s.created_at.isoformat()}


@router.get("/dashboard", response_model=AnalyticsSummary)
def dashboard(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> AnalyticsSummary:
    data = compute_dashboard(db, user.id)
    return AnalyticsSummary(**data)
