import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MentorBookingCalendar } from "@/components/mentor/MentorBookingCalendar";
import { BookingConfirmationDialog } from "@/components/mentor/BookingConfirmationDialog";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, GraduationCap, DollarSign, Star } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function MentorProfile() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(60);

  useEffect(() => {
    if (mentorId) {
      loadMentorProfile();
    }
  }, [mentorId]);

  const loadMentorProfile = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("mentors")
        .select("*, profiles(full_name, avatar_url, bio, college, year)")
        .eq("user_id", mentorId)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error("Mentor not found");
        navigate("/mentors");
        return;
      }

      setMentor(data);
    } catch (error: any) {
      console.error("Error loading mentor:", error);
      toast.error("Failed to load mentor profile");
      navigate("/mentors");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSelect = (slot: Date, duration: number) => {
    setSelectedSlot(slot);
    setSelectedDuration(duration);
    setShowBookingDialog(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!mentor) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/mentors")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Mentors
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mentor Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarFallback className="bg-accent text-accent-foreground text-2xl">
                    {mentor.profiles?.full_name?.charAt(0) || "M"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-2xl">
                    {mentor.profiles?.full_name || "Anonymous"}
                  </CardTitle>
                  {mentor.status === "verified" && (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <Badge className="bg-accent mb-2">Verified Mentor</Badge>
                {mentor.test_score && (
                  <p className="text-sm text-muted-foreground">
                    Verification Score: {mentor.test_score.toFixed(0)}%
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mentor.profiles?.bio && (
                <>
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-sm text-muted-foreground">
                      {mentor.profiles.bio}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Subject</p>
                    <p className="text-sm text-muted-foreground">{mentor.subject}</p>
                  </div>
                </div>

                {mentor.grade && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Grade</p>
                      <p className="text-sm text-muted-foreground">{mentor.grade}</p>
                    </div>
                  </div>
                )}

                {mentor.profiles?.college && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">College</p>
                      <p className="text-sm text-muted-foreground">
                        {mentor.profiles.college}
                        {mentor.profiles.year && ` - Year ${mentor.profiles.year}`}
                      </p>
                    </div>
                  </div>
                )}

                {mentor.hourly_rate && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Hourly Rate</span>
                      </div>
                      <span className="text-lg font-bold">₹{mentor.hourly_rate}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Calendar */}
        <div className="lg:col-span-2">
          <MentorBookingCalendar
            mentorId={mentor.user_id}
            mentorName={mentor.profiles?.full_name || "Mentor"}
            hourlyRate={mentor.hourly_rate || 0}
            onBookingSelect={handleBookingSelect}
          />
        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      {selectedSlot && (
        <BookingConfirmationDialog
          open={showBookingDialog}
          onOpenChange={setShowBookingDialog}
          mentorId={mentor.user_id}
          mentorName={mentor.profiles?.full_name || "Mentor"}
          slot={selectedSlot}
          duration={selectedDuration}
          hourlyRate={mentor.hourly_rate || 0}
        />
      )}
    </div>
  );
}
