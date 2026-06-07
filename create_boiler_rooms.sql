-- Create boiler_rooms table
create table public.boiler_rooms (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  cover_image text, -- Stores the base64 data URL of the cover image
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.boiler_rooms enable row level security;

-- RLS Policies
create policy "Boiler rooms are viewable by everyone" 
  on public.boiler_rooms for select 
  using (true);

create policy "Users can insert their own boiler rooms" 
  on public.boiler_rooms for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete their own boiler rooms" 
  on public.boiler_rooms for delete 
  using (auth.uid() = user_id);
