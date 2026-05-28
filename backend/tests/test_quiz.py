"""Quiz grading logic tests (provider-independent)."""
from app.services.quiz import grade_quiz


def test_grade_quiz_all_correct():
    questions = [
        {"id": 1, "prompt": "?", "choices": ["a", "b", "c", "d"], "correct_index": 2, "explanation": ""},
        {"id": 2, "prompt": "?", "choices": ["a", "b", "c", "d"], "correct_index": 0, "explanation": ""},
    ]
    answers = {1: 2, 2: 0}
    score, results = grade_quiz(questions, answers)
    assert score == 100.0
    assert all(r["correct"] for r in results)


def test_grade_quiz_partial():
    questions = [
        {"id": 1, "prompt": "?", "choices": ["a", "b", "c", "d"], "correct_index": 2, "explanation": "x"},
        {"id": 2, "prompt": "?", "choices": ["a", "b", "c", "d"], "correct_index": 0, "explanation": "y"},
    ]
    answers = {1: 1, 2: 0}
    score, results = grade_quiz(questions, answers)
    assert score == 50.0
    assert results[0]["correct"] is False
    assert results[1]["correct"] is True


def test_grade_quiz_empty():
    score, results = grade_quiz([], {})
    assert score == 0.0
    assert results == []
