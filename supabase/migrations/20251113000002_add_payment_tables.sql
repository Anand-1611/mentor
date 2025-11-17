-- Create payment_sessions table for tracking Stripe checkout sessions
CREATE TABLE public.payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'expired')) DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT payment_sessions_item_check CHECK (
    (note_id IS NOT NULL AND booking_id IS NULL) OR
    (note_id IS NULL AND booking_id IS NOT NULL)
  )
);

-- Add commission field to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS commission DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS seller_payout DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS watermarked_file_path TEXT;

-- Enable RLS on payment_sessions
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;

-- Payment sessions RLS policies
CREATE POLICY "Users can view own payment sessions"
  ON payment_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create payment sessions"
  ON payment_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_payment_sessions_stripe_id ON payment_sessions(stripe_session_id);
CREATE INDEX idx_payment_sessions_user_id ON payment_sessions(user_id);
CREATE INDEX idx_payment_sessions_status ON payment_sessions(status);
CREATE INDEX idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX idx_transactions_note_id ON transactions(note_id);

-- Add update trigger for payment_sessions
CREATE TRIGGER update_payment_sessions_updated_at
  BEFORE UPDATE ON payment_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
