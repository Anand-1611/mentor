import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Sparkles, FileText } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    notesUploaded: 0,
    flashcards: 0,
    bookings: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    fetchProfile(session.user.id);
    fetchStats(session.user.id);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const fetchStats = async (userId: string) => {
    const [notes, flashcards, bookings] = await Promise.all([
      supabase.from("notes").select("id", { count: "exact" }).eq("owner_id", userId),
      supabase.from("flashcards").select("id", { count: "exact" }).eq("user_id", userId),
      supabase.from("bookings").select("id", { count: "exact" }).eq("student_id", userId),
    ]);

    setStats({
      notesUploaded: notes.count || 0,
      flashcards: flashcards.count || 0,
      bookings: bookings.count || 0,
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile?.full_name || "Student"}!
          </h1>
          <p className="text-muted-foreground">Here's your academic progress</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notes Uploaded</CardTitle>
                <FileText className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.notesUploaded}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Flashcards</CardTitle>
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.flashcards}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Sessions Booked</CardTitle>
                <Users className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.bookings}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with MentorLink features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/notes")}>
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Notes
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/mentors")}>
                <Users className="w-4 h-4 mr-2" />
                Find a Mentor
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Flashcards
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
              {profile?.college && (
                <div>
                  <p className="text-sm text-muted-foreground">College</p>
                  <p className="font-medium">{profile.college}</p>
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={() => navigate("/profile")}>
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
