-- Migration: Disable all policies
-- Description: Drops all existing policies from flashcards, generations, and error_logs tables
-- Author: System
-- Date: 2024-03-27

-- Drop flashcards policies
drop policy if exists "Users can view their own flashcards" on public.flashcards;
drop policy if exists "Users can insert their own flashcards" on public.flashcards;
drop policy if exists "Users can update their own flashcards" on public.flashcards;
drop policy if exists "Users can delete their own flashcards" on public.flashcards;

-- Drop generations policies
drop policy if exists "Users can view their own generations" on public.generations;
drop policy if exists "Users can insert their own generations" on public.generations;
drop policy if exists "Users can update their own generations" on public.generations;
drop policy if exists "Users can delete their own generations" on public.generations;

-- Drop error_logs policies
drop policy if exists "Users can view their own error logs" on public.error_logs;
drop policy if exists "Users can insert their own error logs" on public.error_logs;

-- Disable RLS on all tables
alter table public.flashcards disable row level security;
alter table public.generations disable row level security;
alter table public.error_logs disable row level security; 