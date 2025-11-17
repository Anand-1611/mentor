-- Add full-text search support for notes table
-- Create a tsvector column for efficient full-text search
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create a function to update the search vector
CREATE OR REPLACE FUNCTION public.notes_search_vector_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.subject, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS notes_search_vector_trigger ON public.notes;
CREATE TRIGGER notes_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.notes_search_vector_update();

-- Update existing rows with search vectors
UPDATE public.notes SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(subject, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(tags, ' '), '')), 'C');

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS notes_search_vector_idx ON public.notes USING GIN(search_vector);

-- Create a function for searching notes with ranking
CREATE OR REPLACE FUNCTION public.search_notes(search_query TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  subject TEXT,
  price DECIMAL(10,2),
  file_path TEXT,
  thumbnail_url TEXT,
  owner_id UUID,
  downloads INTEGER,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  rank REAL
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.description,
    n.subject,
    n.price,
    n.file_path,
    n.thumbnail_url,
    n.owner_id,
    n.downloads,
    n.tags,
    n.created_at,
    n.updated_at,
    ts_rank(n.search_vector, websearch_to_tsquery('english', search_query)) AS rank
  FROM public.notes n
  WHERE n.search_vector @@ websearch_to_tsquery('english', search_query)
  ORDER BY rank DESC, n.created_at DESC;
END;
$$;

