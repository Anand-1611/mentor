-- Create content_flags table for user-reported content
CREATE TABLE public.content_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('note', 'post', 'mentor')),
  content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;

-- Users can create flags
CREATE POLICY "Authenticated users can create flags"
  ON content_flags FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own flags
CREATE POLICY "Users can view own flags"
  ON content_flags FOR SELECT
  USING (auth.uid() = reporter_id);

-- Admins can view all flags
CREATE POLICY "Admins can view all flags"
  ON content_flags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update flags (for review)
CREATE POLICY "Admins can update flags"
  ON content_flags FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX idx_content_flags_status ON content_flags(status);
CREATE INDEX idx_content_flags_content ON content_flags(content_type, content_id);
CREATE INDEX idx_content_flags_created_at ON content_flags(created_at DESC);

-- Function to get flagged content with details
CREATE OR REPLACE FUNCTION public.get_flagged_content()
RETURNS TABLE (
  flag_id UUID,
  content_type TEXT,
  content_id UUID,
  content_title TEXT,
  content_owner_id UUID,
  content_owner_name TEXT,
  reason TEXT,
  description TEXT,
  reporter_id UUID,
  reporter_name TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
BEGIN
  RETURN QUERY
  SELECT 
    cf.id as flag_id,
    cf.content_type,
    cf.content_id,
    CASE 
      WHEN cf.content_type = 'note' THEN n.title
      WHEN cf.content_type = 'post' THEN SUBSTRING(cp.content, 1, 50) || '...'
      WHEN cf.content_type = 'mentor' THEN p.full_name
      ELSE 'Unknown'
    END as content_title,
    CASE 
      WHEN cf.content_type = 'note' THEN n.owner_id
      WHEN cf.content_type = 'post' THEN cp.user_id
      WHEN cf.content_type = 'mentor' THEN m.user_id
      ELSE NULL
    END as content_owner_id,
    CASE 
      WHEN cf.content_type = 'note' THEN owner_p.full_name
      WHEN cf.content_type = 'post' THEN post_p.full_name
      WHEN cf.content_type = 'mentor' THEN mentor_p.full_name
      ELSE 'Unknown'
    END as content_owner_name,
    cf.reason,
    cf.description,
    cf.reporter_id,
    reporter_p.full_name as reporter_name,
    cf.status,
    cf.created_at,
    cf.reviewed_by,
    cf.reviewed_at
  FROM content_flags cf
  LEFT JOIN notes n ON cf.content_type = 'note' AND cf.content_id = n.id
  LEFT JOIN community_posts cp ON cf.content_type = 'post' AND cf.content_id = cp.id
  LEFT JOIN mentors m ON cf.content_type = 'mentor' AND cf.content_id = m.id
  LEFT JOIN profiles owner_p ON n.owner_id = owner_p.id
  LEFT JOIN profiles post_p ON cp.user_id = post_p.id
  LEFT JOIN profiles mentor_p ON m.user_id = mentor_p.id
  LEFT JOIN profiles reporter_p ON cf.reporter_id = reporter_p.id
  ORDER BY cf.created_at DESC;
END;
$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_flagged_content() TO authenticated;

-- Function to suspend a mentor
CREATE OR REPLACE FUNCTION public.suspend_mentor(
  mentor_user_id UUID,
  admin_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can suspend mentors';
  END IF;

  -- Update mentor status
  UPDATE mentors
  SET status = 'suspended'
  WHERE user_id = mentor_user_id;

  RETURN FOUND;
END;
$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.suspend_mentor(UUID, UUID) TO authenticated;

-- Function to approve/reject flagged content
CREATE OR REPLACE FUNCTION public.review_flag(
  flag_id UUID,
  admin_id UUID,
  new_status TEXT,
  action TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
DECLARE
  flag_record RECORD;
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can review flags';
  END IF;

  -- Get flag details
  SELECT * INTO flag_record
  FROM content_flags
  WHERE id = flag_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Flag not found';
  END IF;

  -- Update flag status
  UPDATE content_flags
  SET 
    status = new_status,
    reviewed_by = admin_id,
    reviewed_at = NOW()
  WHERE id = flag_id;

  -- Perform action if approved
  IF new_status = 'approved' AND action IS NOT NULL THEN
    IF action = 'delete_note' AND flag_record.content_type = 'note' THEN
      DELETE FROM notes WHERE id = flag_record.content_id;
    ELSIF action = 'delete_post' AND flag_record.content_type = 'post' THEN
      DELETE FROM community_posts WHERE id = flag_record.content_id;
    ELSIF action = 'suspend_mentor' AND flag_record.content_type = 'mentor' THEN
      UPDATE mentors SET status = 'suspended' WHERE user_id = flag_record.content_id;
    END IF;
  END IF;

  RETURN TRUE;
END;
$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.review_flag(UUID, UUID, TEXT, TEXT) TO authenticated;

