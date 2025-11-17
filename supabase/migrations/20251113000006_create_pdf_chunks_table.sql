-- Create pdf_chunks table for vector search metadata
CREATE TABLE IF NOT EXISTS pdf_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  page_number INTEGER,
  embedding_indexed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique chunk index per note
  UNIQUE(note_id, chunk_index)
);

-- Create indexes for efficient queries
CREATE INDEX idx_pdf_chunks_note_id ON pdf_chunks(note_id);
CREATE INDEX idx_pdf_chunks_embedding_indexed ON pdf_chunks(embedding_indexed);

-- Enable RLS
ALTER TABLE pdf_chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read chunks for notes they own or have purchased
CREATE POLICY "Users can read their own note chunks"
  ON pdf_chunks FOR SELECT
  USING (
    note_id IN (
      SELECT id FROM notes WHERE owner_id = auth.uid()
    )
    OR
    note_id IN (
      SELECT note_id FROM transactions WHERE buyer_id = auth.uid()
    )
  );

-- Only service role can insert/update/delete chunks
CREATE POLICY "Service role can manage chunks"
  ON pdf_chunks FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Add comment
COMMENT ON TABLE pdf_chunks IS 'Stores PDF text chunks for vector search and AI features';
