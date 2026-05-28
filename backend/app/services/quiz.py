"""Quiz generation and grading services."""
from __future__ import annotations

from typing import Any

from app.services.ai_provider import get_ai_provider

QUIZ_SYSTEM = """You write high quality multiple-choice questions for student practice. You return ONLY
JSON, no commentary. Each question has exactly 4 choices, one correct, a one-sentence explanation."""


def _quiz_prompt(topic: str, difficulty: str, n: int) -> str:
    return f"""Create {n} multiple-choice practice questions on the topic: "{topic}".
Difficulty: {difficulty}.
The questions should be varied (definitions, application, edge cases) and unambiguous.

Return JSON of this shape:
{{
  "questions": [
    {{
      "prompt": "...",
      "choices": ["...", "...", "...", "..."],
      "correct_index": 0,
      "explanation": "one or two sentences"
    }}
  ]
}}"""


def generate_quiz(topic: str, difficulty: str, n: int) -> list[dict[str, Any]]:
    provider = get_ai_provider()
    raw = provider.json(
        [
            {"role": "system", "content": QUIZ_SYSTEM},
            {"role": "user", "content": _quiz_prompt(topic, difficulty, n)},
        ],
        temperature=0.5,
    )
    questions_raw = raw.get("questions") or []
    cleaned: list[dict[str, Any]] = []
    for idx, q in enumerate(questions_raw[:n], start=1):
        choices = [str(c) for c in (q.get("choices") or [])][:4]
        if len(choices) < 4:
            # Pad to avoid breaking the UI; mark first as correct as a last resort.
            choices += [f"Option {chr(65+i)}" for i in range(len(choices), 4)]
        try:
            correct = int(q.get("correct_index", 0))
        except (TypeError, ValueError):
            correct = 0
        correct = max(0, min(3, correct))
        cleaned.append(
            {
                "id": idx,
                "prompt": str(q.get("prompt", f"Question {idx}"))[:600],
                "choices": choices,
                "correct_index": correct,
                "explanation": str(q.get("explanation", ""))[:600],
            }
        )
    return cleaned


def grade_quiz(questions: list[dict[str, Any]], answers: dict[int, int]) -> tuple[float, list[dict[str, Any]]]:
    """Return (score 0-100, per-question results)."""
    if not questions:
        return 0.0, []
    results: list[dict[str, Any]] = []
    correct_count = 0
    for q in questions:
        qid = int(q["id"])
        chosen = answers.get(qid)
        # Accept string keys defensively (JSON dicts can stringify ints)
        if chosen is None:
            chosen = answers.get(str(qid))  # type: ignore[arg-type]
        is_correct = chosen is not None and int(chosen) == int(q["correct_index"])
        if is_correct:
            correct_count += 1
        results.append(
            {
                "question_id": qid,
                "correct": is_correct,
                "correct_index": int(q["correct_index"]),
                "explanation": q.get("explanation", ""),
            }
        )
    score = round(100.0 * correct_count / len(questions), 2)
    return score, results
