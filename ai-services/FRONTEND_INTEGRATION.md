# Frontend Integration Guide

This guide explains how to integrate the AI services with the React frontend.

## Environment Configuration

Add to your frontend `.env` file:
```env
VITE_AI_SERVICES_URL=http://localhost:8000
```

For production:
```env
VITE_AI_SERVICES_URL=https://your-ai-services.railway.app
```

## API Client Setup

Create an API client utility in your frontend:

```typescript
// src/services/aiService.ts
import { supabase } from '@/integrations/supabase/client';

const AI_SERVICES_URL = import.meta.env.VITE_AI_SERVICES_URL || 'http://localhost:8000';

async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  return session.access_token;
}

async function aiRequest<T>(
  endpoint: string,
  method: string = 'POST',
  body?: any
): Promise<T> {
  const token = await getAuthToken();
  
  const response = await fetch(`${AI_SERVICES_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'AI service request failed');
  }
  
  return response.json();
}

// Flashcard Generation
export async function generateFlashcards(noteId: string, maxFlashcards: number = 50) {
  return aiRequest<{
    flashcards: Array<{ question: string; answer: string }>;
    count: number;
  }>('/ai/generate-flashcards', 'POST', {
    note_id: noteId,
    max_flashcards: maxFlashcards,
  });
}

// Quiz Generation
export async function generateQuiz(
  noteId: string,
  quizType: 'mcq' | 'short' | 'long',
  count: number = 10,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
) {
  return aiRequest<{
    quiz_id: string;
    questions: Array<{
      question: string;
      options?: string[];
      correct_answer: string;
      explanation: string;
    }>;
  }>('/ai/generate-quiz', 'POST', {
    note_id: noteId,
    quiz_type: quizType,
    count,
    difficulty,
  });
}

// PDF Indexing
export async function indexPDF(noteId: string) {
  return aiRequest<{
    note_id: string;
    chunks_indexed: number;
    success: boolean;
  }>('/ai/index-pdf', 'POST', {
    note_id: noteId,
  });
}

// Chat with PDF
export async function chatWithPDF(
  noteId: string,
  question: string,
  history: Array<{ role: string; content: string }> = []
) {
  return aiRequest<{
    answer: string;
    pages: number[];
    sources: string[];
  }>('/ai/chat-pdf', 'POST', {
    note_id: noteId,
    question,
    history,
  });
}
```

## React Query Hooks

Create custom hooks for AI operations:

```typescript
// src/hooks/useAIServices.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { generateFlashcards, generateQuiz, indexPDF, chatWithPDF } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';

export function useGenerateFlashcards() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ noteId, maxFlashcards }: { noteId: string; maxFlashcards?: number }) =>
      generateFlashcards(noteId, maxFlashcards),
    onSuccess: (data) => {
      toast({
        title: 'Flashcards Generated',
        description: `Created ${data.count} flashcards`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useGenerateQuiz() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (params: {
      noteId: string;
      quizType: 'mcq' | 'short' | 'long';
      count?: number;
      difficulty?: 'easy' | 'medium' | 'hard';
    }) => generateQuiz(params.noteId, params.quizType, params.count, params.difficulty),
    onSuccess: (data) => {
      toast({
        title: 'Quiz Generated',
        description: `Created ${data.questions.length} questions`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useIndexPDF() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (noteId: string) => indexPDF(noteId),
    onSuccess: (data) => {
      toast({
        title: 'PDF Indexed',
        description: `Indexed ${data.chunks_indexed} chunks`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Indexing Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useChatWithPDF(noteId: string) {
  return useMutation({
    mutationFn: (params: {
      question: string;
      history?: Array<{ role: string; content: string }>;
    }) => chatWithPDF(noteId, params.question, params.history),
  });
}
```

## Usage Examples

### Flashcard Generation Component

```tsx
import { useGenerateFlashcards } from '@/hooks/useAIServices';
import { Button } from '@/components/ui/button';

export function FlashcardGenerator({ noteId }: { noteId: string }) {
  const generateMutation = useGenerateFlashcards();
  
  const handleGenerate = () => {
    generateMutation.mutate({ noteId });
  };
  
  return (
    <div>
      <Button
        onClick={handleGenerate}
        disabled={generateMutation.isPending}
      >
        {generateMutation.isPending ? 'Generating...' : 'Generate Flashcards'}
      </Button>
      
      {generateMutation.data && (
        <div className="mt-4">
          {generateMutation.data.flashcards.map((card, index) => (
            <div key={index} className="border p-4 rounded mb-2">
              <p className="font-bold">{card.question}</p>
              <p className="text-gray-600">{card.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Chat with PDF Component

```tsx
import { useState } from 'react';
import { useChatWithPDF } from '@/hooks/useAIServices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PDFChat({ noteId }: { noteId: string }) {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<Array<{ role: string; content: string }>>([]);
  const chatMutation = useChatWithPDF(noteId);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    const userMessage = { role: 'user', content: question };
    setHistory([...history, userMessage]);
    
    const result = await chatMutation.mutateAsync({ question, history });
    
    const assistantMessage = { role: 'assistant', content: result.answer };
    setHistory([...history, userMessage, assistantMessage]);
    setQuestion('');
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {history.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block p-3 rounded ${
                msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about this PDF..."
            disabled={chatMutation.isPending}
          />
          <Button type="submit" disabled={chatMutation.isPending}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
```

## Error Handling

The AI services return standard HTTP error codes:

- `401 Unauthorized`: Invalid or missing JWT token
- `429 Too Many Requests`: Rate limit exceeded (10 req/min)
- `500 Internal Server Error`: Service error
- `501 Not Implemented`: Feature not yet implemented

Handle these in your error boundaries or mutation callbacks.

## Rate Limiting

The AI services enforce a rate limit of 10 requests per minute per user. Show appropriate UI feedback when rate limits are hit:

```tsx
if (error.message.includes('Rate limit exceeded')) {
  toast({
    title: 'Too Many Requests',
    description: 'Please wait a moment before trying again',
    variant: 'destructive',
  });
}
```

## CORS Configuration

The AI services are configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative dev port)
- `https://*.vercel.app` (Vercel deployments)

Update `ai-services/app/config.py` if you need to add more origins.

## Testing

Test the AI services connection:

```typescript
// Test health endpoint
fetch('http://localhost:8000/health')
  .then(res => res.json())
  .then(data => console.log('AI Services:', data));
```

## Next Steps

1. Start the AI services: `cd ai-services && poetry run uvicorn app.main:app --reload`
2. Verify health: http://localhost:8000/health
3. Test authentication with a valid Supabase JWT token
4. Implement the UI components for flashcards, quiz, and chat features
