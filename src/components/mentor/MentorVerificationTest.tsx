import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
}

interface MentorVerificationTestProps {
  subject: string;
  mentorId: string;
  onComplete: (score: number, passed: boolean) => void;
}

export const MentorVerificationTest = ({
  subject,
  mentorId,
  onComplete,
}: MentorVerificationTestProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [loading, setLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [subject]);

  useEffect(() => {
    if (testStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, timeRemaining]);

  const fetchQuestions = async () => {
    try {
      // Fetch 20 random questions for the selected subject
      // Distribution: 8 easy (40%), 8 medium (40%), 4 hard (20%)
      const { data: easyQuestions, error: easyError } = await supabase
        .from("test_questions")
        .select("*")
        .eq("subject", subject)
        .eq("difficulty", "easy")
        .limit(8);

      const { data: mediumQuestions, error: mediumError } = await supabase
        .from("test_questions")
        .select("*")
        .eq("subject", subject)
        .eq("difficulty", "medium")
        .limit(8);

      const { data: hardQuestions, error: hardError } = await supabase
        .from("test_questions")
        .select("*")
        .eq("subject", subject)
        .eq("difficulty", "hard")
        .limit(4);

      if (easyError || mediumError || hardError) {
        throw easyError || mediumError || hardError;
      }

      // Combine and shuffle questions
      const allQuestions = [
        ...(easyQuestions || []),
        ...(mediumQuestions || []),
        ...(hardQuestions || []),
      ];

      // Shuffle array
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      setQuestions(shuffled.slice(0, 20));
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load test questions");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers({
      ...answers,
      [questions[currentQuestionIndex].id]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Calculate score
      let correctCount = 0;
      questions.forEach((question) => {
        if (answers[question.id] === question.correct_answer) {
          correctCount++;
        }
      });

      const score = (correctCount / questions.length) * 100;
      const passed = score >= 70;

      // Update mentor record with test results
      const { error } = await supabase
        .from("mentors")
        .update({
          test_score: score,
          test_answers: answers,
          test_taken_at: new Date().toISOString(),
          status: passed ? "verified" : "pending",
          verified_at: passed ? new Date().toISOString() : null,
        })
        .eq("id", mentorId);

      if (error) throw error;

      // Send verification email
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", user?.id)
          .single();

        if (profile) {
          const template = passed ? "mentor-verification-success" : "mentor-verification-failure";
          const frontendUrl = window.location.origin;
          
          await supabase.functions.invoke("send-email", {
            body: {
              template: template,
              to: profile.email,
              variables: {
                mentorName: profile.full_name || "Mentor",
                subject: subject,
                score: score.toFixed(1),
                mentorEmail: profile.email,
                profileUrl: `${frontendUrl}/profile`,
                studyResourcesUrl: `${frontendUrl}/resources/${subject.toLowerCase()}`,
              },
            },
          });
        }
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        // Don't fail the test submission if email fails
      }

      onComplete(score, passed);
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("Failed to submit test. Please try again.");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading test questions...</p>
        </CardContent>
      </Card>
    );
  }

  if (!testStarted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Verification Test - {subject}</CardTitle>
          <CardDescription>
            You are about to start the mentor verification test
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-accent/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium">Test Instructions:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 20 multiple choice questions</li>
                  <li>• 30 minutes time limit</li>
                  <li>• Minimum 70% (14/20) required to pass</li>
                  <li>• You can navigate between questions</li>
                  <li>• Test will auto-submit when time expires</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Question Distribution:</p>
              <div className="space-y-1 text-sm">
                <p>• Easy: 8 questions (40%)</p>
                <p>• Medium: 8 questions (40%)</p>
                <p>• Hard: 4 questions (20%)</p>
              </div>
            </div>
          </div>

          <Button onClick={() => setTestStarted(true)} className="w-full" size="lg">
            Start Test
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isAnswered = !!answers[currentQuestion.id];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>
            Question {currentQuestionIndex + 1} of {questions.length}
          </CardTitle>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="w-5 h-5" />
            <span className={timeRemaining < 300 ? "text-destructive" : ""}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-sm font-medium text-muted-foreground mt-1">
              {currentQuestionIndex + 1}.
            </span>
            <p className="text-lg font-medium flex-1">{currentQuestion.question}</p>
          </div>

          <RadioGroup
            value={answers[currentQuestion.id] || ""}
            onValueChange={handleAnswerSelect}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/5 cursor-pointer"
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer font-normal"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {Object.keys(answers).length} of {questions.length} answered
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== questions.length}
            >
              Submit Test
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!isAnswered}>
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
