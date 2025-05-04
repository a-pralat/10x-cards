-- Migration: Create flashcards table
-- Description: Creates the flashcards table to store user's flashcards
-- Author: System
-- Date: 2024-03-27

-- Create the flashcards table
create table if not exists public.flashcards (
    id bigserial primary key,
    front varchar(200) not null,
    back varchar(500) not null,
    source varchar not null check (source in ('ai-gen', 'ai-gen-edited', 'user')),
    generation_id bigint references public.generations(id) on delete set null,
    user_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create indexes for faster lookups
create index if not exists flashcards_user_id_idx on public.flashcards(user_id);
create index if not exists flashcards_generation_id_idx on public.flashcards(generation_id);

-- Enable Row Level Security
alter table public.flashcards enable row level security;

-- Create policies for authenticated users
create policy "Users can view their own flashcards"
    on public.flashcards for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own flashcards"
    on public.flashcards for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own flashcards"
    on public.flashcards for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own flashcards"
    on public.flashcards for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create trigger for updating the updated_at timestamp
create trigger update_flashcards_updated_at
    before update on public.flashcards
    for each row
    execute function public.update_updated_at_column(); 