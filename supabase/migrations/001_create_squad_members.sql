-- Squad Members table
CREATE TABLE squad_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  callsign TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_ready' CHECK (status IN ('not_ready', 'almost_ready', 'ready')),
  timer_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE squad_members;

-- Enable RLS but allow all for now (no auth)
ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON squad_members FOR ALL USING (true) WITH CHECK (true);

-- Seed the squad
INSERT INTO squad_members (callsign, status) VALUES
  ('Bender', 'not_ready'),
  ('Crazy', 'not_ready'),
  ('Stalemate', 'not_ready'),
  ('Tomcat', 'not_ready');
