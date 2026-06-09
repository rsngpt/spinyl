-- Drop existing tables to ensure they are recreated with all columns
DROP TABLE IF EXISTS public.boiler_room_subscriptions CASCADE;
DROP TABLE IF EXISTS public.boiler_room_comments CASCADE;

-- Create boiler_room_comments table
CREATE TABLE public.boiler_room_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  boiler_room_id uuid NOT NULL REFERENCES public.boiler_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.boiler_room_comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.boiler_room_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Boiler room comments are viewable by everyone" ON public.boiler_room_comments;
DROP POLICY IF EXISTS "Users can insert their own boiler room comments" ON public.boiler_room_comments;
DROP POLICY IF EXISTS "Users can update their own boiler room comments" ON public.boiler_room_comments;
DROP POLICY IF EXISTS "Users can delete their own boiler room comments" ON public.boiler_room_comments;

CREATE POLICY "Boiler room comments are viewable by everyone" 
  ON public.boiler_room_comments FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own boiler room comments" 
  ON public.boiler_room_comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boiler room comments" 
  ON public.boiler_room_comments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boiler room comments" 
  ON public.boiler_room_comments FOR DELETE 
  USING (auth.uid() = user_id);

-- Create boiler_room_subscriptions table
CREATE TABLE public.boiler_room_subscriptions (
  boiler_room_id uuid NOT NULL REFERENCES public.boiler_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (boiler_room_id, user_id)
);

-- Enable RLS
ALTER TABLE public.boiler_room_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Boiler room subscriptions are viewable by everyone" ON public.boiler_room_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own boiler room subscriptions" ON public.boiler_room_subscriptions;
DROP POLICY IF EXISTS "Users can delete their own boiler room subscriptions" ON public.boiler_room_subscriptions;

CREATE POLICY "Boiler room subscriptions are viewable by everyone"
  ON public.boiler_room_subscriptions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own boiler room subscriptions"
  ON public.boiler_room_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boiler room subscriptions"
  ON public.boiler_room_subscriptions FOR DELETE
  USING (auth.uid() = user_id);
