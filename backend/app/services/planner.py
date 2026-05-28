"""Study plan generation. Returns a normalized dict the API can store and serve."""
from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from app.schemas.learning import PlannerInput
from app.services.ai_provider import get_ai_provider

PLANNER_SYSTEM = """You are an expert study coach. Given the student's inputs you produce a balanced,
realistic schedule. You return ONLY a JSON object matching the requested shape, no prose."""


def _planner_user_prompt(inp: PlannerInput) -> str:
    exam_clause = f"The exam date is {inp.exam_date.isoformat()}." if inp.exam_date else "No specific exam date."
    weak = ", ".join(inp.weak_topics) if inp.weak_topics else "none identified yet"
    return f"""Build a {inp.days_to_plan}-day study plan.

Subjects: {", ".join(inp.subjects)}
Goals: {inp.goals}
{exam_clause}
Weak topics: {weak}
Available study time per day: {inp.hours_per_day} hours

Rules:
- Allocate more time to weak topics early in the plan.
- Mix subjects within a day to avoid fatigue.
- Include short review blocks every 2-3 days.
- Block sizes between 25 and 90 minutes. Total per day must be within +-10% of the available hours.

Return JSON with this exact shape:
{{
  "days": [
    {{
      "date": "YYYY-MM-DD",
      "blocks": [
        {{"subject": "...", "topic": "...", "minutes": 60, "notes": "short coaching note"}}
      ]
    }}
  ]
}}"""


def generate_plan(inp: PlannerInput) -> dict[str, Any]:
    provider = get_ai_provider()
    messages = [
        {"role": "system", "content": PLANNER_SYSTEM},
        {"role": "user", "content": _planner_user_prompt(inp)},
    ]
    raw = provider.json(messages, temperature=0.4)
    return _normalize_plan(raw, inp)


def _normalize_plan(raw: dict[str, Any], inp: PlannerInput) -> dict[str, Any]:
    """Make sure dates are real ISO dates starting today and blocks are sane."""
    today = date.today()
    days = raw.get("days") or []
    normalized: list[dict[str, Any]] = []
    for i in range(inp.days_to_plan):
        src = days[i] if i < len(days) else {"blocks": []}
        blocks = src.get("blocks") or []
        cleaned_blocks: list[dict[str, Any]] = []
        for b in blocks:
            try:
                minutes = int(b.get("minutes", 0))
            except (TypeError, ValueError):
                minutes = 0
            if minutes <= 0:
                continue
            cleaned_blocks.append(
                {
                    "subject": str(b.get("subject", "General"))[:120],
                    "topic": str(b.get("topic", ""))[:200],
                    "minutes": max(15, min(180, minutes)),
                    "notes": str(b.get("notes", ""))[:300] or None,
                }
            )
        normalized.append({"date": (today + timedelta(days=i)).isoformat(), "blocks": cleaned_blocks})
    return {"days": normalized}
