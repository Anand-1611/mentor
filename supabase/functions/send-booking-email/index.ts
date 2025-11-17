import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { bookingId } = await req.json();

    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    // Fetch booking details with related data
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        student:profiles!bookings_student_id_fkey(full_name, email),
        mentor:profiles!bookings_mentor_id_fkey(full_name, email)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Format booking details
    const bookingDate = new Date(booking.slot);
    const sessionDateTime = `${bookingDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })} at ${bookingDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    const dashboardUrl = `${Deno.env.get("FRONTEND_URL") || "http://localhost:5173"}/dashboard/bookings`;

    // Calculate mentor earnings (85% after 15% commission)
    const mentorEarnings = (booking.amount * 0.85).toFixed(2);

    // Send email to student
    try {
      const studentEmailResponse = await supabase.functions.invoke("send-email", {
        body: {
          template: "booking-confirmation-student",
          to: booking.student.email,
          variables: {
            studentName: booking.student.full_name || "Student",
            mentorName: booking.mentor.full_name || "Mentor",
            subject: booking.subject || "General",
            sessionDateTime: sessionDateTime,
            duration: booking.duration?.toString() || "60",
            amount: booking.amount?.toString() || "0",
            bookingId: bookingId,
            dashboardUrl: dashboardUrl,
            studentEmail: booking.student.email,
          },
        },
      });

      if (studentEmailResponse.error) {
        console.error("Error sending student email:", studentEmailResponse.error);
      } else {
        console.log("Student booking confirmation email sent successfully");
      }
    } catch (emailError) {
      console.error("Failed to send student email:", emailError);
    }

    // Send email to mentor
    try {
      const mentorEmailResponse = await supabase.functions.invoke("send-email", {
        body: {
          template: "booking-confirmation-mentor",
          to: booking.mentor.email,
          variables: {
            mentorName: booking.mentor.full_name || "Mentor",
            studentName: booking.student.full_name || "Student",
            subject: booking.subject || "General",
            sessionDateTime: sessionDateTime,
            duration: booking.duration?.toString() || "60",
            amount: booking.amount?.toString() || "0",
            mentorEarnings: mentorEarnings,
            bookingId: bookingId,
            dashboardUrl: dashboardUrl,
            mentorEmail: booking.mentor.email,
          },
        },
      });

      if (mentorEmailResponse.error) {
        console.error("Error sending mentor email:", mentorEmailResponse.error);
      } else {
        console.log("Mentor booking notification email sent successfully");
      }
    } catch (emailError) {
      console.error("Failed to send mentor email:", emailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Booking confirmation emails sent successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending booking email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
