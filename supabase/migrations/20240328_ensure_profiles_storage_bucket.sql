
-- Create storage bucket for profile avatars if it doesn't exist
DO $$
BEGIN
  -- Create profiles storage bucket if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'profiles'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('profiles', 'profiles', true);
  END IF;

  -- Set storage policy for authenticated users to read all profiles but only upload to their own folder
  BEGIN
    INSERT INTO storage.policies (name, bucket_id, definition)
    VALUES (
      'Avatar images are publicly accessible',
      'profiles',
      '(bucket_id = ''profiles'')'
    );
  EXCEPTION WHEN unique_violation THEN
    -- Policy already exists
  END;

  BEGIN
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES (
      'Users can upload avatars to their own folder',
      'profiles',
      'INSERT',
      '(bucket_id = ''profiles'' AND auth.uid() = (storage.foldername(name))[1]::uuid)'
    );
  EXCEPTION WHEN unique_violation THEN
    -- Policy already exists
  END;

  BEGIN
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES (
      'Users can update avatars in their own folder',
      'profiles',
      'UPDATE',
      '(bucket_id = ''profiles'' AND auth.uid() = (storage.foldername(name))[1]::uuid)'
    );
  EXCEPTION WHEN unique_violation THEN
    -- Policy already exists
  END;

  BEGIN
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES (
      'Users can delete avatars in their own folder',
      'profiles',
      'DELETE',
      '(bucket_id = ''profiles'' AND auth.uid() = (storage.foldername(name))[1]::uuid)'
    );
  EXCEPTION WHEN unique_violation THEN
    -- Policy already exists
  END;
END
$$;
