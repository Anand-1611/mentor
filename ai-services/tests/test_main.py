"""Tests for main application"""
import pytest
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "MentorLink AI Services"
    assert data["status"] == "running"


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_flashcard_endpoint_requires_auth():
    """Test that flashcard endpoint requires authentication"""
    response = client.post(
        "/ai/generate-flashcards",
        json={"note_id": "test-note-id"}
    )
    assert response.status_code == 401


def test_quiz_endpoint_requires_auth():
    """Test that quiz endpoint requires authentication"""
    response = client.post(
        "/ai/generate-quiz",
        json={
            "note_id": "test-note-id",
            "quiz_type": "mcq",
            "count": 10,
            "difficulty": "medium"
        }
    )
    assert response.status_code == 401


def test_chat_endpoint_requires_auth():
    """Test that chat endpoint requires authentication"""
    response = client.post(
        "/ai/chat-pdf",
        json={
            "note_id": "test-note-id",
            "question": "What is this about?"
        }
    )
    assert response.status_code == 401
