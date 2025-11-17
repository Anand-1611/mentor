-- Create function to get platform-wide metrics for admin dashboard
CREATE OR REPLACE FUNCTION public.get_platform_metrics(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
DECLARE
  result JSON;
  date_filter_start TIMESTAMP WITH TIME ZONE;
  date_filter_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Set default date range if not provided (last 30 days)
  date_filter_start := COALESCE(start_date, NOW() - INTERVAL '30 days');
  date_filter_end := COALESCE(end_date, NOW());

  SELECT json_build_object(
    'total_users', (
      SELECT COUNT(*) FROM auth.users
    ),
    'daily_active_users', (
      SELECT COUNT(DISTINCT user_id)
      FROM (
        SELECT user_id, created_at FROM transactions WHERE created_at >= date_filter_start AND created_at <= date_filter_end
        UNION ALL
        SELECT user_id, created_at FROM flashcards WHERE created_at >= date_filter_start AND created_at <= date_filter_end
        UNION ALL
        SELECT user_id, created_at FROM quiz_attempts WHERE completed_at >= date_filter_start AND completed_at <= date_filter_end
        UNION ALL
        SELECT student_id as user_id, created_at FROM bookings WHERE created_at >= date_filter_start AND created_at <= date_filter_end
      ) activities
    ),
    'notes_uploaded', (
      SELECT COUNT(*) FROM notes
      WHERE created_at >= date_filter_start AND created_at <= date_filter_end
    ),
    'total_notes', (
      SELECT COUNT(*) FROM notes
    ),
    'transactions_count', (
      SELECT COUNT(*) FROM transactions
      WHERE created_at >= date_filter_start AND created_at <= date_filter_end
    ),
    'total_transactions', (
      SELECT COUNT(*) FROM transactions
    ),
    'bookings_count', (
      SELECT COUNT(*) FROM bookings
      WHERE created_at >= date_filter_start AND created_at <= date_filter_end
    ),
    'total_bookings', (
      SELECT COUNT(*) FROM bookings
    ),
    'total_revenue', (
      SELECT COALESCE(SUM(amount), 0) FROM transactions
      WHERE created_at >= date_filter_start AND created_at <= date_filter_end
    ),
    'platform_commission', (
      SELECT COALESCE(SUM(amount * 0.15), 0) FROM transactions
      WHERE created_at >= date_filter_start AND created_at <= date_filter_end
    ),
    'seller_payouts', (
      SELECT COALESCE(SUM(amount * 0.85), 0) FROM transactions
      WHERE created_at >= date_filter_start AND created_at <= date_filter_end
    ),
    'verified_mentors', (
      SELECT COUNT(*) FROM mentors WHERE status = 'verified'
    ),
    'pending_mentors', (
      SELECT COUNT(*) FROM mentors WHERE status = 'pending'
    ),
    'suspended_mentors', (
      SELECT COUNT(*) FROM mentors WHERE status = 'suspended'
    ),
    'daily_transactions', (
      SELECT json_agg(
        json_build_object(
          'date', date_trunc('day', created_at)::date,
          'count', count,
          'revenue', revenue
        )
        ORDER BY date_trunc('day', created_at)
      )
      FROM (
        SELECT 
          date_trunc('day', created_at) as day,
          COUNT(*) as count,
          SUM(amount) as revenue
        FROM transactions
        WHERE created_at >= date_filter_start AND created_at <= date_filter_end
        GROUP BY date_trunc('day', created_at)
      ) daily_data
    ),
    'top_subjects', (
      SELECT json_agg(
        json_build_object(
          'subject', subject,
          'count', count
        )
        ORDER BY count DESC
      )
      FROM (
        SELECT subject, COUNT(*) as count
        FROM notes
        GROUP BY subject
        ORDER BY count DESC
        LIMIT 10
      ) subject_data
    ),
    'date_range', json_build_object(
      'start', date_filter_start,
      'end', date_filter_end
    )
  ) INTO result;
  
  RETURN result;
END;
$;

-- Grant execute permission to authenticated users (will be restricted by RLS)
GRANT EXECUTE ON FUNCTION public.get_platform_metrics(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_platform_metrics IS 'Returns platform-wide metrics for admin dashboard. Only accessible by admin users.';

