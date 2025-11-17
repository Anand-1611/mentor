"""Quiz generation endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

from app.middleware.auth import get_current_user


router = APIRouter(prefix="/ai", tags=["quiz"])


class QuizType(str, Enum):
    """Quiz question types"""
    MCQ = "mcq"
    SHORT = "short"
    LONG = "long"


class Difficulty(str, Enum):
    """Quiz difficulty levels"""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class QuizGenerateRequest(BaseModel):
    """Request model for quiz generation"""
    note_id: str
    quiz_type: QuizType
    count: int = 10
    difficulty: Difficulty = Difficulty.MEDIUM


class QuizQuestion(BaseModel):
    """Quiz question model"""
    question: str
    options: Optional[List[str]] = None  # For MCQ
    correct_answer: str
    explanation: str


class QuizGenerateResponse(BaseModel):
    """Response model for quiz generation"""
    quiz_id: str
    questions: List[QuizQuestion]


@router.post("/generate-quiz", response_model=QuizGenerateResponse)
async def generate_quiz(
    request: QuizGenerateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a quiz from a PDF note
    
    Args:
        request: Quiz generation parameters
        current_user: Authenticated user from JWT
        
    Returns:
        QuizGenerateResponse with quiz_id and questions
        
    Raises:
        HTTPException: If PDF extraction or quiz generation fails
    """
    from app.services.pdf_extractor import extract_text_from_pdf
    from app.services.llm_provider import get_llm_provider, PromptTemplates
    from app.utils.supabase_client import get_supabase_client
    import json
    import logging
    
    logger = logging.getLogger(__name__)
    
    try:
        # Validate count range
        if not 5 <= request.count <= 30:
            raise HTTPException(
                status_code=400,
                detail="Question count must be between 5 and 30"
            )
        
        # Extract text from PDF
        logger.info(f"Extracting text from note {request.note_id}")
        pages_text = await extract_text_from_pdf(request.note_id)
        
        # Combine all pages into single text
        full_text = "\n\n".join([text for _, text in pages_text])
        
        if not full_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the PDF"
            )
        
        # Select relevant sections based on difficulty
        # For harder questions, use more complex sections (later pages often have advanced content)
        if request.difficulty == Difficulty.HARD and len(full_text) > 3000:
            # Use middle to end sections for hard questions
            text_to_use = full_text[len(full_text)//3:][:3000]
        elif request.difficulty == Difficulty.EASY and len(full_text) > 3000:
            # Use beginning sections for easy questions
            text_to_use = full_text[:3000]
        else:
            # Use full text (up to 3000 chars) for medium or short documents
            text_to_use = full_text[:3000]
        
        # Get LLM provider
        llm = get_llm_provider()
        
        # Generate questions based on quiz type
        logger.info(f"Generating {request.count} {request.quiz_type} questions at {request.difficulty} difficulty")
        
        if request.quiz_type == QuizType.MCQ:
            prompt_data = PromptTemplates.quiz_generation_mcq(
                text_to_use, request.count, request.difficulty.value
            )
        elif request.quiz_type == QuizType.SHORT:
            prompt_data = PromptTemplates.quiz_generation_short(
                text_to_use, request.count, request.difficulty.value
            )
        else:  # LONG
            prompt_data = PromptTemplates.quiz_generation_long(
                text_to_use, request.count, request.difficulty.value
            )
        
        # Call LLM with JSON response format
        response_text = await llm.generate_text(
            prompt=prompt_data["prompt"],
            system_message=prompt_data["system_message"],
            temperature=0.7,
            max_tokens=3000,
            response_format="json_object"
        )
        
        # Parse JSON response
        try:
            # Handle both array and object responses
            response_json = json.loads(response_text)
            if isinstance(response_json, dict) and "questions" in response_json:
                questions_data = response_json["questions"]
            elif isinstance(response_json, list):
                questions_data = response_json
            else:
                raise ValueError("Unexpected response format")
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse LLM response: {e}")
            logger.error(f"Response text: {response_text}")
            raise HTTPException(
                status_code=500,
                detail="Failed to parse quiz questions from AI response"
            )
        
        # Validate and format questions
        questions = []
        for q_data in questions_data[:request.count]:  # Limit to requested count
            try:
                question = QuizQuestion(
                    question=q_data["question"],
                    options=q_data.get("options"),
                    correct_answer=q_data["correct_answer"],
                    explanation=q_data["explanation"]
                )
                questions.append(question)
            except (KeyError, ValueError) as e:
                logger.warning(f"Skipping invalid question: {e}")
                continue
        
        if not questions:
            raise HTTPException(
                status_code=500,
                detail="No valid questions were generated"
            )
        
        # Save quiz to database (will be implemented in next subtask)
        supabase = get_supabase_client()
        quiz_data = {
            "creator_id": current_user["sub"],
            "topic": request.note_id,
            "questions": [q.dict() for q in questions]
        }
        
        result = supabase.table("quizzes").insert(quiz_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to save quiz to database"
            )
        
        quiz_id = result.data[0]["id"]
        
        logger.info(f"Successfully generated quiz {quiz_id} with {len(questions)} questions")
        
        return QuizGenerateResponse(
            quiz_id=quiz_id,
            questions=questions
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating quiz: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate quiz: {str(e)}"
        )
