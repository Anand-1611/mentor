# Quiz Feature - Quick Start Guide

## For Developers

### Using the Quiz Components

#### Basic Usage
```typescript
import { QuizFlow } from "@/components/notes";

<QuizFlow
  noteId="uuid-of-note"
  noteTitle="Introduction to React"
  subject="Computer Science"
  onClose={() => console.log("Quiz closed")}
/>
```

#### Individual Components

**1. Quiz Generator Only**
```typescript
import { QuizGenerator } from "@/components/notes";

<QuizGenerator
  noteId="uuid"
  noteTitle="Note Title"
  onStartQuiz={(quizId, questions) => {
    // Handle quiz start
  }}
/>
```

**2. Quiz Taking Only**
```typescript
import { QuizTaking } from "@/components/notes";

<QuizTaking
  quizId="uuid"
  questions={questions}
  timeLimit={30} // 30 minutes
  onComplete={(answers) => {
    // Handle completion
  }}
  onCancel={() => {
    // Handle cancel
  }}
/>
```

**3. Quiz Results Only**
```typescript
import { QuizResults } from "@/components/notes";

<QuizResults
  score={8}
  totalQuestions={10}
  questions={questions}
  userAnswers={answers}
  onRetry={() => {
    // Handle retry
  }}
  onClose={() => {
    // Handle close
  }}
/>
```

### API Usage

#### Generate Quiz
```typescript
import { generateQuiz } from "@/services/ai";

const response = await generateQuiz({
  note_id: "uuid",
  quiz_type: "mcq", // or "short" or "long"
  count: 10,
  difficulty: "medium" // or "easy" or "hard"
});

console.log(response.quiz_id);
console.log(response.questions);
```

#### Submit Quiz Attempt
```typescript
import { submitQuizAttempt } from "@/services/ai";

const attempt = await submitQuizAttempt(
  quizId,
  "Mathematics",
  85.5, // score percentage
  { 0: "Answer 1", 1: "Answer 2" } // answers by question index
);
```

#### Get User's Quizzes
```typescript
import { getUserQuizzes } from "@/services/ai";

const quizzes = await getUserQuizzes();
```

### Question Types

#### MCQ Question
```typescript
{
  question: "What is React?",
  options: [
    "A JavaScript library",
    "A programming language",
    "A database",
    "An operating system"
  ],
  correct_answer: "A JavaScript library",
  explanation: "React is a JavaScript library for building user interfaces."
}
```

#### Short Answer Question
```typescript
{
  question: "Explain the concept of state in React.",
  correct_answer: "State is a built-in object that stores component data that may change over time.",
  explanation: "Key points: mutable, triggers re-render, component-specific"
}
```

#### Long Form Question
```typescript
{
  question: "Discuss the advantages and disadvantages of using React for web development.",
  correct_answer: "Advantages: Component reusability, virtual DOM, large ecosystem...",
  explanation: "Grading rubric: Should cover at least 3 advantages and 2 disadvantages with examples."
}
```

### Styling Customization

All components use Tailwind CSS and shadcn/ui. Customize by:

1. **Modifying component classes**:
```typescript
<Card className="custom-class">
```

2. **Using CSS variables** (in your global CSS):
```css
:root {
  --accent: 210 100% 50%;
}
```

3. **Overriding shadcn components**:
Edit files in `src/components/ui/`

### Error Handling

```typescript
try {
  const response = await generateQuiz(request);
} catch (error) {
  if (error.message.includes("No text could be extracted")) {
    // Handle PDF extraction error
  } else if (error.message.includes("Failed to generate quiz")) {
    // Handle generation error
  } else {
    // Handle other errors
  }
}
```

### State Management

The QuizFlow component manages state internally:
- `generate`: Initial state, shows QuizGenerator
- `taking`: Shows QuizTaking component
- `results`: Shows QuizResults component

To access state externally, use individual components instead of QuizFlow.

### Performance Tips

1. **Lazy load quiz components**:
```typescript
const QuizFlow = lazy(() => import("@/components/notes/QuizFlow"));
```

2. **Memoize expensive calculations**:
```typescript
const score = useMemo(() => 
  calculateScore(questions, answers),
  [questions, answers]
);
```

3. **Debounce API calls**:
```typescript
const debouncedGenerate = useMemo(
  () => debounce(generateQuiz, 1000),
  []
);
```

### Testing

#### Component Testing
```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { QuizGenerator } from "@/components/notes";

test("generates quiz on button click", async () => {
  const onStartQuiz = jest.fn();
  
  render(
    <QuizGenerator
      noteId="test-id"
      noteTitle="Test Note"
      onStartQuiz={onStartQuiz}
    />
  );
  
  fireEvent.click(screen.getByText("Generate Quiz"));
  
  await waitFor(() => {
    expect(onStartQuiz).toHaveBeenCalled();
  });
});
```

#### API Testing
```typescript
import { generateQuiz } from "@/services/ai";

jest.mock("@/services/ai");

test("generates quiz successfully", async () => {
  (generateQuiz as jest.Mock).mockResolvedValue({
    quiz_id: "test-id",
    questions: [/* ... */]
  });
  
  const result = await generateQuiz({
    note_id: "test",
    quiz_type: "mcq",
    count: 5,
    difficulty: "easy"
  });
  
  expect(result.quiz_id).toBe("test-id");
});
```

### Common Issues

#### Issue: Quiz generation fails
**Solution**: Check AI service is running and API keys are configured

#### Issue: Timer not working
**Solution**: Ensure timeLimit prop is passed in minutes (not seconds)

#### Issue: Answers not saving
**Solution**: Check user is authenticated and database migration is applied

#### Issue: PDF text extraction fails
**Solution**: Verify PDF is not corrupted and file_path is correct in database

### Environment Setup

1. **Frontend** (.env):
```env
VITE_AI_SERVICE_URL=http://localhost:8000
```

2. **Backend** (ai-services/.env):
```env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

3. **Database**:
```bash
supabase db push
```

### Debugging

Enable debug logging:
```typescript
// In QuizFlow.tsx
console.log("Current state:", flowState);
console.log("Quiz data:", currentQuiz);
console.log("Results:", quizResults);
```

Check AI service logs:
```bash
cd ai-services
uvicorn app.main:app --reload --log-level debug
```

### Best Practices

1. Always validate user input before API calls
2. Show loading states during async operations
3. Handle errors gracefully with user-friendly messages
4. Provide feedback for all user actions
5. Use TypeScript types for type safety
6. Test edge cases (empty PDFs, network failures, etc.)
7. Implement proper cleanup in useEffect hooks
8. Use semantic HTML for accessibility

### Resources

- [Full Documentation](./QUIZ_FEATURE.md)
- [Task Completion Summary](../../../docs/TASK_9_QUIZ_GENERATION_COMPLETION.md)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [React PDF Documentation](https://react-pdf.org/)
