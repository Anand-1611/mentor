import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertCircle, Trophy, RotateCcw, Home } from "lucide-react";
import { QuizQuestion } from "@/services/ai";

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  questions: QuizQuestion[];
  userAnswers: Record<number, string>;
  onRetry?: () => void;
  onClose?: () => void;
}

export function QuizResults({
  score,
  totalQuestions,
  questions,
  userAnswers,
  onRetry,
  onClose,
}: QuizResultsProps) {
  const percentage = (score / totalQuestions) * 100;
  const passed = percentage >= 60;

  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadge = () => {
    if (percentage >= 90) return { label: "Excellent!", variant: "default" as const };
    if (percentage >= 80) return { label: "Great!", variant: "default" as const };
    if (percentage >= 70) return { label: "Good", variant: "secondary" as const };
    if (percentage >= 60) return { label: "Pass", variant: "secondary" as const };
    return { label: "Needs Improvement", variant: "destructive" as const };
  };

  const scoreBadge = getScoreBadge();

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {passed ? (
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-950 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-3xl">
            <span className={getScoreColor()}>
              {score} / {totalQuestions}
            </span>
          </CardTitle>
          
          <CardDescription className="text-lg">
            <Badge variant={scoreBadge.variant} className="text-sm">
              {scoreBadge.label}
            </Badge>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Score</span>
              <span className={`font-medium ${getScoreColor()}`}>
                {percentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {score}
              </div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {totalQuestions - score}
              </div>
              <div className="text-xs text-muted-foreground">Incorrect</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {totalQuestions}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>

          <div className="flex gap-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            {onClose && (
              <Button
                onClick={onClose}
                className="flex-1 bg-accent hover:bg-accent/90"
              >
                <Home className="w-4 h-4 mr-2" />
                Done
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Review Answers</CardTitle>
          <CardDescription>
            See correct answers and explanations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = question.options
              ? userAnswer === question.correct_answer
              : false; // Subjective questions need manual grading
            const isSubjective = !question.options;

            return (
              <Card key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="text-xs">
                      Q{index + 1}
                    </Badge>
                    {!isSubjective && (
                      <Badge
                        variant={isCorrect ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Incorrect
                          </>
                        )}
                      </Badge>
                    )}
                    {isSubjective && (
                      <Badge variant="secondary" className="text-xs">
                        Manual Grading Required
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm font-medium">{question.question}</p>

                  {question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => {
                        const isUserAnswer = option === userAnswer;
                        const isCorrectAnswer = option === question.correct_answer;

                        return (
                          <div
                            key={optIndex}
                            className={`text-xs p-2 rounded border ${
                              isCorrectAnswer
                                ? "bg-green-50 dark:bg-green-950/20 border-green-500 text-green-700 dark:text-green-400"
                                : isUserAnswer
                                ? "bg-red-50 dark:bg-red-950/20 border-red-500 text-red-700 dark:text-red-400"
                                : "bg-muted/50 border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <span className="flex-1">{option}</span>
                              {isCorrectAnswer && (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <XCircle className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isSubjective && userAnswer && (
                    <div className="space-y-2">
                      <div className="text-xs p-2 rounded bg-muted/50 border">
                        <span className="font-medium">Your Answer: </span>
                        {userAnswer}
                      </div>
                      <div className="text-xs p-2 rounded bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                        <span className="font-medium">Model Answer: </span>
                        {question.correct_answer}
                      </div>
                    </div>
                  )}

                  {question.explanation && (
                    <div className="text-xs p-3 rounded bg-accent/10 border border-accent/20">
                      <span className="font-medium text-accent">Explanation: </span>
                      <span className="text-muted-foreground">
                        {question.explanation}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
