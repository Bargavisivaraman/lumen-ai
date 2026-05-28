"""Study plan ORM model. Plan content is stored as JSON for flexibility."""
from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(200), default="My study plan")
    # Stored shape: {"days": [{"date": "...", "blocks": [{"subject": "...", "topic": "...", "minutes": int}]}]}
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    # Original inputs for re-generation
    inputs: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
