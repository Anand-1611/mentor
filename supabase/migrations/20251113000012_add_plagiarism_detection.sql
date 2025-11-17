-- Add plagiarism detection fields to notes table
ALTER TABLE public.notes
ADD COLUMN plagiarism_score NUMERIC,
ADD COLUMN plagiarism_checked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN plagiarism_flagged BOOLEAN DEFAULT FALSE,
ADD COLUMN plagiarism_details JSONB;

-- Create index for flagged notes
CREATE INDEX idx_notes_plagiarism_flagged ON notes(plagiarism_flagged) WHERE plagiarism_flagged = TRUE;

-- Function to get notes requiring plagiarism review
CREATE OR REPLACE FUNCTION public.get_notes_for_plagiarism_review()
RETURNS TABLE (
  note_id UUID,
  title TEXT,
  subject TEXT,
  owner_id UUID,
  owner_name TEXT,
  plagiarism_score NUMERIC,
  plagiarism_checked_at TIMESTAMP WITH TIME ZONE,
  plagiarism_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  downloads INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
BEGIN
  RETURN QUERY
  SELECT 
    n.id as note_id,
    n.title,
    n.subject,
    n.owner_id,
    p.full_name as owner_name,
    n.plagiarism_score,
    n.plagiarism_checked_at,
    n.plagiarism_details,
    n.created_at,
    n.downloads
  FROM notes n
  LEFT JOIN profiles p ON n.owner_id = p.id
  WHERE n.plagiarism_flagged = TRUE
  ORDER BY n.plagiarism_score DESC NULLS LAST, n.created_at DESC;
END;
$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_notes_for_plagiarism_review() TO authenticated;

-- Function to update plagiarism score
CREATE OR REPLACE FUNCTION public.update_plagiarism_score(
  note_uuid UUID,
  score NUMERIC,
  details JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
BEGIN
  UPDATE notes
  SET 
    plagiarism_score = score,
    plagiarism_checked_at = NOW(),
    plagiarism_flagged = (score > 70),
    plagiarism_details = details
  WHERE id = note_uuid;

  RETURN FOUND;
END;
$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_plagiarism_score(UUID, NUMERIC, JSONB) TO authenticated;

-- Function to clear plagiarism flag (after admin review)
CREATE OR REPLACE FUNCTION public.clear_plagiarism_flag(
  note_uuid UUID,
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
    RAISE EXCEPTION 'Only admins can clear plagiarism flags';
  END IF;

  UPDATE notes
  SET plagiarism_flagged = FALSE
  WHERE id = note_uuid;

  RETURN FOUND;
END;
$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.clear_plagiarism_flag(UUID, UUID) TO authenticated;

-- Add comment
COMMENT ON COLUMN notes.plagiarism_score IS 'Plagiarism similarity score (0-100). Scores >70 are flagged for review.';
COMMENT ON COLUMN notes.plagiarism_flagged IS 'TRUE if plagiarism score exceeds threshold and requires admin review.';

