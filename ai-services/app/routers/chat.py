"""PDF chat endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging

from app.middleware.auth import get_current_user
from app.services.pdf_extractor import extract_and_chunk_pdf, PDFExtractionError
from app.services.vector_db import get_vector_db
from app.services.llm_provider import get_llm_provider, PromptTemplates, LLMError
from app.utils.supabase_client import get_supabase_client


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["chat"])


class IndexPDFRequest(BaseModel):
    """Request model for PDF indexing"""
    note_id: str


class IndexPDFResponse(BaseModel):
    """Response model for PDF indexing"""
    note_id: str
    chunks_indexed: int
    success: bool


class ChatMessage(BaseModel):
    """Chat message model"""
    role: str  # 'user' or 'assistant'
    content: str


class ChatPDFRequest(BaseModel):
    """Request model for PDF chat"""
    note_id: str
    question: str
    history: List[ChatMessage] = []


class ChatPDFResponse(BaseModel):
    """Response model for PDF chat"""
    answer: str
    pages: List[int]
    sources: List[str]


@router.post("/index-pdf", response_model=IndexPDFResponse)
async def index_pdf(
    request: IndexPDFRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Index a PDF for semantic search
    
    This endpoint:
    1. Extracts text from PDF and chunks it (300 words with 50-word overlap)
    2. Generates embeddings for each chunk using sentence-transformers
    3. Stores embeddings in FAISS index
    4. Saves chunk metadata to pdf_chunks table
    5. Marks note as indexed
    """
    note_id = request.note_id
    user_id = current_user["user_id"]
    
    logger.info(f"Indexing PDF {note_id} for user {user_id}")
    
    try:
        # Step 1: Extract and chunk PDF text (300 words with 50-word overlap)
        logger.info(f"Extracting text from PDF {note_id}")
        chunks = await extract_and_chunk_pdf(
            note_id=note_id,
            chunk_size=300,
            overlap=50,
            use_ocr=False
        )
        
        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the PDF"
            )
        
        logger.info(f"Extracted {len(chunks)} chunks from PDF")
        
        # Step 2: Get vector database instance
        vector_db = get_vector_db()
        
        # Step 3: Add documents to vector database (generates embeddings and stores in FAISS)
        logger.info(f"Generating embeddings and adding to FAISS index")
        chunks_added = vector_db.add_documents(
            note_id=note_id,
            chunks=chunks
        )
        
        logger.info(f"Added {chunks_added} chunks to vector database")
        
        # Step 4: Save chunk metadata to database
        supabase_client = get_supabase_client()
        saved_chunks = await supabase_client.insert_pdf_chunks(
            note_id=note_id,
            chunks=chunks
        )
        
        logger.info(f"Saved {len(saved_chunks)} chunks to database")
        
        # Step 5: Mark note as indexed
        await supabase_client.mark_note_as_indexed(note_id)
        
        logger.info(f"Successfully indexed PDF {note_id}")
        
        return IndexPDFResponse(
            note_id=note_id,
            chunks_indexed=chunks_added,
            success=True
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
        logger.error(f"Unexpected error indexing PDF: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to index PDF: {str(e)}"
        )


@router.post("/chat-pdf", response_model=ChatPDFResponse)
async def chat_pdf(
    request: ChatPDFRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Chat with an indexed PDF
    
    This endpoint:
    1. Generates embedding for user question
    2. Searches FAISS index for top 5 most similar chunks
    3. Retrieves chunk content and page numbers from database
    4. Builds context string from retrieved chunks
    5. Calls LLM to generate answer with citations
    6. Returns answer with page references
    """
    note_id = request.note_id
    question = request.question
    history = request.history
    user_id = current_user["user_id"]
    
    logger.info(f"Chat request for note {note_id} from user {user_id}")
    
    try:
        # Step 1 & 2: Generate embedding and search FAISS index
        vector_db = get_vector_db()
        
        logger.info(f"Searching for similar chunks for question: {question[:100]}")
        search_results = vector_db.search(
            query=question,
            k=5,
            note_id=note_id
        )
        
        if not search_results:
            raise HTTPException(
                status_code=404,
                detail="No indexed content found for this PDF. Please index it first."
            )
        
        logger.info(f"Found {len(search_results)} relevant chunks")
        
        # Step 3: Retrieve chunk content and page numbers
        # search_results format: List[Tuple[chunk_id, distance, metadata]]
        relevant_chunks = []
        page_numbers = set()
        
        for chunk_id, distance, metadata in search_results:
            relevant_chunks.append({
                "content": metadata["content"],
                "page_number": metadata.get("page_number"),
                "distance": distance
            })
            if metadata.get("page_number"):
                page_numbers.add(metadata["page_number"])
        
        # Step 4: Build context string from retrieved chunks
        context = "\n\n---\n\n".join([
            f"[Page {chunk['page_number']}]\n{chunk['content']}" 
            if chunk['page_number'] else chunk['content']
            for chunk in relevant_chunks
        ])
        
        logger.info(f"Built context from {len(relevant_chunks)} chunks")
        
        # Step 5: Generate answer using LLM
        llm_provider = get_llm_provider()
        
        # Convert history to format expected by prompt template
        history_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in history
        ]
        
        # Get prompt template
        prompt_data = PromptTemplates.chat_with_context(
            context=context,
            question=question,
            history=history_messages
        )
        
        logger.info("Generating answer with LLM")
        answer = await llm_provider.generate_text(
            prompt=prompt_data["prompt"],
            system_message=prompt_data["system_message"],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Step 6: Return answer with page references
        pages_list = sorted(list(page_numbers))
        sources_list = [chunk["content"][:200] + "..." for chunk in relevant_chunks[:3]]
        
        logger.info(f"Successfully generated answer with {len(pages_list)} page references")
        
        return ChatPDFResponse(
            answer=answer,
            pages=pages_list,
            sources=sources_list
        )
        
    except HTTPException:
        raise
    except LLMError as e:
        logger.error(f"LLM error: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"AI service temporarily unavailable: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in chat: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process chat request: {str(e)}"
        )
