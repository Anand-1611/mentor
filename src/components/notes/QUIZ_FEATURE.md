# Quiz Generation and Taking Feature

## Overview

The quiz generation feature allows users to create custom quizzes from PDF notes using AI. It supports three types of questions:
- **Multiple Choice (MCQ)**: Questions with 4 options
- **Short Answer**: Questions requiring brief responses
- **Long Form/Essay**: Questions requiring detailed responses

## Components

### 1. QuizGenerator
Configuration interface for generating quizzes.

**Features:**
- Quiz type selection (MCQ, Short Answer, Long Form)
- Question count slider (5-30 questions)
- Difficulty level selection (Easy, Medium, Hard)
- Preview of generated questions
- Options to start quiz or regenerate

**Props:**
```typescript
interface QuizGeneratorProps {
  noteId: string;
  noteTitle: string;
  onStartQuiz?: (quizId: string, questions: QuizQuestion[]) => void;
}
```

### 2. QuizTaking
Interactive quiz interface for answering questions.

**Features:**
- One question at a time display
- Progress bar and question counter
- Optional timer with countdown
- Quick navigation between questions
- Answer tracking (MCQ with radio buttons, text with textarea)
- Visual indication of answered questions

**Props:**
```typescript
interface QuizTakingProps {
  quizId: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  onComplete: (answers: Record<number, string>) => void;
  onCancel?: () => void;
}
```

### 3. QuizResults
Results display with detailed feedback.

**Features:**
- Score display with percentage
- Pass/fail indication (60% threshold)
- Performance badges (Excellent, Great, Good, Pass, Needs Improvement)
- Detailed answer review with explanations
- Correct/incorrect answer highlighting
- Model answers for subjective questions
- Retry and close options

**Props:**
```typescript
interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  questions: QuizQuestion[];
  userAnswers: Record<number, string>;
  onRetry?: () => void;
  onClose?: () => void;
}
```

### 4. QuizFlow
Orchestrates the complete quiz workflow.

**Features:**
- State management for quiz flow (generate → taking → results)
- Automatic score calculation for MCQ questions
- Quiz attempt submission to database
- Error handling and recovery

**Props:**
```typescript
interface QuizFlowProps {
  noteId: string;
  noteTitle: string;
  subject?: string;
  onClose?: () => void;
}
```

## Backend API

### Endpoint: POST /ai/generate-quiz

Generates a quiz from a PDF note using AI.

**Request:**
```json
{
  "note_id": "uuid",
  "quiz_type": "mcq" | "short" | "long",
  "count": 10,
  "difficulty": "easy" | "medium" | "hard"
}
```

**Response:**
```json
{
  "quiz_id": "uuid",
  "questions": [
    {
      "question": "What is...",
      "options": ["A", "B", "C", "D"],  // Only for MCQ
      "correct_answer": "A",
      "explanation": "Because..."
    }
  ]
}
```

**Features:**
- PDF text extraction with page-based content selection
- Difficulty-based text section selection
- LLM-based question generation with structured JSON output
- Automatic quiz saving to database
- Error handling with detailed messages

## Database Schema

### quizzes table
```sql
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### quiz_attempts table
```sql
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  score NUMERIC NOT NULL,
  answers JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Integration

The quiz feature is integrated into the Notes page through the NotePreviewModal:

```typescript
<Tabs>
  <TabsTrigger value="quiz">
    <ClipboardList className="w-4 h-4 mr-2" />
    Quiz
  </TabsTrigger>
  
  <TabsContent value="quiz">
    <QuizFlow
      noteId={note.id}
      noteTitle={note.title}
      subject={note.subject}
    />
  </TabsContent>
</Tabs>
```

## Usage Flow

1. **Generation Phase**
   - User opens a note preview
   - Navigates to "Quiz" tab
   - Configures quiz parameters (type, count, difficulty)
   - Clicks "Generate Quiz"
   - AI analyzes PDF and generates questions
   - Preview shows generated questions

2. **Taking Phase**
   - User clicks "Start Quiz"
   - Questions displayed one at a time
   - User answers each question
   - Progress tracked with visual indicators
   - Optional timer counts down

3. **Results Phase**
   - Quiz submitted automatically or manually
   - Score calculated for MCQ questions
   - Results displayed with detailed feedback
   - User can review all answers with explanations
   - Options to retry or close

## Scoring Logic

- **MCQ Questions**: Automatically scored by comparing user answer to correct answer
- **Subjective Questions**: Stored for manual grading (not included in automatic score)
- **Pass Threshold**: 60% of MCQ questions correct
- **Performance Levels**:
  - 90%+: Excellent
  - 80-89%: Great
  - 70-79%: Good
  - 60-69%: Pass
  - <60%: Needs Improvement

## AI Prompt Templates

The system uses specialized prompts for each quiz type:

### MCQ Prompt
- Generates 4 options per question
- Includes correct answer and explanation
- Difficulty-based question complexity

### Short Answer Prompt
- Generates questions requiring 2-3 sentence answers
- Provides model answers
- Includes key points for grading

### Long Form Prompt
- Generates essay-style questions
- Provides detailed model answer outlines
- Includes grading rubrics

## Error Handling

- PDF extraction failures
- LLM generation errors with fallback
- JSON parsing errors
- Database save failures
- Network timeouts
- Invalid question formats

All errors are caught and displayed to users with actionable messages.

## Future Enhancements

- [ ] AI-powered grading for subjective questions
- [ ] Quiz sharing and collaboration
- [ ] Leaderboards and achievements
- [ ] Question difficulty adjustment based on performance
- [ ] Export quiz results as PDF
- [ ] Quiz templates and question banks
- [ ] Timed quiz modes with strict enforcement
- [ ] Multi-language support
