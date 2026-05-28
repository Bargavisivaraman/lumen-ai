"""Analytics aggregation. Pure-Python computations against the ORM."""
from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.quiz import QuizAttempt
from app.models.study import StudySession
from app.services.ai_provider import get_ai_provider


def compute_dashboard(db: Session, user_id: int) -> dict[str, Any]:
    sessions = list(
        db.execute(select(StudySession).where(StudySession.user_id == user_id)).scalars()
    )
    attempts = list(
        db.execute(select(QuizAttempt).where(QuizAttempt.user_id == user_id)).scalars()
    )

    total_minutes = sum(s.minutes for s in sessions)

    now = datetime.now(timezone.utc)
    one_week_ago = now - timedelta(days=7)
    sessions_this_week = sum(1 for s in sessions if s.created_at and s.created_at >= one_week_ago)

    # Streak: consecutive days (ending today or yesterday) with at least one session.
    day_set = {s.created_at.date() for s in sessions if s.created_at}
    streak = 0
    cursor = date.today()
    # Allow today to be empty if yesterday is filled (streak still alive).
    if cursor not in day_set and (cursor - timedelta(days=1)) in day_set:
        cursor -= timedelta(days=1)
    while cursor in day_set:
        streak += 1
        cursor -= timedelta(days=1)

    avg_score = round(sum(a.score for a in attempts) / len(attempts), 2) if attempts else 0.0

    # By subject totals
    by_subject: dict[str, int] = defaultdict(int)
    for s in sessions:
        by_subject[s.subject] += s.minutes

    # Last 14 days of minutes (zero-filled)
    today = date.today()
    last_14: list[dict[str, Any]] = []
    by_day: dict[date, int] = defaultdict(int)
    for s in sessions:
        if s.created_at:
            by_day[s.created_at.date()] += s.minutes
    for i in range(13, -1, -1):
        d = today - timedelta(days=i)
        last_14.append({"date": d.isoformat(), "minutes": by_day.get(d, 0)})

    # Weak topics = lowest-scoring quiz topics (need quiz join via attempts; keep simple)
    weak_topics: list[str] = []
    if attempts:
        per_topic_scores: dict[str, list[float]] = defaultdict(list)
        for a in attempts:
            if a.quiz is not None:
                per_topic_scores[a.quiz.topic].append(a.score)
        averaged = sorted(
            ((t, sum(v) / len(v)) for t, v in per_topic_scores.items()), key=lambda x: x[1]
        )
        weak_topics = [t for t, score in averaged if score < 70][:5]

    suggestions = _ai_suggestions(
        total_minutes=total_minutes,
        streak=streak,
        avg_score=avg_score,
        weak_topics=weak_topics,
        by_subject=dict(by_subject),
    )

    return {
        "total_study_minutes": total_minutes,
        "sessions_this_week": sessions_this_week,
        "current_streak_days": streak,
        "average_quiz_score": avg_score,
        "quizzes_taken": len(attempts),
        "weak_topics": weak_topics,
        "by_subject_minutes": dict(by_subject),
        "daily_minutes_last_14": last_14,
        "suggestions": suggestions,
    }


def _ai_suggestions(
    *,
    total_minutes: int,
    streak: int,
    avg_score: float,
    weak_topics: list[str],
    by_subject: dict[str, int],
) -> list[str]:
    """Ask the LLM for 3 short personalized suggestions. Falls back gracefully."""
    if total_minutes == 0 and not weak_topics:
        return [
            "Log your first study session to start seeing personalized insights.",
            "Take a short quiz on a topic you covered today.",
            "Set a study goal for this week from the Planner page.",
        ]
    try:
        provider = get_ai_provider()
        prompt = (
            "Given this learner profile, return JSON {\"tips\": [str, str, str]} with 3 short,"
            " specific, actionable study tips (no fluff, <= 22 words each).\n\n"
            f"Total minutes: {total_minutes}\n"
            f"Current streak (days): {streak}\n"
            f"Average quiz score: {avg_score}\n"
            f"Weak topics: {weak_topics or 'none'}\n"
            f"Minutes by subject: {by_subject}\n"
        )
        raw = provider.json(
            [
                {"role": "system", "content": "You are a concise study coach. Return only JSON."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
        )
        tips = [str(t)[:220] for t in (raw.get("tips") or [])][:3]
        if tips:
            return tips
    except Exception:
        pass
    # Deterministic fallback
    tips = []
    if streak == 0:
        tips.append("Study even 15 minutes today to start a streak — momentum compounds.")
    elif streak < 5:
        tips.append(f"You're on a {streak}-day streak. Protect it with a 20-minute review today.")
    if avg_score and avg_score < 70:
        tips.append("Your quiz average is below 70 — re-take quizzes on weak topics until you hit 85+.")
    if weak_topics:
        tips.append(f"Focus 60% of this week's study on: {', '.join(weak_topics[:3])}.")
    while len(tips) < 3:
        tips.append("Mix one new topic with a review topic in every session for better retention.")
    return tips[:3]
