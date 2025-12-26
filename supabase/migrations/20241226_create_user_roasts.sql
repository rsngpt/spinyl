-- Create user_roasts table
create table user_roasts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  roast_content jsonb not null, -- Stores { diagnosis, roast_text, rating, hashtag }
  reviews_count_snapshot int not null, -- Number of reviews the user had at the time of this roast
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table user_roasts enable row level security;

create policy "Users can view their own roasts"
  on user_roasts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own roasts"
  on user_roasts for insert
  with check (auth.uid() = user_id);
