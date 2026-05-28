"""Study planner endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.planner import StudyPlan
from app.models.user import User
from app.schemas.learning import PlannerInput, StudyPlanRead
from app.services.planner import generate_plan

router = APIRouter(prefix="/planner", tags=["planner"])


@router.post("/generate", response_model=StudyPlanRead, status_code=201)
def create_plan(
    payload: PlannerInput,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> StudyPlanRead:
    plan_payload = generate_plan(payload)
    plan = StudyPlan(
        user_id=user.id,
        title=f"{payload.days_to_plan}-day plan: {', '.join(payload.subjects[:3])}",
        payload=plan_payload,
        inputs=payload.model_dump(mode="json"),
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return StudyPlanRead.model_validate(plan)


@router.get("/me", response_model=StudyPlanRead | None)
def latest_plan(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> StudyPlanRead | None:
    plan = db.execute(
        select(StudyPlan)
        .where(StudyPlan.user_id == user.id)
        .order_by(StudyPlan.created_at.desc())
        .limit(1)
    ).scalar_one_or_none()
    if plan is None:
        return None
    return StudyPlanRead.model_validate(plan)


@router.get("/{plan_id}", response_model=StudyPlanRead)
def get_plan(
    plan_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> StudyPlanRead:
    plan = db.execute(
        select(StudyPlan).where(StudyPlan.id == plan_id, StudyPlan.user_id == user.id)
    ).scalar_one_or_none()
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    return StudyPlanRead.model_validate(plan)
