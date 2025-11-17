import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Star, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Mentor {
  id: string;
  user_id: string;
  subject: string;
  hourly_rate: number;
  test_score: number;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface MentorRecommendationsProps {
  weakTopics: string[];
}

const MentorRecommendations = ({ weakTopics }: MentorRecommendationsProps) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (weakTopics.length > 0) {
      fetchRecommendedMentors();
    } else {
      setLoading(false);
    }
  }, [weakTopics]);

  const fetchRecommendedMentors = async () => {
    try {
      const { data, error } = await supabase
        .from("mentors")
        .select(`
          id,
          user_id,
          subject,
          hourly_rate,
          test_score,
          profiles!mentors_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq("status", "verified")
        .in("subject", weakTopics)
        .order("test_score", { ascending: false })
        .limit(3);

      if (error) throw error;
      setMentors(data as Mentor[]);
    } catch (error) {
      console.error("Error fetching recommended mentors:", error);
      toast({
        title: "Error",
        description: "Failed to load mentor recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = (mentorUserId: string) => {
    navigate(`/mentors?mentor=${mentorUserId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <CardTitle>Recommended Mentors</CardTitle>
          </div>
          <CardDescription>Based on your weak topics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (weakTopics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <CardTitle>Recommended Mentors</CardTitle>
          </div>
          <CardDescription>Based on your weak topics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No weak topics identified. Keep up the great work!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (mentors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <CardTitle>Recommended Mentors</CardTitle>
          </div>
          <CardDescription>Based on your weak topics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No mentors available for your weak topics yet. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <CardTitle>Recommended Mentors</CardTitle>
        </div>
        <CardDescription>
          Top mentors for your weak topics: {weakTopics.join(", ")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={mentor.profiles.avatar_url || undefined} />
                  <AvatarFallback>
                    {mentor.profiles.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "M"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{mentor.profiles.full_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{mentor.subject}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{mentor.test_score}% verified</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    ₹{mentor.hourly_rate}/hour
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleBookSession(mentor.user_id)}
                className="gap-2"
              >
                <Calendar className="w-4 h-4" />
                Book Session
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MentorRecommendations;
