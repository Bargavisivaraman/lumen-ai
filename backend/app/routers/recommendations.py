"""Recommendation feed endpoint."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.learning import Recommendation
from app.services.recommendations import build_recommendations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/", response_model=list[Recommendation])
def feed(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> list[Recommendation]:
    return [Recommendation(**r) for r in build_recommendations(db, user.id)]
