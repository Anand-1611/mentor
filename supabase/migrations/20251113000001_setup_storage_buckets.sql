-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('notes', 'notes', false, 52428800, ARRAY['application/pdf']),
  ('thumbnails', 'thumbnails', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('grades', 'grades', false, 5242880, ARRAY['image/png', 'image/jpeg', 'text/csv']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for notes bucket
CREATE POLICY "Authenticated users can upload notes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own notes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own notes"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own notes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'notes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for thumbnails bucket (public read)
CREATE POLICY "Anyone can view thumbnails"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'thumbnails');

CREATE POLICY "Authenticated users can upload thumbnails"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own thumbnails"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own thumbnails"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for grades bucket
CREATE POLICY "Users can upload own grades"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'grades' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own grades"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'grades' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all grades"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'grades' AND 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Storage policies for avatars bucket (public read)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
