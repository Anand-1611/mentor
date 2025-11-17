"""LLM provider service with OpenAI and Anthropic fallback"""
import logging
from typing import List, Dict, Optional, Any
from tenacity import retry, stop_after_attempt, wait_exponential
import openai
from anthropic import Anthropic
import json

from app.config import settings


logger = logging.getLogger(__name__)


class LLMError(Exception):
    """Custom exception for LLM errors"""
    pass


class LLMProvider:
    """LLM provider with OpenAI primary and Anthropic fallback"""
    
    def __init__(self):
        """Initialize LLM clients"""
        self.openai_client = openai.OpenAI(api_key=settings.openai_api_key)
        self.anthropic_client = None
        
        if settings.anthropic_api_key:
            self.anthropic_client = Anthropic(api_key=settings.anthropic_api_key)
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def generate_with_openai(
        self,
        prompt: str,
        system_message: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        response_format: Optional[str] = None
    ) -> str:
        """
        Generate text using OpenAI
        
        Args:
            prompt: User prompt
            system_message: Optional system message
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            response_format: Optional response format ('json_object' for JSON)
            
        Returns:
            Generated text
        """
        try:
            messages = []
            
            if system_message:
                messages.append({"role": "system", "content": system_message})
            
            messages.append({"role": "user", "content": prompt})
            
            kwargs = {
                "model": "gpt-4-turbo-preview",
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            
            if response_format == "json_object":
                kwargs["response_format"] = {"type": "json_object"}
            
            response = self.openai_client.chat.completions.create(**kwargs)
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI generation error: {e}")
            raise LLMError(f"OpenAI error: {str(e)}")
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def generate_with_anthropic(
        self,
        prompt: str,
        system_message: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """
        Generate text using Anthropic Claude
        
        Args:
            prompt: User prompt
            system_message: Optional system message
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated text
        """
        try:
            if not self.anthropic_client:
                raise LLMError("Anthropic client not configured")
            
            kwargs = {
                "model": "claude-3-sonnet-20240229",
                "max_tokens": max_tokens,
                "temperature": temperature,
                "messages": [{"role": "user", "content": prompt}]
            }
            
            if system_message:
                kwargs["system"] = system_message
            
            response = self.anthropic_client.messages.create(**kwargs)
            
            return response.content[0].text
            
        except Exception as e:
            logger.error(f"Anthropic generation error: {e}")
            raise LLMError(f"Anthropic error: {str(e)}")
    
    async def generate_text(
        self,
        prompt: str,
        system_message: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        response_format: Optional[str] = None,
        use_fallback: bool = True
    ) -> str:
        """
        Generate text with automatic fallback
        
        Args:
            prompt: User prompt
            system_message: Optional system message
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            response_format: Optional response format ('json_object' for JSON)
            use_fallback: Whether to use Anthropic as fallback
            
        Returns:
            Generated text
        """
        try:
            # Try OpenAI first
            return await self.generate_with_openai(
                prompt=prompt,
                system_message=system_message,
                temperature=temperature,
                max_tokens=max_tokens,
                response_format=response_format
            )
            
        except LLMError as e:
            logger.warning(f"OpenAI failed: {e}")
            
            if use_fallback and self.anthropic_client:
                logger.info("Falling back to Anthropic")
                return await self.generate_with_anthropic(
                    prompt=prompt,
                    system_message=system_message,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
            else:
                raise


# Prompt templates for different use cases
class PromptTemplates:
    """Predefined prompt templates"""
    
    @staticmethod
    def flashcard_generation(text_chunk: str) -> Dict[str, str]:
        """Generate flashcard prompt"""
        system_message = """You are an expert educational content creator. 
Your task is to extract key concepts from academic text and create clear, 
concise flashcards in question-answer format."""
        
        prompt = f"""Extract 3-5 key concepts from the following text and create flashcards.
Each flashcard should have a clear question and a concise answer.

Text:
{text_chunk}

Return your response as a JSON array with this format:
[
  {{"question": "What is...", "answer": "..."}},
  {{"question": "Define...", "answer": "..."}}
]

Focus on the most important concepts, definitions, and relationships."""
        
        return {"system_message": system_message, "prompt": prompt}
    
    @staticmethod
    def quiz_generation_mcq(text: str, count: int, difficulty: str) -> Dict[str, str]:
        """Generate MCQ quiz prompt"""
        system_message = """You are an expert quiz creator for academic content.
Create multiple choice questions that test understanding, not just memorization."""
        
        prompt = f"""Create {count} multiple choice questions at {difficulty} difficulty level from this text:

{text[:3000]}

Return your response as a JSON array with this format:
[
  {{
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A",
    "explanation": "Why this is correct..."
  }}
]

Difficulty guidelines:
- easy: Direct recall and basic understanding
- medium: Application and analysis
- hard: Synthesis and evaluation"""
        
        return {"system_message": system_message, "prompt": prompt}
    
    @staticmethod
    def quiz_generation_short(text: str, count: int, difficulty: str) -> Dict[str, str]:
        """Generate short answer quiz prompt"""
        system_message = """You are an expert quiz creator for academic content.
Create short answer questions that require brief, specific responses."""
        
        prompt = f"""Create {count} short answer questions at {difficulty} difficulty level from this text:

{text[:3000]}

Return your response as a JSON array with this format:
[
  {{
    "question": "Question text?",
    "correct_answer": "Model answer (2-3 sentences)",
    "explanation": "Key points to include in answer"
  }}
]"""
        
        return {"system_message": system_message, "prompt": prompt}
    
    @staticmethod
    def quiz_generation_long(text: str, count: int, difficulty: str) -> Dict[str, str]:
        """Generate long form quiz prompt"""
        system_message = """You are an expert quiz creator for academic content.
Create essay-style questions that require detailed, structured responses."""
        
        prompt = f"""Create {count} essay questions at {difficulty} difficulty level from this text:

{text[:3000]}

Return your response as a JSON array with this format:
[
  {{
    "question": "Essay prompt...",
    "correct_answer": "Model answer outline with key points",
    "explanation": "Grading rubric: what should be included for full marks"
  }}
]"""
        
        return {"system_message": system_message, "prompt": prompt}
    
    @staticmethod
    def chat_with_context(context: str, question: str, history: List[Dict[str, str]]) -> Dict[str, str]:
        """Generate chat response with context"""
        system_message = """You are a helpful AI tutor. Answer questions based on the provided context.
Always cite page numbers when referencing specific information.
If the context doesn't contain enough information, say so clearly."""
        
        # Format conversation history
        history_text = ""
        if history:
            history_text = "\n\nPrevious conversation:\n"
            for msg in history[-5:]:  # Last 5 messages
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                history_text += f"{role.capitalize()}: {content}\n"
        
        prompt = f"""Context from the document:
{context}
{history_text}

Current question: {question}

Provide a detailed answer based on the context. Include page references where applicable."""
        
        return {"system_message": system_message, "prompt": prompt}


# Global LLM provider instance
_llm_provider: Optional[LLMProvider] = None


def get_llm_provider() -> LLMProvider:
    """Get or create global LLM provider instance"""
    global _llm_provider
    if _llm_provider is None:
        _llm_provider = LLMProvider()
    return _llm_provider
