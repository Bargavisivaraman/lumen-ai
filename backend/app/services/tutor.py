"""High-level AI tutor service: prompts + provider orchestration."""
from __future__ import annotations

from app.services.ai_provider import get_ai_provider

TUTOR_SYSTEM_PROMPT = """You are an expert virtual tutor for school and university students.

Your behavior:
- Adapt to the learner's level. If they sound like a beginner, use simple language and analogies.
  If they sound advanced, go deeper.
- Explain step by step. When you do math or code, show working.
- Use short paragraphs and bullet lists where they aid comprehension.
- End with a single follow-up question or a small practice prompt when it would help learning.
- Never invent facts. If you are unsure, say so and suggest how to verify.
- Stay focused on learning. Decline non-academic or unsafe requests politely.
"""


def build_tutor_messages(history: list[dict[str, str]], new_user_message: str) -> list[dict[str, str]]:
    """Construct an OpenAI-style message list for the tutor.

    ``history`` is the full prior conversation in chronological order.
    Each entry: ``{"role": "user"|"assistant", "content": str}``.
    """
    messages: list[dict[str, str]] = [{"role": "system", "content": TUTOR_SYSTEM_PROMPT}]
    # Keep history bounded to roughly the last 20 turns to stay within context.
    messages.extend(history[-20:])
    messages.append({"role": "user", "content": new_user_message})
    return messages


def reply_to_student(history: list[dict[str, str]], new_user_message: str) -> str:
    provider = get_ai_provider()
    messages = build_tutor_messages(history, new_user_message)
    return provider.chat(messages, temperature=0.6)
