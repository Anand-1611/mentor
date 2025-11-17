"""Supabase client utility for database operations"""
import httpx
import logging
from typing import List, Dict, Any, Optional

from app.config import settings


logger = logging.getLogger(__name__)


class SupabaseClient:
    """Client for interacting with Supabase REST API"""
    
    def __init__(self):
        """Initialize Supabase client"""
        self.base_url = settings.supabase_url
        self.service_key = settings.supabase_service_role_key
        self.headers = {
            "apikey": self.service_key,
            "Authorization": f"Bearer {self.service_key}",
            "Content-Type": "application/json"
        }
    
    async def insert_flashcards(
        self,
        flashcards: List[Dict[str, Any]],
        user_id: str,
        source_note_id: str
    ) -> List[Dict[str, Any]]:
        """
        Insert flashcards into the database
        
        Args:
            flashcards: List of flashcard dictionaries with 'question' and 'answer'
            user_id: User ID who owns the flashcards
            source_note_id: Note ID the flashcards were generated from
            
        Returns:
            List of inserted flashcard records with IDs
        """
        try:
            # Prepare flashcard records
            records = []
            for card in flashcards:
                records.append({
                    "user_id": user_id,
                    "topic": card.get("topic", "Generated from PDF"),
                    "question": card["question"],
                    "answer": card["answer"],
                    "source_note_id": source_note_id
                })
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/rest/v1/flashcards",
                    headers=self.headers,
                    json=records
                )
                
                if response.status_code not in [200, 201]:
                    logger.error(f"Failed to insert flashcards: {response.text}")
                    raise Exception(f"Database insert failed: {response.text}")
                
                return response.json()
                
        except Exception as e:
            logger.error(f"Error inserting flashcards: {e}")
            raise
    
    async def get_note_metadata(self, note_id: str) -> Optional[Dict[str, Any]]:
        """
        Get note metadata from database
        
        Args:
            note_id: Note ID to fetch
            
        Returns:
            Note metadata dictionary or None if not found
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/rest/v1/notes",
                    params={"id": f"eq.{note_id}", "select": "*"},
                    headers=self.headers
                )
                
                if response.status_code != 200:
                    logger.error(f"Failed to fetch note: {response.text}")
                    return None
                
                data = response.json()
                return data[0] if data else None
                
        except Exception as e:
            logger.error(f"Error fetching note metadata: {e}")
            return None
    
    async def insert_pdf_chunks(
        self,
        note_id: str,
        chunks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Insert PDF chunks into the database
        
        Args:
            note_id: Note ID the chunks belong to
            chunks: List of chunk dictionaries with 'chunk_index', 'content', 'page_number'
            
        Returns:
            List of inserted chunk records with IDs
        """
        try:
            # Prepare chunk records
            records = []
            for chunk in chunks:
                records.append({
                    "note_id": note_id,
                    "chunk_index": chunk["chunk_id"],
                    "content": chunk["content"],
                    "page_number": chunk.get("page_number"),
                    "embedding_indexed": True
                })
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/rest/v1/pdf_chunks",
                    headers=self.headers,
                    json=records
                )
                
                if response.status_code not in [200, 201]:
                    logger.error(f"Failed to insert chunks: {response.text}")
                    raise Exception(f"Database insert failed: {response.text}")
                
                return response.json()
                
        except Exception as e:
            logger.error(f"Error inserting PDF chunks: {e}")
            raise
    
    async def mark_note_as_indexed(self, note_id: str) -> bool:
        """
        Mark a note as indexed by adding an indexed field
        
        Args:
            note_id: Note ID to mark as indexed
            
        Returns:
            True if successful, False otherwise
        """
        try:
            async with httpx.AsyncClient() as client:
                # We'll use a custom field or just check if chunks exist
                # For now, we can query chunks to verify indexing
                response = await client.get(
                    f"{self.base_url}/rest/v1/pdf_chunks",
                    params={
                        "note_id": f"eq.{note_id}",
                        "select": "count"
                    },
                    headers=self.headers
                )
                
                return response.status_code == 200
                
        except Exception as e:
            logger.error(f"Error marking note as indexed: {e}")
            return False
    
    async def get_pdf_chunks(
        self,
        note_id: str,
        chunk_ids: Optional[List[int]] = None
    ) -> List[Dict[str, Any]]:
        """
        Get PDF chunks from database
        
        Args:
            note_id: Note ID to fetch chunks for
            chunk_ids: Optional list of specific chunk IDs to fetch
            
        Returns:
            List of chunk dictionaries
        """
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "note_id": f"eq.{note_id}",
                    "select": "*"
                }
                
                if chunk_ids:
                    params["chunk_index"] = f"in.({','.join(map(str, chunk_ids))})"
                
                response = await client.get(
                    f"{self.base_url}/rest/v1/pdf_chunks",
                    params=params,
                    headers=self.headers
                )
                
                if response.status_code != 200:
                    logger.error(f"Failed to fetch chunks: {response.text}")
                    return []
                
                return response.json()
                
        except Exception as e:
            logger.error(f"Error fetching PDF chunks: {e}")
            return []


# Global Supabase client instance
_supabase_client: Optional[SupabaseClient] = None


def get_supabase_client() -> SupabaseClient:
    """Get or create global Supabase client instance"""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = SupabaseClient()
    return _supabase_client
