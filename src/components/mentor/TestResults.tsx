import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Award, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TestResultsProps {
  score: number;
  passed: boolean;
  totalQuestions: number;
}

export const TestResults = ({ score, passed, totalQuestions }: TestResultsProps) => {
  const navigate = useNavigate();
  const correctAnswers = Math.round((score / 100) * totalQuestions);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {passed ? (
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          )}
        </div>
        <CardTitle className="text-3xl">
          {passed ? "Congratulations!" : "Test Not Passed"}
        </CardTitle>
        <CardDescription className="text-lg">
          {passed
            ? "You have successfully passed the verification test"
            : "You need at least 70% to become a verified mentor"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-accent/5">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-accent mb-2">{score.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Your Score</p>
            </CardContent>
          </Card>

          <Card className="bg-accent/5">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-accent mb-2">
                {correctAnswers}/{totalQuestions}
              </div>
              <p className="text-sm text-muted-foreground">Correct Answers</p>
            </CardContent>
          </Card>
        </div>

        {passed ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Award className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Verified Mentor Status</p>
                <p className="text-sm text-green-700 mt-1">
                  You are now a verified mentor! Your profile will display a verification badge,
                  and you can start accepting booking requests from students.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Next Steps:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Set your availability schedule</li>
                <li>• Complete your mentor profile</li>
                <li>• Start accepting student bookings</li>
              </ul>
            </div>

            <Button onClick={() => navigate("/mentors")} className="w-full" size="lg">
              View Mentor Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Keep Trying!</p>
                <p className="text-sm text-amber-700 mt-1">
                  You scored {score.toFixed(1)}%, but need at least 70% to pass. Review the
                  subject material and try again when you're ready.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Recommendations:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Review the subject material thoroughly</li>
                <li>• Focus on areas where you struggled</li>
                <li>• Practice with sample questions</li>
                <li>• Retake the test when you feel prepared</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => navigate("/mentors")} variant="outline" className="flex-1">
                Back to Mentors
              </Button>
              <Button onClick={() => window.location.reload()} className="flex-1">
                Retake Test
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
