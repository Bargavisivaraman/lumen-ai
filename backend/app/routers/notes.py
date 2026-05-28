"""Notes endpoints: create from text, upload PDF, list, fetch."""
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.note import Note
from app.models.user import User
from app.schemas.learning import NoteCreate, NoteRead
from app.services.notes import analyze_text, extract_pdf_text

router = APIRouter(prefix="/notes", tags=["notes"])

MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/text", response_model=NoteRead, status_code=201)
def create_from_text(
    payload: NoteCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> NoteRead:
    analysis = analyze_text(payload.source_text)
    note = Note(
        user_id=user.id,
        title=payload.title,
        source_text=payload.source_text,
        summary=analysis["summary"],
        key_points=analysis["key_points"],
        flashcards=analysis["flashcards"],
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return NoteRead.model_validate(note)


@router.post("/upload", response_model=NoteRead, status_code=201)
async def upload_pdf(
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> NoteRead:
    if file.content_type not in {"application/pdf", "text/plain"}:
        raise HTTPException(status_code=400, detail="Only PDF or plain text uploads are supported")
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 5 MB)")

    if file.content_type == "application/pdf":
        text = extract_pdf_text(data)
    else:
        text = data.decode("utf-8", errors="ignore")

    if len(text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Could not extract enough text from the file")

    analysis = analyze_text(text)
    note = Note(
        user_id=user.id,
        title=title,
        source_text=text,
        summary=analysis["summary"],
        key_points=analysis["key_points"],
        flashcards=analysis["flashcards"],
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return NoteRead.model_validate(note)


@router.get("/", response_model=list[NoteRead])
def list_notes(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> list[NoteRead]:
    rows = list(
        db.execute(
            select(Note).where(Note.user_id == user.id).order_by(Note.created_at.desc())
        ).scalars()
    )
    return [NoteRead.model_validate(n) for n in rows]


@router.get("/{note_id}", response_model=NoteRead)
def get_note(
    note_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> NoteRead:
    note = db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == user.id)
    ).scalar_one_or_none()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return NoteRead.model_validate(note)


@router.delete("/{note_id}", status_code=204)
def delete_note(
    note_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> None:
    note = db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == user.id)
    ).scalar_one_or_none()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
