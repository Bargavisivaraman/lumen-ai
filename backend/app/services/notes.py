"""Note summarization, key-point extraction, and flashcard generation."""
from __future__ import annotations

import io
from typing import Any

from app.services.ai_provider import get_ai_provider

NOTES_SYSTEM = """You help students learn from their own notes. You return ONLY JSON with three fields:
"summary" (4-7 sentences), "key_points" (5-10 bullets), and "flashcards" (8-15 Q&A pairs).
Flashcards must be answerable from the source text."""


def _notes_prompt(text: str) -> str:
    # Keep input bounded for cost/safety.
    snippet = text[:12000]
    return f"""Source text:
\"\"\"
{snippet}
\"\"\"

Return JSON of this exact shape:
{{
  "summary": "...",
  "key_points": ["...", "..."],
  "flashcards": [{{"front": "question", "back": "answer"}}]
}}"""


def analyze_text(text: str) -> dict[str, Any]:
    provider = get_ai_provider()
    raw = provider.json(
        [
            {"role": "system", "content": NOTES_SYSTEM},
            {"role": "user", "content": _notes_prompt(text)},
        ],
        temperature=0.3,
    )
    return {
        "summary": str(raw.get("summary", ""))[:4000],
        "key_points": [str(k)[:300] for k in (raw.get("key_points") or [])][:15],
        "flashcards": [
            {"front": str(f.get("front", ""))[:300], "back": str(f.get("back", ""))[:600]}
            for f in (raw.get("flashcards") or [])
        ][:30],
    }


def extract_pdf_text(file_bytes: bytes) -> str:
    """Pull plain text from an uploaded PDF using pypdf."""
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(file_bytes))
    parts: list[str] = []
    for page in reader.pages:
        try:
            parts.append(page.extract_text() or "")
        except Exception:
            continue
    return "\n\n".join(parts).strip()
