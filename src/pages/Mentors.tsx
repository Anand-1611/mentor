import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MentorFiltersComponent, MentorFilters } from "@/components/mentors/MentorFilters";
import { Users, Search, CheckCircle2, GraduationCap } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

const Mentors = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<MentorFilters>({
    subjects: [],
    hourlyRateRange: [100, 5000],
    sortBy: "recent",
    availableOnly: false,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [debouncedSearchTerm, filters]);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchMentors = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("mentors")
        .select("*, profiles(full_name, avatar_url, bio)")
        .eq("status", "verified");

      // Apply search filter (search by name or subject)
      if (debouncedSearchTerm.trim()) {
        query = query.or(
          `subject.ilike.%${debouncedSearchTerm}%,profiles.full_name.ilike.%${debouncedSearchTerm}%`
        );
      }

      // Apply subject filter
      if (filters.subjects.length > 0) {
        query = query.in("subject", filters.subjects);
      }

      // Apply hourly rate filter
      query = query
        .gte("hourly_rate", filters.hourlyRateRange[0])
        .lte("hourly_rate", filters.hourlyRateRange[1]);

      // Apply sorting
      switch (filters.sortBy) {
        case "recent":
          query = query.order("created_at", { ascending: false });
          break;
        case "score":
          query = query.order("test_score", { ascending: false, nullsLast: true });
          break;
        case "rate_low":
          query = query.order("hourly_rate", { ascending: true, nullsLast: true });
          break;
        case "rate_high":
          query = query.order("hourly_rate", { ascending: false, nullsLast: true });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      subjects: [],
      hourlyRateRange: [100, 5000],
      sortBy: "recent",
      availableOnly: false,
    });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Verified Mentors</h1>
              <p className="text-muted-foreground">
                Connect with grade-verified seniors who've aced their exams
              </p>
            </div>
            {user && (
              <Button onClick={() => navigate("/become-mentor")} size="lg">
                <GraduationCap className="w-5 h-5 mr-2" />
                Become a Mentor
              </Button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search mentors by name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <MentorFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Mentors Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading mentors...</p>
              </div>
            ) : mentors.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">No mentors found</p>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Try a different search term or adjust filters" : "Check back soon for verified mentors!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">
                              {mentor.profiles?.full_name || "Anonymous"}
                            </CardTitle>
                            {mentor.status === "verified" && (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-accent">Verified</Badge>
                            {mentor.test_score && (
                              <span className="text-xs text-muted-foreground">
                                Score: {mentor.test_score.toFixed(0)}%
                              </span>
                            )}
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
                      <Button 
                        className="w-full bg-accent hover:bg-accent/90"
                        onClick={() => navigate(`/mentors/${mentor.user_id}`)}
                      >
                        Book Session
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mentors;
