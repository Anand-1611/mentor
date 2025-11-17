"""PDF text extraction service with OCR fallback"""
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import logging
from typing import List, Tuple, Optional
import httpx

from app.config import settings


logger = logging.getLogger(__name__)


class PDFExtractionError(Exception):
    """Custom exception for PDF extraction errors"""
    pass


async def download_pdf_from_storage(note_id: str) -> bytes:
    """
    Download PDF from Supabase storage
    
    Args:
        note_id: The note ID to download
        
    Returns:
        bytes: PDF file content
        
    Raises:
        PDFExtractionError: If download fails
    """
    try:
        async with httpx.AsyncClient() as client:
            # Get note metadata from Supabase
            response = await client.get(
                f"{settings.supabase_url}/rest/v1/notes",
                params={"id": f"eq.{note_id}", "select": "file_path"},
                headers={
                    "apikey": settings.supabase_service_role_key,
                    "Authorization": f"Bearer {settings.supabase_service_role_key}"
                }
            )
            
            if response.status_code != 200:
                raise PDFExtractionError(f"Failed to fetch note metadata: {response.text}")
            
            data = response.json()
            if not data:
                raise PDFExtractionError(f"Note {note_id} not found")
            
            file_path = data[0].get("file_path")
            if not file_path:
                raise PDFExtractionError(f"No file path found for note {note_id}")
            
            # Construct storage URL
            # file_path format: notes/{user_id}/{note_id}/original.pdf
            storage_url = f"{settings.supabase_url}/storage/v1/object/public/{file_path}"
            
            # Download the PDF file
            pdf_response = await client.get(storage_url)
            
            if pdf_response.status_code != 200:
                raise PDFExtractionError(f"Failed to download PDF: {pdf_response.text}")
            
            return pdf_response.content
            
    except httpx.HTTPError as e:
        logger.error(f"HTTP error downloading PDF: {e}")
        raise PDFExtractionError(f"Failed to download PDF: {str(e)}")
    except Exception as e:
        logger.error(f"Error downloading PDF: {e}")
        raise PDFExtractionError(f"Failed to download PDF: {str(e)}")


def extract_text_from_pdf_bytes(pdf_bytes: bytes, use_ocr: bool = False) -> List[Tuple[int, str]]:
    """
    Extract text from PDF bytes
    
    Args:
        pdf_bytes: PDF file content as bytes
        use_ocr: Whether to use OCR for scanned PDFs
        
    Returns:
        List of tuples (page_number, text_content)
        
    Raises:
        PDFExtractionError: If extraction fails
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        pages_text = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            
            # If text is empty or very short, try OCR
            if use_ocr and (not text or len(text.strip()) < 50):
                logger.info(f"Page {page_num + 1} has little text, attempting OCR")
                text = extract_text_with_ocr(page)
            
            pages_text.append((page_num + 1, text))
        
        doc.close()
        return pages_text
        
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise PDFExtractionError(f"Failed to extract text: {str(e)}")


def extract_text_with_ocr(page: fitz.Page) -> str:
    """
    Extract text from a PDF page using OCR
    
    Args:
        page: PyMuPDF page object
        
    Returns:
        str: Extracted text
    """
    try:
        # Render page to image
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better OCR
        img_bytes = pix.tobytes("png")
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(img_bytes))
        
        # Perform OCR
        text = pytesseract.image_to_string(image)
        
        return text
        
    except Exception as e:
        logger.warning(f"OCR failed: {e}")
        return ""


async def extract_text_from_pdf(note_id: str, use_ocr: bool = False) -> List[Tuple[int, str]]:
    """
    Download PDF from storage and extract text
    
    Args:
        note_id: The note ID to process
        use_ocr: Whether to use OCR for scanned PDFs
        
    Returns:
        List of tuples (page_number, text_content)
        
    Raises:
        PDFExtractionError: If extraction fails
    """
    pdf_bytes = await download_pdf_from_storage(note_id)
    return extract_text_from_pdf_bytes(pdf_bytes, use_ocr)


def chunk_text(
    pages_text: List[Tuple[int, str]],
    chunk_size: int = 500,
    overlap: int = 50
) -> List[dict]:
    """
    Chunk text into smaller segments with overlap
    
    Args:
        pages_text: List of tuples (page_number, text_content)
        chunk_size: Number of words per chunk
        overlap: Number of words to overlap between chunks
        
    Returns:
        List of dictionaries with chunk metadata
    """
    chunks = []
    chunk_id = 0
    
    for page_num, text in pages_text:
        # Split text into words
        words = text.split()
        
        # Create chunks with overlap
        for i in range(0, len(words), chunk_size - overlap):
            chunk_words = words[i:i + chunk_size]
            chunk_text = " ".join(chunk_words)
            
            if chunk_text.strip():  # Only add non-empty chunks
                chunks.append({
                    "chunk_id": chunk_id,
                    "page_number": page_num,
                    "content": chunk_text,
                    "word_count": len(chunk_words)
                })
                chunk_id += 1
    
    return chunks


async def extract_and_chunk_pdf(
    note_id: str,
    chunk_size: int = 500,
    overlap: int = 50,
    use_ocr: bool = False
) -> List[dict]:
    """
    Extract text from PDF and chunk it
    
    Args:
        note_id: The note ID to process
        chunk_size: Number of words per chunk
        overlap: Number of words to overlap between chunks
        use_ocr: Whether to use OCR for scanned PDFs
        
    Returns:
        List of chunk dictionaries
    """
    pages_text = await extract_text_from_pdf(note_id, use_ocr)
    return chunk_text(pages_text, chunk_size, overlap)
