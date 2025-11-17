"""Flashcard generation endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import logging
import json

from app.middleware.auth import get_current_user
from app.services.pdf_extractor import extract_and_chunk_pdf, PDFExtractionError
from app.services.llm_provider import get_llm_provider, PromptTemplates, LLMError
from app.utils.supabase_client import get_supabase_client


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["flashcards"])


class FlashcardGenerateRequest(BaseModel):
    """Request model for flashcard generation"""
    note_id: str
    max_flashcards: int = Field(default=50, ge=5, le=100)


class Flashcard(BaseModel):
    """Flashcard model"""
    id: Optional[str] = None
    question: str
    answer: str
    topic: Optional[str] = None


class FlashcardGenerateResponse(BaseModel):
    """Response model for flashcard generation"""
    flashcards: List[Flashcard]
    count: int
    note_id: str


@router.post("/generate-flashcards", response_model=FlashcardGenerateResponse)
async def generate_flashcards(
    request: FlashcardGenerateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate flashcards from a PDF note
    
    This endpoint:
    1. Fetches the PDF from storage
    2. Extracts and chunks the text (500 words with 50-word overlap)
    3. Uses LLM to generate Q&A pairs from each chunk
    4. Saves flashcards to database
    5. Returns the generated flashcards
    """
    user_id = current_user["user_id"]
    note_id = request.note_id
    
    logger.info(f"Generating flashcards for note {note_id}, user {user_id}")
    
    try:
        # Step 1: Extract and chunk PDF text
        logger.info(f"Extracting text from PDF {note_id}")
        chunks = await extract_and_chunk_pdf(
            note_id=note_id,
            chunk_size=500,
            overlap=50,
            use_ocr=False
        )
        
        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the PDF"
            )
        
        logger.info(f"Extracted {len(chunks)} chunks from PDF")
        
        # Step 2: Generate flashcards from chunks using LLM
        llm_provider = get_llm_provider()
        all_flashcards = []
        failed_chunks = 0
        
        # Limit chunks to process based on max_flashcards
        # Assuming ~4 flashcards per chunk, process enough chunks
        max_chunks = min(len(chunks), (request.max_flashcards // 4) + 2)
        
        for i, chunk in enumerate(chunks[:max_chunks]):
            if len(all_flashcards) >= request.max_flashcards:
                break
            
            try:
                logger.info(f"Processing chunk {i+1}/{max_chunks}")
                
                # Get prompt template
                prompt_data = PromptTemplates.flashcard_generation(chunk["content"])
                
                # Generate flashcards using LLM
                response = await llm_provider.generate_text(
                    prompt=prompt_data["prompt"],
                    system_message=prompt_data["system_message"],
                    temperature=0.7,
                    max_tokens=1000,
                    response_format="json_object"
                )
                
                # Parse JSON response
                try:
                    # Handle both array and object responses
                    parsed = json.loads(response)
                    if isinstance(parsed, dict) and "flashcards" in parsed:
                        flashcards_data = parsed["flashcards"]
                    elif isinstance(parsed, list):
                        flashcards_data = parsed
                    else:
                        flashcards_data = [parsed]
                    
                    # Validate and add flashcards
                    for card in flashcards_data:
                        if isinstance(card, dict) and "question" in card and "answer" in card:
                            all_flashcards.append({
                                "question": card["question"],
                                "answer": card["answer"],
                                "topic": card.get("topic", f"Page {chunk['page_number']}")
                            })
                    
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse JSON from chunk {i}: {e}")
                    failed_chunks += 1
                    continue
                
            except LLMError as e:
                logger.warning(f"LLM error on chunk {i}: {e}")
                failed_chunks += 1
                continue
            except Exception as e:
                logger.warning(f"Error processing chunk {i}: {e}")
                failed_chunks += 1
                continue
        
        # Limit to max_flashcards
        all_flashcards = all_flashcards[:request.max_flashcards]
        
        if not all_flashcards:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate any flashcards from the PDF"
            )
        
        logger.info(f"Generated {len(all_flashcards)} flashcards ({failed_chunks} chunks failed)")
        
        # Step 3: Save flashcards to database
        supabase_client = get_supabase_client()
        saved_flashcards = await supabase_client.insert_flashcards(
            flashcards=all_flashcards,
            user_id=user_id,
            source_note_id=note_id
        )
        
        # Convert to response model
        flashcard_objects = [
            Flashcard(
                id=card.get("id"),
                question=card["question"],
                answer=card["answer"],
                topic=card.get("topic")
            )
            for card in saved_flashcards
        ]
        
        logger.info(f"Successfully saved {len(flashcard_objects)} flashcards to database")
        
        return FlashcardGenerateResponse(
            flashcards=flashcard_objects,
            count=len(flashcard_objects),
            note_id=note_id
        )
        
    except PDFExtractionError as e:
        logger.error(f"PDF extraction error: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to extract text from PDF: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error generating flashcards: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate flashcards: {str(e)}"
        )
