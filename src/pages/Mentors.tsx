import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Star } from "lucide-react";

const Mentors = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase
        .from("mentors")
        .select("*, profiles(full_name, avatar_url, bio)")
        .eq("status", "verified")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Verified Mentors</h1>
          <p className="text-muted-foreground">
            Connect with grade-verified seniors who've aced their exams
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading mentors...</p>
          </div>
        ) : mentors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No verified mentors yet</p>
              <p className="text-muted-foreground">Check back soon for verified mentors!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="hover:border-accent transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        {mentor.profiles?.full_name?.charAt(0) || "M"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {mentor.profiles?.full_name || "Anonymous"}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-accent">Verified</Badge>
                        <Star className="w-4 h-4 fill-accent text-accent" />
                      </div>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {mentor.profiles?.bio || "Experienced mentor"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <span className="font-medium">Subject:</span> {mentor.subject}
                    </p>
                    {mentor.grade && (
                      <p className="text-sm">
                        <span className="font-medium">Grade:</span> {mentor.grade}
                      </p>
                    )}
                    {mentor.hourly_rate && (
                      <p className="text-sm">
                        <span className="font-medium">Rate:</span> ₹{mentor.hourly_rate}/hour
                      </p>
                    )}
                  </div>
                  <Button className="w-full bg-accent hover:bg-accent/90">
                    Book Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentors;
