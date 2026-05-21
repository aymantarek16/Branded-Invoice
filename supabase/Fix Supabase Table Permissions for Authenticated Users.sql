-- Fix Supabase Data API permissions
-- Run once in Supabase Dashboard > SQL Editor
-- RLS still controls which rows each signed-in user can access.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON public.invoice_activity_logs TO authenticated;

-- Existing sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Future tables created in public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

-- Future sequences created in public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
