
-- Create waiting_pool table for real-time matchmaking
CREATE TABLE public.waiting_pool (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,                   -- client-generated anonymous ID stored in localStorage
  display_name TEXT NOT NULL DEFAULT 'Student',
  exam_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  time_slot TEXT NOT NULL DEFAULT '20:00',
  duration TEXT NOT NULL,
  intensity TEXT NOT NULL,
  focus_score INTEGER NOT NULL DEFAULT 50 CHECK (focus_score >= 0 AND focus_score <= 100),
  exam_date DATE NOT NULL,
  urgency INTEGER NOT NULL DEFAULT 1 CHECK (urgency IN (1, 2, 3)),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_session', 'completed')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '10 minutes')
);

-- Create active_sessions table
CREATE TABLE public.active_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,         -- matches the session_id from formGroup()
  exam_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  duration TEXT NOT NULL,
  intensity TEXT NOT NULL,
  avg_focus INTEGER NOT NULL DEFAULT 0,
  avg_compatibility NUMERIC(4,2) NOT NULL DEFAULT 0,
  urgency_label TEXT NOT NULL DEFAULT 'Low',
  capacity TEXT NOT NULL DEFAULT 'full' CHECK (capacity IN ('full', 'low_capacity', 'solo')),
  participant_user_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.waiting_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- waiting_pool: anyone can read (needed for real-time matchmaking)
CREATE POLICY "Anyone can view waiting pool"
  ON public.waiting_pool FOR SELECT USING (true);

-- waiting_pool: anyone can insert (anonymous students join)
CREATE POLICY "Anyone can join waiting pool"
  ON public.waiting_pool FOR INSERT WITH CHECK (true);

-- waiting_pool: only owner (by user_id text match) can update
CREATE POLICY "Owner can update waiting pool entry"
  ON public.waiting_pool FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- waiting_pool: anyone can delete their own entry (matched or left)
CREATE POLICY "Anyone can delete waiting pool entry"
  ON public.waiting_pool FOR DELETE USING (true);

-- active_sessions: anyone can read
CREATE POLICY "Anyone can view sessions"
  ON public.active_sessions FOR SELECT USING (true);

-- active_sessions: anyone can create
CREATE POLICY "Anyone can create sessions"
  ON public.active_sessions FOR INSERT WITH CHECK (true);

-- active_sessions: anyone can update
CREATE POLICY "Anyone can update sessions"
  ON public.active_sessions FOR UPDATE USING (true);

-- Enable realtime on waiting_pool so clients see new joiners instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.waiting_pool;
ALTER PUBLICATION supabase_realtime ADD TABLE public.active_sessions;

-- Auto-cleanup: function to remove expired waiting pool entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_waiting_pool()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.waiting_pool WHERE expires_at < now() AND status = 'waiting';
END;
$$;
