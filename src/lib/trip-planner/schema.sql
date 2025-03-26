
-- Schema for trip-planner storage in Supabase

-- Trips table to store trip information
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY,
  owner_id TEXT NOT NULL,
  is_guest BOOLEAN DEFAULT FALSE,
  name TEXT NOT NULL,
  start_location TEXT,
  end_location TEXT,
  stops JSONB,
  route_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on owner_id for faster queries
CREATE INDEX IF NOT EXISTS trips_owner_id_idx ON public.trips (owner_id);

-- Row Level Security (RLS) Policies
-- Enable RLS on trips table
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read only their own trips
CREATE POLICY "Users can view their own trips" 
  ON public.trips 
  FOR SELECT 
  USING (auth.uid()::text = owner_id OR is_guest = true);

-- Policy to allow users to insert their own trips
CREATE POLICY "Users can insert their own trips" 
  ON public.trips 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = owner_id OR is_guest = true);

-- Policy to allow users to update their own trips
CREATE POLICY "Users can update their own trips" 
  ON public.trips 
  FOR UPDATE 
  USING (auth.uid()::text = owner_id OR is_guest = true);

-- Policy to allow users to delete their own trips
CREATE POLICY "Users can delete their own trips" 
  ON public.trips 
  FOR DELETE 
  USING (auth.uid()::text = owner_id OR is_guest = true);

-- Add this comment for documentation
COMMENT ON TABLE public.trips IS 'Stores trip planning data for users and guest sessions';
