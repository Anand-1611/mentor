import { supabase } from "@/integrations/supabase/client";
import { CheckoutSessionRequest, CheckoutSessionResponse } from "@/types/payment";

/**
 * Creates a Stripe checkout session for purchasing a note
 */
export async function createCheckoutSession(
  request: CheckoutSessionRequest
): Promise<CheckoutSessionResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("You must be logged in to make a purchase");
  }

  const response = await supabase.functions.invoke("create-checkout-session", {
    body: request,
  });

  if (response.error) {
    console.error("Error creating checkout session:", response.error);
    throw new Error(response.error.message || "Failed to create checkout session");
  }

  return response.data as CheckoutSessionResponse;
}

/**
 * Redirects to Stripe Checkout
 */
export async function redirectToCheckout(sessionId: string): Promise<void> {
  const stripe = await loadStripe();
  if (!stripe) {
    throw new Error("Stripe failed to load");
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  
  if (error) {
    console.error("Error redirecting to checkout:", error);
    throw error;
  }
}

/**
 * Loads Stripe.js
 */
async function loadStripe() {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey || publishableKey.includes("YOUR_PUBLISHABLE_KEY")) {
    throw new Error("Stripe publishable key is not configured. Please add it to your .env file.");
  }

  // Dynamically import Stripe
  const { loadStripe: stripeLoader } = await import("@stripe/stripe-js");
  return await stripeLoader(publishableKey);
}

/**
 * Creates checkout session and redirects to Stripe
 * NOTE: Currently using mock payment for demo purposes
 */
export async function purchaseNote(noteId: string, amount: number): Promise<void> {
  // Check if Stripe is configured
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const isStripeConfigured = publishableKey && !publishableKey.includes("YOUR_PUBLISHABLE_KEY");

  if (!isStripeConfigured) {
    // Return a special flag to indicate mock payment should be used
    throw new Error("MOCK_PAYMENT_REQUIRED");
  }

  try {
    const { sessionId, url } = await createCheckoutSession({
      noteId,
      amount,
      successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/notes`,
    });

    // Redirect to Stripe Checkout using the URL
    if (url) {
      window.location.href = url;
    } else {
      // Fallback to using Stripe.js redirect
      await redirectToCheckout(sessionId);
    }
  } catch (error) {
    console.error("Error purchasing note:", error);
    throw error;
  }
}

/**
 * Process mock payment (for demo purposes when Stripe is not available)
 */
export async function processMockPayment(noteId: string, amount: number): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("You must be logged in to make a purchase");
  }

  // Create a transaction record for the mock payment
  const { error: transactionError } = await supabase
    .from("transactions")
    .insert({
      buyer_id: session.user.id,
      note_id: noteId,
      amount: amount,
      stripe_payment_intent_id: `mock_${Date.now()}`, // Mock payment intent ID
    });

  if (transactionError) {
    console.error("Error creating mock payment transaction:", transactionError);
    throw new Error("Failed to process payment");
  }

  // Increment download counter
  const { error: updateError } = await supabase.rpc("increment_note_downloads", {
    note_id: noteId,
  });

  if (updateError) {
    console.error("Error incrementing downloads:", updateError);
  }
}

/**
 * Handles free note downloads
 */
export async function downloadFreeNote(noteId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("You must be logged in to download notes");
  }

  // Create a transaction record for free download
  const { error: transactionError } = await supabase
    .from("transactions")
    .insert({
      buyer_id: session.user.id,
      note_id: noteId,
      amount: 0,
    });

  if (transactionError) {
    console.error("Error creating free download transaction:", transactionError);
    throw new Error("Failed to process free download");
  }

  // Increment download counter
  const { error: updateError } = await supabase.rpc("increment_note_downloads", {
    note_id: noteId,
  });

  if (updateError) {
    console.error("Error incrementing downloads:", updateError);
  }

  // Get the note file path
  const { data: note, error: noteError } = await supabase
    .from("notes")
    .select("file_path, title")
    .eq("id", noteId)
    .single();

  if (noteError || !note) {
    throw new Error("Note not found");
  }

  // Download the file
  const { data: fileData, error: downloadError } = await supabase.storage
    .from("notes")
    .download(note.file_path);

  if (downloadError || !fileData) {
    throw new Error("Failed to download file");
  }

  // Create download link
  const url = URL.createObjectURL(fileData);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${note.title}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
