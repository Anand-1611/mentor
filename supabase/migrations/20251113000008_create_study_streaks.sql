-- Create study_streaks table
CREATE TABLE IF NOT EXISTS public.study_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_study_streaks_user_id ON public.study_streaks(user_id);

-- Enable RLS
ALTER TABLE public.study_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own study streaks"
  ON public.study_streaks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study streaks"
  ON public.study_streaks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study streaks"
  ON public.study_streaks
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.study_streaks TO authenticated;

-- Create update_study_streak function
CREATE OR REPLACE FUNCTION public.update_study_streak(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
  existing_streak RECORD;
  new_current_streak INTEGER;
  new_longest_streak INTEGER;
  result JSON;
BEGIN
  -- Get existing streak record
  SELECT * INTO existing_streak
  FROM study_streaks
  WHERE user_id = user_uuid;
  
  -- If no record exists, create one
  IF existing_streak IS NULL THEN
    INSERT INTO study_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (user_uuid, 1, 1, current_date)
    RETURNING current_streak, longest_streak INTO new_current_streak, new_longest_streak;
    
    result := json_build_object(
      'current_streak', new_current_streak,
      'longest_streak', new_longest_streak
    );
    RETURN result;
  END IF;
  
  -- If activity is today, no change needed
  IF existing_streak.last_activity_date = current_date THEN
    result := json_build_object(
      'current_streak', existing_streak.current_streak,
      'longest_streak', existing_streak.longest_streak
    );
    RETURN result;
  END IF;
  
  -- If activity was yesterday, increment streak
  IF existing_streak.last_activity_date = current_date - INTERVAL '1 day' THEN
    new_current_streak := existing_streak.current_streak + 1;
    new_longest_streak := GREATEST(existing_streak.longest_streak, new_current_streak);
    
    UPDATE study_streaks
    SET current_streak = new_current_streak,
        longest_streak = new_longest_streak,
        last_activity_date = current_date,
        updated_at = NOW()
    WHERE user_id = user_uuid;
    
    result := json_build_object(
      'current_streak', new_current_streak,
      'longest_streak', new_longest_streak
    );
    RETURN result;
  END IF;
  
  -- If gap is more than 1 day, reset streak
  new_current_streak := 1;
  new_longest_streak := existing_streak.longest_streak;
  
  UPDATE study_streaks
  SET current_streak = new_current_streak,
      longest_streak = new_longest_streak,
      last_activity_date = current_date,
      updated_at = NOW()
  WHERE user_id = user_uuid;
  
  result := json_build_object(
    'current_streak', new_current_streak,
    'longest_streak', new_longest_streak
  );
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_study_streak(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.update_study_streak(UUID) IS 
'Updates study streak for a user. Increments streak if activity today or yesterday, resets if gap > 1 day';

