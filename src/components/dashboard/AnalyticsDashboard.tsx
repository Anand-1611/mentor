import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BookOpen, Sparkles, FileText, Users, Flame, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MentorRecommendations from "./MentorRecommendations";

interface UserAnalytics {
  notes_purchased: number;
  flashcards_created: number;
  quizzes_taken: number;
  sessions_booked: number;
  subject_performance: Record<string, number>;
  weak_topics: string[];
}

interface StudyStreak {
  current_streak: number;
  longest_streak: number;
}

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [studyStreak, setStudyStreak] = useState<StudyStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
    fetchStudyStreak();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc("get_user_analytics", {
        user_uuid: user.id,
      });

      if (error) throw error;
      setAnalytics(data as UserAnalytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudyStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("study_streaks")
        .select("current_streak, longest_streak")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data) {
        setStudyStreak(data);
      }
    } catch (error) {
      console.error("Error fetching study streak:", error);
    }
  };

  const getChartData = () => {
    if (!analytics?.subject_performance) return [];
    
    return Object.entries(analytics.subject_performance).map(([subject, score]) => ({
      subject,
      score: Number(score),
    }));
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Notes Purchased</CardTitle>
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.notes_purchased || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Flashcards Created</CardTitle>
              <Sparkles className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.flashcards_created || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.quizzes_taken || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Sessions Booked</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.sessions_booked || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Subject Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Average quiz scores by subject</CardDescription>
          </CardHeader>
          <CardContent>
            {getChartData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No quiz data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weak Topics and Study Streak */}
        <div className="space-y-6">
          {/* Weak Topics */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-destructive" />
                <CardTitle>Weak Topics</CardTitle>
              </div>
              <CardDescription>Subjects where you scored below 60%</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.weak_topics && analytics.weak_topics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analytics.weak_topics.map((topic) => (
                    <Badge key={topic} variant="destructive">
                      {topic}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Great job! No weak topics identified.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Study Streak */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <CardTitle>Study Streak</CardTitle>
              </div>
              <CardDescription>Keep up the momentum!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                  <p className="text-3xl font-bold text-orange-500">
                    {studyStreak?.current_streak || 0} days
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Longest Streak</p>
                  <p className="text-xl font-semibold">
                    {studyStreak?.longest_streak || 0} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mentor Recommendations */}
      <MentorRecommendations weakTopics={analytics?.weak_topics || []} />
    </div>
  );
};

export default AnalyticsDashboard;
