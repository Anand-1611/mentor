import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response(
      JSON.stringify({ error: "No signature provided" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") as string;

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`Received event: ${event.type}`);

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Get payment session from database
      const { data: paymentSession, error: fetchError } = await supabase
        .from("payment_sessions")
        .select("*")
        .eq("stripe_session_id", session.id)
        .single();

      if (fetchError || !paymentSession) {
        console.error("Payment session not found:", fetchError);
        return new Response(
          JSON.stringify({ error: "Payment session not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      // Update payment session status
      const { error: updateError } = await supabase
        .from("payment_sessions")
        .update({ 
          status: "completed",
          metadata: { ...paymentSession.metadata, payment_intent: session.payment_intent }
        })
        .eq("id", paymentSession.id);

      if (updateError) {
        console.error("Error updating payment session:", updateError);
        throw updateError;
      }

      // If this is a note purchase, create transaction
      if (paymentSession.note_id) {
        const amount = paymentSession.amount;
        const commission = Number((amount * 0.15).toFixed(2));
        const sellerPayout = Number((amount - commission).toFixed(2));

        const { data: transaction, error: transactionError } = await supabase
          .from("transactions")
          .insert({
            buyer_id: paymentSession.user_id,
            note_id: paymentSession.note_id,
            amount: amount,
            commission: commission,
            seller_payout: sellerPayout,
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .select()
          .single();

        if (transactionError) {
          console.error("Error creating transaction:", transactionError);
          throw transactionError;
        }

        console.log(`Transaction created: ${transaction.id}`);

        // Fetch buyer and note details for email
        const { data: buyer } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", paymentSession.user_id)
          .single();

        const { data: note } = await supabase
          .from("notes")
          .select("title, subject")
          .eq("id", paymentSession.note_id)
          .single();

        // Send purchase confirmation email
        if (buyer && note) {
          try {
            const dashboardUrl = `${Deno.env.get("FRONTEND_URL") || "http://localhost:5173"}/dashboard/purchases`;
            
            const emailResponse = await supabase.functions.invoke("send-email", {
              body: {
                template: "purchase-confirmation",
                to: buyer.email,
                variables: {
                  buyerName: buyer.full_name || "Student",
                  noteTitle: note.title,
                  subject: note.subject,
                  amount: amount.toString(),
                  transactionId: transaction.id,
                  purchaseDate: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                  dashboardUrl: dashboardUrl,
                  buyerEmail: buyer.email,
                },
              },
            });

            if (emailResponse.error) {
              console.error("Error sending purchase confirmation email:", emailResponse.error);
            } else {
              console.log("Purchase confirmation email sent successfully");
            }
          } catch (emailError) {
            console.error("Failed to send purchase confirmation email:", emailError);
          }
        }

        // Increment download counter for the note
        const { error: noteUpdateError } = await supabase
          .from("notes")
          .update({ downloads: supabase.raw("downloads + 1") })
          .eq("id", paymentSession.note_id);

        if (noteUpdateError) {
          console.error("Error updating note downloads:", noteUpdateError);
        }

        // Trigger watermarking job
        console.log(`Triggering watermarking for transaction: ${transaction.id}`);
        
        try {
          const watermarkResponse = await supabase.functions.invoke("watermark-pdf", {
            body: { transactionId: transaction.id },
          });

          if (watermarkResponse.error) {
            console.error("Error watermarking PDF:", watermarkResponse.error);
          } else {
            console.log("Watermarking completed successfully");
          }
        } catch (watermarkError) {
          console.error("Failed to trigger watermarking:", watermarkError);
          // Don't fail the webhook if watermarking fails - it can be retried later
        }
      }

      // If this is a booking payment, update booking status
      if (paymentSession.booking_id) {
        const { error: bookingError } = await supabase
          .from("bookings")
          .update({ status: "confirmed" })
          .eq("id", paymentSession.booking_id);

        if (bookingError) {
          console.error("Error updating booking:", bookingError);
          throw bookingError;
        }

        console.log(`Booking confirmed: ${paymentSession.booking_id}`);

        // Create video room
        try {
          const videoResponse = await supabase.functions.invoke("create-video-room", {
            body: { bookingId: paymentSession.booking_id },
          });

          if (videoResponse.error) {
            console.error("Error creating video room:", videoResponse.error);
          } else {
            console.log("Video room created successfully");
          }
        } catch (videoError) {
          console.error("Failed to create video room:", videoError);
          // Don't fail the webhook if video room creation fails
        }

        // Send email notifications
        try {
          const emailResponse = await supabase.functions.invoke("send-booking-email", {
            body: { bookingId: paymentSession.booking_id },
          });

          if (emailResponse.error) {
            console.error("Error sending booking emails:", emailResponse.error);
          } else {
            console.log("Booking emails sent successfully");
          }
        } catch (emailError) {
          console.error("Failed to send booking emails:", emailError);
          // Don't fail the webhook if email sending fails
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});
