/**
 * Payment session status
 */
export type PaymentSessionStatus = "pending" | "completed" | "failed" | "expired";

/**
 * Payment session record
 */
export interface PaymentSession {
  id: string;
  user_id: string;
  note_id?: string;
  booking_id?: string;
  stripe_session_id: string;
  amount: number;
  status: PaymentSessionStatus;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Transaction record
 */
export interface Transaction {
  id: string;
  buyer_id: string;
  note_id: string;
  amount: number;
  commission?: number;
  seller_payout?: number;
  stripe_payment_intent_id?: string;
  watermarked_file_path?: string;
  created_at: string;
}

/**
 * Checkout session request
 */
export interface CheckoutSessionRequest {
  noteId?: string;
  bookingId?: string;
  amount: number;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Checkout session response
 */
export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

/**
 * Payment breakdown
 */
export interface PaymentBreakdown {
  amount: number;
  commission: number;
  sellerPayout: number;
  commissionRate: number;
}
