"""Thin abstraction over LLM providers.

The application speaks to a single ``AIProvider`` interface and the concrete
implementation is chosen at startup based on which API keys are configured.

Providers
---------
* ``OpenAIProvider`` — preferred when ``OPENAI_API_KEY`` is set.
* ``GeminiProvider`` — fallback when ``GEMINI_API_KEY`` is set.
* ``OfflineProvider`` — deterministic stub so the app runs end-to-end without
  any API keys (useful for local development, demos, and CI).
"""
from __future__ import annotations

import json
import logging
import random
from abc import ABC, abstractmethod
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)


class AIProvider(ABC):
    @abstractmethod
    def chat(self, messages: list[dict[str, str]], *, temperature: float = 0.7) -> str:
        """Return a plain-text reply for a chat-style message list."""

    def json(self, messages: list[dict[str, str]], *, temperature: float = 0.4) -> Any:
        """Return a parsed JSON object. Default impl just parses chat() output."""
        raw = self.chat(messages, temperature=temperature)
        return _extract_json(raw)


# ---------- OpenAI ----------


class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str, model: str = "gpt-4o-mini") -> None:
        from openai import OpenAI

        self._client = OpenAI(api_key=api_key)
        self._model = model

    def chat(self, messages: list[dict[str, str]], *, temperature: float = 0.7) -> str:
        resp = self._client.chat.completions.create(
            model=self._model, messages=messages, temperature=temperature
        )
        return (resp.choices[0].message.content or "").strip()

    def json(self, messages: list[dict[str, str]], *, temperature: float = 0.4) -> Any:
        resp = self._client.chat.completions.create(
            model=self._model,
            messages=messages,
            temperature=temperature,
            response_format={"type": "json_object"},
        )
        return json.loads(resp.choices[0].message.content or "{}")


# ---------- Gemini ----------


class GeminiProvider(AIProvider):
    def __init__(self, api_key: str, model: str = "gemini-1.5-flash") -> None:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        self._model = genai.GenerativeModel(model)

    def chat(self, messages: list[dict[str, str]], *, temperature: float = 0.7) -> str:
        # Gemini doesn't natively use the OpenAI message shape; flatten to a single prompt.
        prompt_lines: list[str] = []
        for m in messages:
            role = m["role"].upper()
            prompt_lines.append(f"[{role}]\n{m['content']}")
        prompt = "\n\n".join(prompt_lines)
        resp = self._model.generate_content(prompt, generation_config={"temperature": temperature})
        return (resp.text or "").strip()


# ---------- Offline fallback ----------


class OfflineProvider(AIProvider):
    """Deterministic stub so the app remains demoable without API keys."""

    def chat(self, messages: list[dict[str, str]], *, temperature: float = 0.7) -> str:
        last_user = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        return (
            "I'm running in offline demo mode (no AI API key configured), but here's a useful "
            f"sketch of an answer to: \"{last_user[:160]}\".\n\n"
            "1. Identify the core concept.\n"
            "2. Break it into smaller pieces.\n"
            "3. Work through a concrete example.\n"
            "4. Try a similar problem on your own.\n\n"
            "Add an OPENAI_API_KEY (or GEMINI_API_KEY) to .env to get real AI responses."
        )

    def json(self, messages: list[dict[str, str]], *, temperature: float = 0.4) -> Any:
        # Return a generic structure the planner/quiz code can still consume.
        last_user = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        if "quiz" in last_user.lower() or "question" in last_user.lower():
            return {
                "questions": [
                    {
                        "prompt": f"[Demo Q{i+1}] Sample question about your topic?",
                        "choices": ["Option A", "Option B", "Option C", "Option D"],
                        "correct_index": random.randint(0, 3),
                        "explanation": "This is a demo explanation — set OPENAI_API_KEY for real quizzes.",
                    }
                    for i in range(5)
                ]
            }
        if "plan" in last_user.lower() or "schedule" in last_user.lower():
            return {
                "days": [
                    {
                        "date": f"day-{i+1}",
                        "blocks": [
                            {"subject": "Sample Subject", "topic": "Sample Topic", "minutes": 60,
                             "notes": "Demo block"}
                        ],
                    }
                    for i in range(3)
                ]
            }
        if "summar" in last_user.lower() or "flashcard" in last_user.lower():
            return {
                "summary": "This is a demo summary. Configure an AI API key for real summaries.",
                "key_points": ["Key point 1", "Key point 2", "Key point 3"],
                "flashcards": [
                    {"front": "Demo question?", "back": "Demo answer."},
                    {"front": "Another demo question?", "back": "Another demo answer."},
                ],
            }
        return {"message": "offline-demo"}


# ---------- factory ----------

_provider: AIProvider | None = None


def get_ai_provider() -> AIProvider:
    global _provider
    if _provider is not None:
        return _provider
    if settings.openai_api_key:
        try:
            _provider = OpenAIProvider(settings.openai_api_key)
            logger.info("AI provider: OpenAI")
            return _provider
        except Exception as exc:  # pragma: no cover - depends on env
            logger.exception("Failed to init OpenAI provider: %s", exc)
    if settings.gemini_api_key:
        try:
            _provider = GeminiProvider(settings.gemini_api_key)
            logger.info("AI provider: Gemini")
            return _provider
        except Exception as exc:  # pragma: no cover
            logger.exception("Failed to init Gemini provider: %s", exc)
    logger.warning("No AI API key configured — using OfflineProvider")
    _provider = OfflineProvider()
    return _provider


def _extract_json(text: str) -> Any:
    """Best-effort JSON extraction from a model response."""
    text = text.strip()
    if text.startswith("```"):
        # Strip a fenced block
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
        text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find the first `{`...matching `}` block.
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start : end + 1])
        raise
