import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoCallInterface } from "@/components/mentor/VideoCallInterface";
import { toast } from "sonner";
import { format, parseISO, differenceInMinutes, isPast } from "date-fns";
import { Calendar, Clock, Video, Loader2, User } from "lucide-react";

interface Booking {
  id: string;
  slot: string;
  duration: number;
  amount: number;
  status: string;
  meeting_url: string | null;
  mentor: {
    full_name: string;
    email: string;
  };
  student: {
    full_name: string;
    email: string;
  };
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [userRole, setUserRole] = useState<"student" | "mentor" | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to view bookings");
        return;
      }

      // Check if user is a mentor
      const { data: mentorData } = await supabase
        .from("mentors")
        .select("user_id")
        .eq("user_id", user.id)
        .single();

      const isMentor = !!mentorData;
      setUserRole(isMentor ? "mentor" : "student");

      // Load bookings based on role
      const query = supabase
        .from("bookings")
        .select(`
          *,
          mentor:profiles!bookings_mentor_id_fkey(full_name, email),
          student:profiles!bookings_student_id_fkey(full_name, email)
        `)
        .order("slot", { ascending: false });

      if (isMentor) {
        query.eq("mentor_id", user.id);
      } else {
        query.eq("student_id", user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error("Error loading bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const canJoinCall = (booking: Booking) => {
    if (!booking.meeting_url) return false;
    if (booking.status !== "confirmed") return false;

    const slotTime = parseISO(booking.slot);
    const now = new Date();
    const minutesUntilStart = differenceInMinutes(slotTime, now);
    const minutesSinceStart = differenceInMinutes(now, slotTime);

    // Can join 10 minutes before and up to duration + 15 minutes after
    return minutesUntilStart <= 10 && minutesSinceStart <= (booking.duration + 15);
  };

  const getBookingStatus = (booking: Booking) => {
    const slotTime = parseISO(booking.slot);
    const now = new Date();

    if (booking.status === "cancelled") {
      return { label: "Cancelled", variant: "destructive" as const };
    }

    if (booking.status === "completed") {
      return { label: "Completed", variant: "secondary" as const };
    }

    if (isPast(slotTime)) {
      return { label: "Past", variant: "secondary" as const };
    }

    const minutesUntilStart = differenceInMinutes(slotTime, now);
    if (minutesUntilStart <= 10) {
      return { label: "Starting Soon", variant: "default" as const };
    }

    return { label: "Upcoming", variant: "outline" as const };
  };

  const filterBookings = (status: "upcoming" | "past") => {
    const now = new Date();
    return bookings.filter((booking) => {
      const slotTime = parseISO(booking.slot);
      if (status === "upcoming") {
        return !isPast(slotTime) && booking.status !== "cancelled";
      } else {
        return isPast(slotTime) || booking.status === "cancelled" || booking.status === "completed";
      }
    });
  };

  if (selectedBooking) {
    return (
      <div className="container mx-auto py-8">
        <Button
          variant="outline"
          onClick={() => setSelectedBooking(null)}
          className="mb-4"
        >
          ← Back to Bookings
        </Button>
        <VideoCallInterface
          meetingUrl={selectedBooking.meeting_url!}
          bookingId={selectedBooking.id}
          userName={userRole === "mentor" 
            ? selectedBooking.mentor.full_name 
            : selectedBooking.student.full_name
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground">
          {userRole === "mentor" 
            ? "Manage your mentoring sessions" 
            : "View and join your booked sessions"
          }
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({filterBookings("upcoming").length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({filterBookings("past").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 mt-6">
            {filterBookings("upcoming").length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No upcoming bookings</p>
                </CardContent>
              </Card>
            ) : (
              filterBookings("upcoming").map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  userRole={userRole}
                  canJoin={canJoinCall(booking)}
                  onJoinCall={() => setSelectedBooking(booking)}
                  status={getBookingStatus(booking)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 mt-6">
            {filterBookings("past").length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No past bookings</p>
                </CardContent>
              </Card>
            ) : (
              filterBookings("past").map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  userRole={userRole}
                  canJoin={false}
                  onJoinCall={() => {}}
                  status={getBookingStatus(booking)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

interface BookingCardProps {
  booking: Booking;
  userRole: "student" | "mentor" | null;
  canJoin: boolean;
  onJoinCall: () => void;
  status: { label: string; variant: any };
}

function BookingCard({ booking, userRole, canJoin, onJoinCall, status }: BookingCardProps) {
  const slotTime = parseISO(booking.slot);
  const otherPerson = userRole === "mentor" ? booking.student : booking.mentor;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {userRole === "mentor" ? "Session with " : "Mentor: "}
              {otherPerson.full_name}
            </CardTitle>
            <CardDescription>{otherPerson.email}</CardDescription>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(slotTime, "MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(slotTime, "h:mm a")} ({booking.duration} minutes)
            </span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="font-semibold">₹{booking.amount}</span>
            {canJoin && (
              <Button onClick={onJoinCall}>
                <Video className="mr-2 h-4 w-4" />
                Join Call
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
