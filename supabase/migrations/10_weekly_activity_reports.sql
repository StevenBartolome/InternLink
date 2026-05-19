-- Migration: 10_weekly_activity_reports.sql
-- Description: Creates the weekly_activity_reports table and sets up RLS and permissions.

CREATE TABLE IF NOT EXISTS public.weekly_activity_reports (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  internship_id uuid NOT NULL,
  week_number integer NOT NULL,
  week_label character varying(100),
  summary text NOT NULL,
  skills_learned text,
  challenges text,
  status character varying(50) NOT NULL DEFAULT 'PENDING',
  file_url text, -- Upload option for WAR
  reviewer_comment text,
  submitted_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  CONSTRAINT weekly_activity_reports_pkey PRIMARY KEY (id),
  CONSTRAINT weekly_activity_reports_internship_id_fkey FOREIGN KEY (internship_id) REFERENCES public.student_internships(id) ON DELETE CASCADE,
  CONSTRAINT weekly_activity_reports_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id),
  CONSTRAINT weekly_activity_reports_unique_week UNIQUE(internship_id, week_number)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.weekly_activity_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DROP POLICY IF EXISTS "Allow authenticated select weekly reports" ON public.weekly_activity_reports;
CREATE POLICY "Allow authenticated select weekly reports" ON public.weekly_activity_reports
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert weekly reports" ON public.weekly_activity_reports;
CREATE POLICY "Allow authenticated insert weekly reports" ON public.weekly_activity_reports
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update weekly reports" ON public.weekly_activity_reports;
CREATE POLICY "Allow authenticated update weekly reports" ON public.weekly_activity_reports
  FOR UPDATE TO authenticated USING (true);

-- Grant privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_activity_reports TO authenticated;
