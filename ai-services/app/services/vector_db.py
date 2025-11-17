"""Vector database service using FAISS for semantic search"""
import faiss
import numpy as np
import pickle
import os
from pathlib import Path
from typing import List, Tuple, Optional
import logging
from sentence_transformers import SentenceTransformer

from app.config import settings


logger = logging.getLogger(__name__)


class VectorDatabase:
    """FAISS-based vector database for semantic search"""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", dimension: int = 384):
        """
        Initialize vector database
        
        Args:
            model_name: Sentence transformer model name
            dimension: Embedding dimension (384 for all-MiniLM-L6-v2)
        """
        self.model_name = model_name
        self.dimension = dimension
        self.model = None
        self.index = None
        self.metadata = {}  # Store chunk metadata by ID
        
        # Ensure data directory exists
        self.data_dir = Path(settings.faiss_index_path)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        self.index_file = self.data_dir / "faiss.index"
        self.metadata_file = self.data_dir / "metadata.pkl"
        
        # Initialize model and index
        self._initialize()
    
    def _initialize(self):
        """Initialize the sentence transformer model and FAISS index"""
        try:
            # Load sentence transformer model
            logger.info(f"Loading sentence transformer model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            
            # Try to load existing index
            if self.index_file.exists() and self.metadata_file.exists():
                logger.info("Loading existing FAISS index")
                self.load_index()
            else:
                logger.info("Creating new FAISS index")
                self.index = faiss.IndexFlatL2(self.dimension)
                
        except Exception as e:
            logger.error(f"Error initializing vector database: {e}")
            raise
    
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for a list of texts
        
        Args:
            texts: List of text strings
            
        Returns:
            numpy array of embeddings
        """
        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return embeddings.astype('float32')
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise
    
    def add_documents(
        self,
        note_id: str,
        chunks: List[dict]
    ) -> int:
        """
        Add document chunks to the vector database
        
        Args:
            note_id: Note ID
            chunks: List of chunk dictionaries with 'content', 'page_number', etc.
            
        Returns:
            Number of chunks added
        """
        try:
            if not chunks:
                logger.warning(f"No chunks to add for note {note_id}")
                return 0
            
            # Extract text content
            texts = [chunk['content'] for chunk in chunks]
            
            # Generate embeddings
            logger.info(f"Generating embeddings for {len(texts)} chunks")
            embeddings = self.generate_embeddings(texts)
            
            # Get current index size to generate IDs
            start_id = self.index.ntotal
            
            # Add to FAISS index
            self.index.add(embeddings)
            
            # Store metadata
            for i, chunk in enumerate(chunks):
                chunk_id = start_id + i
                self.metadata[chunk_id] = {
                    "note_id": note_id,
                    "chunk_index": chunk.get('chunk_id', i),
                    "page_number": chunk.get('page_number'),
                    "content": chunk['content'],
                    "word_count": chunk.get('word_count', len(chunk['content'].split()))
                }
            
            # Persist to disk
            self.save_index()
            
            logger.info(f"Added {len(chunks)} chunks for note {note_id}")
            return len(chunks)
            
        except Exception as e:
            logger.error(f"Error adding documents: {e}")
            raise
    
    def search(
        self,
        query: str,
        k: int = 5,
        note_id: Optional[str] = None
    ) -> List[Tuple[int, float, dict]]:
        """
        Search for similar chunks
        
        Args:
            query: Search query text
            k: Number of results to return
            note_id: Optional note ID to filter results
            
        Returns:
            List of tuples (chunk_id, distance, metadata)
        """
        try:
            if self.index.ntotal == 0:
                logger.warning("Index is empty")
                return []
            
            # Generate query embedding
            query_embedding = self.generate_embeddings([query])
            
            # Search in FAISS
            # Get more results if filtering by note_id
            search_k = k * 10 if note_id else k
            distances, indices = self.index.search(query_embedding, search_k)
            
            # Prepare results
            results = []
            for i, (idx, dist) in enumerate(zip(indices[0], distances[0])):
                if idx == -1:  # FAISS returns -1 for empty slots
                    continue
                
                metadata = self.metadata.get(idx)
                if metadata is None:
                    continue
                
                # Filter by note_id if specified
                if note_id and metadata.get('note_id') != note_id:
                    continue
                
                results.append((int(idx), float(dist), metadata))
                
                if len(results) >= k:
                    break
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching: {e}")
            raise
    
    def delete_note_chunks(self, note_id: str) -> int:
        """
        Delete all chunks for a specific note
        
        Note: FAISS doesn't support deletion, so we need to rebuild the index
        
        Args:
            note_id: Note ID to delete
            
        Returns:
            Number of chunks deleted
        """
        try:
            # Find all chunk IDs for this note
            chunks_to_delete = [
                chunk_id for chunk_id, meta in self.metadata.items()
                if meta.get('note_id') == note_id
            ]
            
            if not chunks_to_delete:
                return 0
            
            # Remove from metadata
            for chunk_id in chunks_to_delete:
                del self.metadata[chunk_id]
            
            # Rebuild index without deleted chunks
            if self.metadata:
                # Get all remaining embeddings
                remaining_texts = [meta['content'] for meta in self.metadata.values()]
                embeddings = self.generate_embeddings(remaining_texts)
                
                # Create new index
                self.index = faiss.IndexFlatL2(self.dimension)
                self.index.add(embeddings)
                
                # Update metadata with new IDs
                new_metadata = {}
                for i, (old_id, meta) in enumerate(self.metadata.items()):
                    new_metadata[i] = meta
                self.metadata = new_metadata
            else:
                # No chunks left, create empty index
                self.index = faiss.IndexFlatL2(self.dimension)
            
            # Persist changes
            self.save_index()
            
            logger.info(f"Deleted {len(chunks_to_delete)} chunks for note {note_id}")
            return len(chunks_to_delete)
            
        except Exception as e:
            logger.error(f"Error deleting note chunks: {e}")
            raise
    
    def save_index(self):
        """Save FAISS index and metadata to disk"""
        try:
            # Save FAISS index
            faiss.write_index(self.index, str(self.index_file))
            
            # Save metadata
            with open(self.metadata_file, 'wb') as f:
                pickle.dump(self.metadata, f)
            
            logger.info("Index saved to disk")
            
        except Exception as e:
            logger.error(f"Error saving index: {e}")
            raise
    
    def load_index(self):
        """Load FAISS index and metadata from disk"""
        try:
            # Load FAISS index
            self.index = faiss.read_index(str(self.index_file))
            
            # Load metadata
            with open(self.metadata_file, 'rb') as f:
                self.metadata = pickle.load(f)
            
            logger.info(f"Loaded index with {self.index.ntotal} vectors")
            
        except Exception as e:
            logger.error(f"Error loading index: {e}")
            raise
    
    def get_stats(self) -> dict:
        """Get database statistics"""
        return {
            "total_chunks": self.index.ntotal if self.index else 0,
            "dimension": self.dimension,
            "model": self.model_name,
            "unique_notes": len(set(
                meta.get('note_id') for meta in self.metadata.values()
            ))
        }


# Global vector database instance
_vector_db: Optional[VectorDatabase] = None


def get_vector_db() -> VectorDatabase:
    """Get or create global vector database instance"""
    global _vector_db
    if _vector_db is None:
        _vector_db = VectorDatabase()
    return _vector_db
