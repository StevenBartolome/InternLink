-- Migration: 16_enable_realtime.sql
-- Description: Enable Supabase Realtime for all tables that need live updates (idempotent)

DO $$
DECLARE
  tables TEXT[] := ARRAY[
    'attendance_logs',
    'pre_internship_documents',
    'weekly_activity_reports',
    'student_internships',
    'additional_requirements',
    'daily_activities',
    'users',
    'student_profiles',
    'student_moas',
    'visit_itineraries',
    'portfolio_documents',
    'audit_logs',
    'departments',
    'programs',
    'program_sections',
    'program_required_documents',
    'companies'
  ];
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    -- Only add if the table exists AND is not already in the publication
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', tbl);
    END IF;
  END LOOP;
END $$;
