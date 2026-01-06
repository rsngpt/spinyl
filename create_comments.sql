-- Create comments table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  review_id uuid not null references public.reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.comments enable row level security;

create policy "Comments are viewable by everyone" 
  on public.comments for select 
  using (true);

create policy "Users can insert their own comments" 
  on public.comments for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own comments" 
  on public.comments for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own comments" 
  on public.comments for delete 
  using (auth.uid() = user_id);

-- Add comment support to notifications
alter table public.notifications 
  add column if not exists comment_id uuid references public.comments(id) on delete cascade;

-- Ensure enum has 'comment' and 'mention' if it's an enum, otherwise just text.
-- If type is text check constraint:
-- alter table public.notifications drop constraint if exists notifications_type_check;
-- alter table public.notifications add constraint notifications_type_check check (type in ('review', 'follow', 'system', 'comment', 'mention'));

