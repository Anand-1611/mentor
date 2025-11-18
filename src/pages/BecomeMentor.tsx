import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MentorApplicationForm } from "@/components/mentor/MentorApplicationForm";
import { MentorVerificationTest } from "@/components/mentor/MentorVerificationTest";
import { TestResults } from "@/components/mentor/TestResults";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, GraduationCap, FileCheck, Award } from "lucide-react";
import { toast } from "sonner";

const BecomeMentor = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<"info" | "application" | "test" | "results">("info");
  const [mentorData, setMentorData] = useState<any>(null);
  const [testScore, setTestScore] = useState<number>(0);
  const [testPassed, setTestPassed] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkMentorStatus();
  }, []);

  const checkMentorStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: mentor } = await supabase
        .from("mentors")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (mentor) {
        setMentorData(mentor);
        if (mentor.status === "verified") {
          navigate("/mentors");
          return;
        }
        if (mentor.status === "pending" && !mentor.test_score) {
          setCurrentStep("test");
        }
      }
    } catch (error) {
      console.error("Error checking mentor status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSuccess = async () => {
    // Fetch the newly created mentor data
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: mentor } = await supabase
          .from("mentors")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (mentor) {
          setMentorData(mentor);
          setCurrentStep("test");
        }
      }
    } catch (error) {
      console.error("Error fetching mentor data:", error);
      toast.error("Failed to load test. Please refresh the page.");
    }
  };

  const handleTestComplete = (score: number, passed: boolean) => {
    setTestScore(score);
    setTestPassed(passed);
    setCurrentStep("results");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {currentStep === "info" && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">Become a Verified Mentor</h1>
              <p className="text-xl text-muted-foreground">
                Share your knowledge and earn while helping fellow students succeed
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <FileCheck className="w-12 h-12 mb-4 text-accent" />
                  <CardTitle>Step 1: Apply</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Submit your application with subject expertise, hourly rate, and grade
                    transcript
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <GraduationCap className="w-12 h-12 mb-4 text-accent" />
                  <CardTitle>Step 2: Test</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Take a 20-question subject test. Score 70% or higher to get verified
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Award className="w-12 h-12 mb-4 text-accent" />
                  <CardTitle>Step 3: Mentor</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Once verified, start accepting bookings and help students achieve their goals
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-accent/5 border-accent">
              <CardHeader>
                <CardTitle>Benefits of Being a Mentor</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
                    <span>Set your own hourly rate (₹100 - ₹5000)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
                    <span>Flexible schedule - choose your availability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
                    <span>Build your reputation with verified badge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
                    <span>Help students while earning money</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button size="lg" onClick={() => setCurrentStep("application")}>
                Start Application
              </Button>
            </div>
          </div>
        )}

        {currentStep === "application" && (
          <MentorApplicationForm onSuccess={handleApplicationSuccess} />
        )}

        {currentStep === "test" && mentorData && (
          <MentorVerificationTest
            subject={mentorData.subject}
            mentorId={mentorData.id}
            onComplete={handleTestComplete}
          />
        )}

        {currentStep === "results" && (
          <TestResults score={testScore} passed={testPassed} totalQuestions={20} />
        )}
      </div>
    </div>
  );
};

export default BecomeMentor;
