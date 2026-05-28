"""Chat endpoints: send a message, list sessions, fetch a session with messages."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.chat import ChatMessage, ChatSession
from app.models.user import User
from app.schemas.chat import (
    ChatMessageCreate,
    ChatMessageRead,
    ChatReply,
    ChatSessionRead,
    ChatSessionWithMessages,
)
from app.services.tutor import reply_to_student

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/sessions", response_model=list[ChatSessionRead])
def list_sessions(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> list[ChatSessionRead]:
    rows = list(
        db.execute(
            select(ChatSession)
            .where(ChatSession.user_id == user.id)
            .order_by(ChatSession.created_at.desc())
        ).scalars()
    )
    return [ChatSessionRead.model_validate(r) for r in rows]


@router.get("/sessions/{session_id}", response_model=ChatSessionWithMessages)
def get_session(
    session_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> ChatSessionWithMessages:
    session = db.execute(
        select(ChatSession)
        .where(ChatSession.id == session_id, ChatSession.user_id == user.id)
        .options(selectinload(ChatSession.messages))
    ).scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return ChatSessionWithMessages(
        id=session.id,
        title=session.title,
        created_at=session.created_at,
        messages=[ChatMessageRead.model_validate(m) for m in session.messages],
    )


@router.post("/messages", response_model=ChatReply)
def send_message(
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ChatReply:
    # Resolve or create session
    if payload.session_id is not None:
        session = db.execute(
            select(ChatSession)
            .where(ChatSession.id == payload.session_id, ChatSession.user_id == user.id)
            .options(selectinload(ChatSession.messages))
        ).scalar_one_or_none()
        if session is None:
            raise HTTPException(status_code=404, detail="Session not found")
    else:
        session = ChatSession(user_id=user.id, title=payload.content[:60])
        db.add(session)
        db.flush()  # populate id

    history = [{"role": m.role, "content": m.content} for m in (session.messages or [])]

    # Save the user message
    user_msg = ChatMessage(session_id=session.id, role="user", content=payload.content)
    db.add(user_msg)
    db.flush()

    # Generate the AI reply
    assistant_text = reply_to_student(history, payload.content)
    assistant_msg = ChatMessage(session_id=session.id, role="assistant", content=assistant_text)
    db.add(assistant_msg)

    db.commit()
    db.refresh(session)
    db.refresh(user_msg)
    db.refresh(assistant_msg)

    return ChatReply(
        session=ChatSessionRead.model_validate(session),
        user_message=ChatMessageRead.model_validate(user_msg),
        assistant_message=ChatMessageRead.model_validate(assistant_msg),
    )


@router.delete("/sessions/{session_id}", status_code=204)
def delete_session(
    session_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> None:
    session = db.execute(
        select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == user.id)
    ).scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
