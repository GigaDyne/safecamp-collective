
-- Create RLS policies for user_profiles if they don't exist
DO $$ 
BEGIN
  -- Check if the policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Users can update their own profiles'
  ) THEN
    -- Create policy for users to update their own profiles
    CREATE POLICY "Users can update their own profiles" 
    ON public.user_profiles 
    FOR UPDATE 
    USING (auth.uid() = id);
  END IF;

  -- Check if the policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Users can select their own profiles'
  ) THEN
    -- Create policy for users to select their own profiles
    CREATE POLICY "Users can select their own profiles" 
    ON public.user_profiles 
    FOR SELECT 
    USING (auth.uid() = id);
  END IF;
END
$$;
