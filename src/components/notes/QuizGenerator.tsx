import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Edit2, Play } from "lucide-react";
import { generateQuiz, QuizType, QuizDifficulty, QuizQuestion } from "@/services/ai";
import { toast } from "sonner";

interface QuizGeneratorProps {
  noteId: string;
  noteTitle: string;
  onStartQuiz?: (quizId: string, questions: QuizQuestion[]) => void;
}

export function QuizGenerator({
  noteId,
  noteTitle,
  onStartQuiz,
}: QuizGeneratorProps) {
  const [quizType, setQuizType] = useState<QuizType>("mcq");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<{
    quizId: string;
    questions: QuizQuestion[];
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress(10);
    setGeneratedQuiz(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 800);

      const response = await generateQuiz({
        note_id: noteId,
        quiz_type: quizType,
        count: questionCount,
        difficulty,
      });

      clearInterval(progressInterval);
      setProgress(100);

      setGeneratedQuiz({
        quizId: response.quiz_id,
        questions: response.questions,
      });
      
      toast.success(`Generated ${response.questions.length} questions!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz");
      toast.error("Failed to generate quiz");
      console.error("Quiz generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartQuiz = () => {
    if (generatedQuiz && onStartQuiz) {
      onStartQuiz(generatedQuiz.quizId, generatedQuiz.questions);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          AI Quiz Generator
        </CardTitle>
        <CardDescription>
          Generate a custom quiz from "{noteTitle}"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!generatedQuiz && (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-type">Quiz Type</Label>
                <Select
                  value={quizType}
                  onValueChange={(value) => setQuizType(value as QuizType)}
                  disabled={isGenerating}
                >
                  <SelectTrigger id="quiz-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                    <SelectItem value="short">Short Answer</SelectItem>
                    <SelectItem value="long">Long Form / Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="question-count">Number of Questions</Label>
                  <span className="text-sm font-medium text-muted-foreground">
                    {questionCount}
                  </span>
                </div>
                <Slider
                  id="question-count"
                  min={5}
                  max={30}
                  step={1}
                  value={[questionCount]}
                  onValueChange={(value) => setQuestionCount(value[0])}
                  disabled={isGenerating}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5</span>
                  <span>30</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <RadioGroup
                  value={difficulty}
                  onValueChange={(value) => setDifficulty(value as QuizDifficulty)}
                  disabled={isGenerating}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="easy" id="easy" />
                    <Label htmlFor="easy" className="font-normal cursor-pointer">
                      Easy
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="font-normal cursor-pointer">
                      Medium
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hard" id="hard" />
                    <Label htmlFor="hard" className="font-normal cursor-pointer">
                      Hard
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              className="w-full bg-accent hover:bg-accent/90"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Quiz
                </>
              )}
            </Button>
          </>
        )}

        {isGenerating && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing PDF and generating questions...
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Error</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerate}
              className="text-destructive hover:text-destructive"
            >
              Retry
            </Button>
          </div>
        )}

        {generatedQuiz && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              Successfully generated {generatedQuiz.questions.length} questions
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
              {generatedQuiz.questions.map((question, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="text-xs">
                        Q{index + 1}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {quizType.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-sm font-medium">{question.question}</p>
                    
                    {question.options && (
                      <div className="space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`text-xs p-2 rounded ${
                              option === question.correct_answer
                                ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                                : "bg-muted/50"
                            }`}
                          >
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!question.options && (
                      <div className="text-xs p-2 rounded bg-muted/50">
                        <span className="font-medium">Model Answer: </span>
                        {question.correct_answer}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleStartQuiz}
                className="flex-1 bg-accent hover:bg-accent/90"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Quiz
              </Button>
              <Button
                onClick={handleGenerate}
                variant="outline"
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
