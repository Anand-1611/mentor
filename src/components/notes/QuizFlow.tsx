import { useState } from "react";
import { QuizGenerator } from "./QuizGenerator";
import { QuizTaking } from "./QuizTaking";
import { QuizResults } from "./QuizResults";
import { QuizQuestion, submitQuizAttempt } from "@/services/ai";
import { toast } from "sonner";

interface QuizFlowProps {
  noteId: string;
  noteTitle: string;
  subject?: string;
  onClose?: () => void;
}

type FlowState = "generate" | "taking" | "results";

export function QuizFlow({ noteId, noteTitle, subject, onClose }: QuizFlowProps) {
  const [flowState, setFlowState] = useState<FlowState>("generate");
  const [currentQuiz, setCurrentQuiz] = useState<{
    quizId: string;
    questions: QuizQuestion[];
  } | null>(null);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    answers: Record<number, string>;
  } | null>(null);

  const handleStartQuiz = (quizId: string, questions: QuizQuestion[]) => {
    setCurrentQuiz({ quizId, questions });
    setFlowState("taking");
  };

  const calculateScore = (
    questions: QuizQuestion[],
    answers: Record<number, string>
  ): number => {
    let score = 0;

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      
      // Only score MCQ questions automatically
      if (question.options && userAnswer === question.correct_answer) {
        score++;
      }
    });

    return score;
  };

  const handleQuizComplete = async (answers: Record<number, string>) => {
    if (!currentQuiz) return;

    try {
      // Calculate score for MCQ questions
      const score = calculateScore(currentQuiz.questions, answers);
      
      // Count only MCQ questions for scoring
      const mcqCount = currentQuiz.questions.filter(q => q.options).length;
      const totalQuestions = currentQuiz.questions.length;
      
      // Calculate percentage based on MCQ questions
      const percentage = mcqCount > 0 ? (score / mcqCount) * 100 : 0;

      // Save quiz attempt to database
      await submitQuizAttempt(
        currentQuiz.quizId,
        subject || "General",
        percentage,
        answers
      );

      setQuizResults({ score, answers });
      setFlowState("results");
      
      toast.success("Quiz completed!");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to save quiz results");
      
      // Still show results even if save fails
      const score = calculateScore(currentQuiz.questions, answers);
      setQuizResults({ score, answers });
      setFlowState("results");
    }
  };

  const handleRetry = () => {
    setFlowState("generate");
    setCurrentQuiz(null);
    setQuizResults(null);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      handleRetry();
    }
  };

  return (
    <div className="w-full">
      {flowState === "generate" && (
        <QuizGenerator
          noteId={noteId}
          noteTitle={noteTitle}
          onStartQuiz={handleStartQuiz}
        />
      )}

      {flowState === "taking" && currentQuiz && (
        <QuizTaking
          quizId={currentQuiz.quizId}
          questions={currentQuiz.questions}
          onComplete={handleQuizComplete}
          onCancel={handleRetry}
        />
      )}

      {flowState === "results" && currentQuiz && quizResults && (
        <QuizResults
          score={quizResults.score}
          totalQuestions={currentQuiz.questions.filter(q => q.options).length}
          questions={currentQuiz.questions}
          userAnswers={quizResults.answers}
          onRetry={handleRetry}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
