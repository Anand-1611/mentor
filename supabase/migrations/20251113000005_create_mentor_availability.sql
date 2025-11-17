-- Create mentor_availability table
CREATE TABLE IF NOT EXISTS mentor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES mentors(user_id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create index for faster queries
CREATE INDEX idx_mentor_availability_mentor_id ON mentor_availability(mentor_id);
CREATE INDEX idx_mentor_availability_day ON mentor_availability(day_of_week);

-- Enable RLS
ALTER TABLE mentor_availability ENABLE ROW LEVEL SECURITY;

-- Policy: Mentors can manage their own availability
CREATE POLICY "Mentors can manage their own availability"
  ON mentor_availability
  FOR ALL
  USING (
    mentor_id IN (
      SELECT user_id FROM mentors WHERE user_id = auth.uid()
    )
  );

-- Policy: Everyone can view mentor availability
CREATE POLICY "Anyone can view mentor availability"
  ON mentor_availability
  FOR SELECT
  USING (is_available = TRUE);

-- Add meeting_url column to bookings table for video calls
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meeting_url TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 60; -- duration in minutes
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mentor_availability_updated_at
  BEFORE UPDATE ON mentor_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
