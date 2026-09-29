-- ============================================================
-- SQL Migration: Followers & Following System (user_follows)
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(follower_id, following_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- 1. Anyone logged in can view follows (to see followers/following counts & lists)
CREATE POLICY "Public read user_follows" 
  ON public.user_follows 
  FOR SELECT 
  USING (true);

-- 2. Authenticated user can follow someone
CREATE POLICY "Authenticated users can follow" 
  ON public.user_follows 
  FOR INSERT 
  WITH CHECK (auth.uid() = follower_id);

-- 3. Authenticated user can unfollow
CREATE POLICY "Users can unfollow" 
  ON public.user_follows 
  FOR DELETE 
  USING (auth.uid() = follower_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);
