import { useState, useEffect } from "react";
import { format, addDays, startOfDay, isSameDay, parseISO, addMinutes } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Loader2, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MentorBookingCalendarProps {
  mentorId: string;
  mentorName: string;
  hourlyRate: number;
  onBookingSelect: (slot: Date, duration: number) => void;
}

interface TimeSlot {
  time: Date;
  available: boolean;
}

interface Availability {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface Booking {
  slot: string;
  duration: number;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function MentorBookingCalendar({
  mentorId,
  mentorName,
  hourlyRate,
  onBookingSelect,
}: MentorBookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    loadAvailabilityAndBookings();
  }, [mentorId]);

  useEffect(() => {
    if (availability.length > 0) {
      generateTimeSlots(selectedDate);
    }
  }, [selectedDate, availability, bookings]);

  const loadAvailabilityAndBookings = async () => {
    try {
      setLoading(true);

      // Load mentor availability
      const { data: availData, error: availError } = await supabase
        .from("mentor_availability")
        .select("*")
        .eq("mentor_id", mentorId)
        .eq("is_available", true);

      if (availError) throw availError;
      setAvailability(availData || []);

      // Load existing bookings for the next 14 days
      const today = startOfDay(new Date());
      const endDate = addDays(today, 14);

      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select("slot, duration")
        .eq("mentor_id", mentorId)
        .gte("slot", today.toISOString())
        .lte("slot", endDate.toISOString())
        .in("status", ["pending", "confirmed"]);

      if (bookingError) throw bookingError;
      setBookings(bookingData || []);
    } catch (error: any) {
      console.error("Error loading availability:", error);
      toast.error("Failed to load mentor availability");
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dayAvailability = availability.find((a) => a.day_of_week === dayOfWeek);

    if (!dayAvailability) {
      setTimeSlots([]);
      return;
    }

    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = dayAvailability.start_time.split(":").map(Number);
    const [endHour, endMinute] = dayAvailability.end_time.split(":").map(Number);

    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    let currentTime = new Date(startTime);

    // Generate 60-minute slots
    while (currentTime < endTime) {
      const slotTime = new Date(currentTime);
      
      // Check if slot is in the past
      const isPast = slotTime < new Date();
      
      // Check if slot is already booked
      const isBooked = bookings.some((booking) => {
        const bookingStart = parseISO(booking.slot);
        const bookingEnd = addMinutes(bookingStart, booking.duration || 60);
        return slotTime >= bookingStart && slotTime < bookingEnd;
      });

      slots.push({
        time: slotTime,
        available: !isPast && !isBooked,
      });

      currentTime = addMinutes(currentTime, 60);
    }

    setTimeSlots(slots);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.available) {
      onBookingSelect(slot.time, 60); // Default 60-minute duration
    }
  };

  const getAvailableDates = () => {
    const today = startOfDay(new Date());
    const availableDays = availability.map((a) => a.day_of_week);
    
    return (date: Date) => {
      const dayOfWeek = date.getDay();
      const isInFuture = date >= today;
      const isWithin14Days = date <= addDays(today, 14);
      return isInFuture && isWithin14Days && availableDays.includes(dayOfWeek);
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a Session with {mentorName}</CardTitle>
        <CardDescription>
          Select a date and time slot. Rate: ₹{hourlyRate}/hour
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => !getAvailableDates()(date)}
                className="rounded-md border"
              />
            </div>

            <div>
              <h3 className="font-semibold mb-4">
                Available Times for {format(selectedDate, "MMMM d, yyyy")}
              </h3>
              
              {timeSlots.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No availability on this day
                </p>
              ) : (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {timeSlots.map((slot, index) => (
                      <Button
                        key={index}
                        variant={slot.available ? "outline" : "ghost"}
                        className="w-full justify-start"
                        disabled={!slot.available}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {format(slot.time, "h:mm a")}
                        {!slot.available && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            Booked
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
