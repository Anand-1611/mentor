-- Fixed version of get_user_analytics function
-- Copy and paste this into Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.get_user_analytics(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'notes_purchased', (
      SELECT COUNT(*)
      FROM transactions
      WHERE buyer_id = user_uuid
    ),
    'flashcards_created', (
      SELECT COUNT(*)
      FROM flashcards
      WHERE user_id = user_uuid
    ),
    'quizzes_taken', (
      SELECT COUNT(*)
      FROM quiz_attempts
      WHERE user_id = user_uuid
    ),
    'sessions_booked', (
      SELECT COUNT(*)
      FROM bookings
      WHERE student_id = user_uuid
    ),
    'subject_performance', (
      SELECT COALESCE(json_object_agg(subject, avg_score), '{}'::json)
      FROM (
        SELECT subject, ROUND(AVG(score)::numeric, 2) as avg_score
        FROM quiz_attempts
        WHERE user_id = user_uuid
        GROUP BY subject
      ) subq
    ),
    'weak_topics', (
      SELECT COALESCE(json_agg(subject), '[]'::json)
      FROM (
        SELECT subject
        FROM quiz_attempts
        WHERE user_id = user_uuid
        GROUP BY subject
        HAVING AVG(score) < 60
      ) subq
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_analytics(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_user_analytics(UUID) IS 
'Aggregates user analytics including notes purchased, flashcards created, quizzes taken, sessions booked, subject-wise performance, and weak topics (avg score < 60%)';
