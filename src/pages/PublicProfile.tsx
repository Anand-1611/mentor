import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, GraduationCap, Calendar, CheckCircle2 } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  bio: string | null;
  college: string | null;
  year: number | null;
  avatar_url: string | null;
  email: string;
}

interface Note {
  id: string;
  title: string;
  subject: string;
  price: number | null;
  downloads: number | null;
  thumbnail_url: string | null;
  created_at: string;
}

interface Mentor {
  id: string;
  subject: string;
  hourly_rate: number | null;
  status: string;
  verified_at: string | null;
  test_score: number | null;
}

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notesCount, setNotesCount] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user's notes
      const { data: notesData, error: notesError } = await supabase
        .from("notes")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false })
        .limit(6);

      if (notesError) throw notesError;
      setNotes(notesData || []);
      setNotesCount(notesData?.length || 0);

      // Calculate total downloads
      const downloads = notesData?.reduce((sum, note) => sum + (note.downloads || 0), 0) || 0;
      setTotalDownloads(downloads);

      // Check if user is a mentor
      const { data: mentorData, error: mentorError } = await supabase
        .from("mentors")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!mentorError && mentorData) {
        setMentor(mentorData);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Profile not found</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          ← Back
        </Button>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name || ""} />
                <AvatarFallback className="text-4xl">
                  {profile.full_name ? getInitials(profile.full_name) : "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{profile.full_name || "Anonymous User"}</h1>
                  {mentor?.status === "verified" && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified Mentor
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                  {profile.college && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>{profile.college}</span>
                    </div>
                  )}
                  {profile.year && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Year {profile.year}</span>
                    </div>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-muted-foreground mb-4">{profile.bio}</p>
                )}

                {mentor?.status === "verified" && (
                  <Button
                    onClick={() => navigate(`/mentors/${userId}`)}
                    className="bg-accent hover:bg-accent/90"
                  >
                    Book Session
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Notes Uploaded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-accent" />
                <span className="text-2xl font-bold">{notesCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-accent" />
                <span className="text-2xl font-bold">{totalDownloads}</span>
              </div>
            </CardContent>
          </Card>

          {mentor?.status === "verified" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Mentor Subject
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-accent" />
                  <span className="text-2xl font-bold">{mentor.subject}</span>
                </div>
                {mentor.hourly_rate && (
                  <p className="text-sm text-muted-foreground mt-1">
                    ₹{mentor.hourly_rate}/hour
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Uploaded Notes */}
        {notes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Notes</CardTitle>
              <CardDescription>Recent notes shared by this user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map((note) => (
                  <Card key={note.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-muted relative">
                      {note.thumbnail_url ? (
                        <img
                          src={note.thumbnail_url}
                          alt={note.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-1">{note.title}</h3>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="secondary">{note.subject}</Badge>
                        <span className="text-muted-foreground">
                          {note.price ? `₹${note.price}` : "Free"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {note.downloads || 0} downloads • {formatDate(note.created_at)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
