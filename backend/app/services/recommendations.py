"""Personalized recommendations derived from analytics + AI."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.services.analytics import compute_dashboard


def build_recommendations(db: Session, user_id: int) -> list[dict]:
    stats = compute_dashboard(db, user_id)
    recs: list[dict] = []

    for topic in stats["weak_topics"][:3]:
        recs.append(
            {
                "kind": "topic",
                "title": f"Revise: {topic}",
                "reason": "Your average score on this topic is below 70%.",
                "action_url": f"/quiz?topic={topic}",
            }
        )

    if stats["current_streak_days"] == 0:
        recs.append(
            {
                "kind": "practice",
                "title": "Take a 5-question quick quiz",
                "reason": "You don't have a study session today — a short quiz restarts your streak.",
                "action_url": "/quiz",
            }
        )

    # Subjects studied the least get bumped up
    by_subject = stats["by_subject_minutes"]
    if by_subject:
        least = min(by_subject.items(), key=lambda kv: kv[1])
        recs.append(
            {
                "kind": "topic",
                "title": f"Spend more time on {least[0]}",
                "reason": f"Only {least[1]} minutes logged so far. Aim for at least 45 more this week.",
                "action_url": "/planner",
            }
        )

    if stats["quizzes_taken"] < 3:
        recs.append(
            {
                "kind": "practice",
                "title": "Generate your first AI quiz",
                "reason": "Quizzes give the analytics dashboard signal to personalize advice.",
                "action_url": "/quiz",
            }
        )

    # Always include a learning resource
    recs.append(
        {
            "kind": "resource",
            "title": "Upload your class notes",
            "reason": "AI summarizes them and creates flashcards from your own material.",
            "action_url": "/notes",
        }
    )

    return recs[:6]
