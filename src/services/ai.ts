/**
 * AI Services API client
 * Handles communication with the AI microservices backend
 */

import { supabase } from "@/integrations/supabase/client";

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:8000";

/**
 * Check if AI services are available
 */
export async function isAIServiceAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

export interface Flashcard {
  id?: string;
  question: string;
  answer: string;
  topic?: string;
}

export interface GenerateFlashcardsRequest {
  note_id: string;
  max_flashcards?: number;
}

export interface GenerateFlashcardsResponse {
  flashcards: Flashcard[];
  count: number;
  note_id: string;
}

/**
 * Get authentication token for AI service requests
 */
async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }
  
  return session.access_token;
}

/**
 * Generate flashcards from a PDF note
 */
export async function generateFlashcards(
  request: GenerateFlashcardsRequest
): Promise<GenerateFlashcardsResponse> {
  // Check if AI service is available
  const isAvailable = await isAIServiceAvailable();
  if (!isAvailable) {
    throw new Error("AI services are currently unavailable. Please ensure the AI service is running or contact support.");
  }
  
  const token = await getAuthToken();
  
  const response = await fetch(`${AI_SERVICE_URL}/ai/generate-flashcards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `Failed to generate flashcards: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch user's flashcards from database
 */
export async function getUserFlashcards(sourceNoteId?: string) {
  let query = supabase
    .from("flashcards")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (sourceNoteId) {
    query = query.eq("source_note_id", sourceNoteId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return data;
}

// PDF Chat Types
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface IndexPDFRequest {
  note_id: string;
}

export interface IndexPDFResponse {
  note_id: string;
  chunks_indexed: number;
  success: boolean;
}

export interface ChatPDFRequest {
  note_id: string;
  question: string;
  history: ChatMessage[];
}

export interface ChatPDFResponse {
  answer: string;
  pages: number[];
  sources: string[];
}

/**
 * Index a PDF for semantic search
 */
export async function indexPDF(
  request: IndexPDFRequest
): Promise<IndexPDFResponse> {
  // Check if AI service is available
  const isAvailable = await isAIServiceAvailable();
  if (!isAvailable) {
    throw new Error("AI services are currently unavailable. Please ensure the AI service is running or contact support.");
  }
  
  const token = await getAuthToken();
  
  const response = await fetch(`${AI_SERVICE_URL}/ai/index-pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `Failed to index PDF: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Chat with an indexed PDF
 */
export async function chatWithPDF(
  request: ChatPDFRequest
): Promise<ChatPDFResponse> {
  const token = await getAuthToken();
  
  const response = await fetch(`${AI_SERVICE_URL}/ai/chat-pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `Failed to chat with PDF: ${response.statusText}`);
  }
  
  return response.json();
}

// Quiz Types
export type QuizType = "mcq" | "short" | "long";
export type QuizDifficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  question: string;
  options?: string[];  // For MCQ
  correct_answer: string;
  explanation: string;
}

export interface GenerateQuizRequest {
  note_id: string;
  quiz_type: QuizType;
  count: number;
  difficulty: QuizDifficulty;
}

export interface GenerateQuizResponse {
  quiz_id: string;
  questions: QuizQuestion[];
}

export interface Quiz {
  id: string;
  creator_id: string;
  topic: string;
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  subject: string;
  score: number;
  answers: Record<number, string>;
  completed_at: string;
}

/**
 * Generate a quiz from a PDF note
 */
export async function generateQuiz(
  request: GenerateQuizRequest
): Promise<GenerateQuizResponse> {
  // Check if AI service is available
  const isAvailable = await isAIServiceAvailable();
  if (!isAvailable) {
    throw new Error("AI services are currently unavailable. Please ensure the AI service is running or contact support.");
  }
  
  const token = await getAuthToken();
  
  const response = await fetch(`${AI_SERVICE_URL}/ai/generate-quiz`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `Failed to generate quiz: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get a quiz by ID
 */
export async function getQuiz(quizId: string): Promise<Quiz> {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

/**
 * Get user's quizzes
 */
export async function getUserQuizzes() {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data;
}

/**
 * Submit a quiz attempt
 */
export async function submitQuizAttempt(
  quizId: string,
  subject: string,
  score: number,
  answers: Record<number, string>
) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Not authenticated");
  }
  
  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      quiz_id: quizId,
      subject,
      score,
      answers,
    })
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}
