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
    const dailyApiKey = Deno.env.get("DAILY_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { bookingId } = await req.json();

    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Check if meeting URL already exists
    if (booking.meeting_url) {
      return new Response(
        JSON.stringify({ 
          meetingUrl: booking.meeting_url,
          message: "Meeting room already exists"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    let meetingUrl: string;

    if (dailyApiKey) {
      // Create Daily.co room
      const roomName = `mentorlink-${bookingId}`;
      const bookingDate = new Date(booking.slot);
      const expiryDate = new Date(bookingDate.getTime() + (booking.duration + 30) * 60000); // Add 30 min buffer

      const dailyResponse = await fetch("https://api.daily.co/v1/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${dailyApiKey}`,
        },
        body: JSON.stringify({
          name: roomName,
          privacy: "private",
          properties: {
            exp: Math.floor(expiryDate.getTime() / 1000),
            enable_screenshare: true,
            enable_chat: true,
            enable_knocking: true,
            start_video_off: false,
            start_audio_off: false,
          },
        }),
      });

      if (!dailyResponse.ok) {
        const error = await dailyResponse.json();
        console.error("Daily.co API error:", error);
        throw new Error("Failed to create video room");
      }

      const roomData = await dailyResponse.json();
      meetingUrl = roomData.url;
    } else {
      // Fallback: Generate a placeholder meeting URL
      // In production, you should always have Daily.co configured
      console.warn("DAILY_API_KEY not configured, using placeholder URL");
      meetingUrl = `https://meet.mentorlink.com/${bookingId}`;
    }

    // Update booking with meeting URL
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ meeting_url: meetingUrl })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error updating booking with meeting URL:", updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        meetingUrl,
        message: "Video room created successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating video room:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
