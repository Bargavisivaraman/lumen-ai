"""Pytest fixtures: in-memory DB and authenticated test client."""
import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_aitutor.db")
os.environ.setdefault("JWT_SECRET", "test-secret")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.session import Base, get_db
from app.main import app


@pytest.fixture(scope="session")
def engine():
    eng = create_engine("sqlite:///./test_aitutor.db", connect_args={"check_same_thread": False})
    # Import all models so metadata is populated
    from app.models import user, chat, planner, quiz, note, study  # noqa: F401
    Base.metadata.drop_all(bind=eng)
    Base.metadata.create_all(bind=eng)
    yield eng
    Base.metadata.drop_all(bind=eng)


@pytest.fixture
def db(engine):
    TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(engine):
    TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    def _override():
        s = TestingSession()
        try:
            yield s
        finally:
            s.close()

    app.dependency_overrides[get_db] = _override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
