-- Migration: Create error_logs table
-- Description: Creates the error_logs table to store AI generation errors
-- Author: System
-- Date: 2024-03-27

-- Create the error_logs table
create table if not exists public.error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    source_text_hash varchar not null,
    source_text_length int not null check (source_text_length between 1000 and 10000),
    error_code varchar not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Create index for faster lookups
create index if not exists error_logs_user_id_idx on public.error_logs(user_id);

-- Enable Row Level Security
alter table public.error_logs enable row level security;

-- Create policies for authenticated users
create policy "Users can view their own error logs"
    on public.error_logs for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own error logs"
    on public.error_logs for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Note: Update and delete policies are not needed as error logs should be immutable 