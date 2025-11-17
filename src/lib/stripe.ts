import { supabase } from "@/integrations/supabase/client";

/**
 * Stripe configuration
 */
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
  currency: "inr",
  commissionRate: 0.15, // 15% platform commission
} as const;

/**
 * Create a checkout session for note purchase or booking
 */
export const createCheckoutSession = async ({
  noteId,
  bookingId,
  amount,
  successUrl,
  cancelUrl,
}: {
  noteId?: string;
  bookingId?: string;
  amount: number;
  successUrl?: string;
  cancelUrl?: string;
}): Promise<{ sessionId: string; url: string } | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase.functions.invoke(
      "create-checkout-session",
      {
        body: {
          noteId,
          bookingId,
          amount,
          successUrl,
          cancelUrl,
        },
      }
    );

    if (error) {
      console.error("Error creating checkout session:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return null;
  }
};

/**
 * Calculate platform commission and seller payout
 */
export const calculatePaymentBreakdown = (amount: number) => {
  const commission = Number((amount * STRIPE_CONFIG.commissionRate).toFixed(2));
  const sellerPayout = Number((amount - commission).toFixed(2));

  return {
    amount,
    commission,
    sellerPayout,
    commissionRate: STRIPE_CONFIG.commissionRate,
  };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: STRIPE_CONFIG.currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Validate price range for notes
 */
export const validateNotePrice = (price: number): { valid: boolean; error?: string } => {
  if (price < 0) {
    return { valid: false, error: "Price cannot be negative" };
  }

  if (price > 0 && price < 10) {
    return { valid: false, error: "Minimum price is ₹10" };
  }

  if (price > 5000) {
    return { valid: false, error: "Maximum price is ₹5000" };
  }

  return { valid: true };
};

/**
 * Validate hourly rate for mentors
 */
export const validateHourlyRate = (rate: number): { valid: boolean; error?: string } => {
  if (rate < 100) {
    return { valid: false, error: "Minimum hourly rate is ₹100" };
  }

  if (rate > 5000) {
    return { valid: false, error: "Maximum hourly rate is ₹5000" };
  }

  return { valid: true };
};
