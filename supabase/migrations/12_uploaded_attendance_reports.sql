-- Migration: 12_uploaded_attendance_reports.sql
-- Description: Creates the uploaded_attendance_reports table and sets up RLS and permissions.

CREATE TABLE IF NOT EXISTS public.uploaded_attendance_reports (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  internship_id uuid NOT NULL,
  student_id uuid NOT NULL,
  file_url text NOT NULL,
  hours_rendered numeric(6,2) NOT NULL DEFAULT 0,
  uploaded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT uploaded_attendance_reports_pkey PRIMARY KEY (id),
  CONSTRAINT uploaded_attendance_reports_internship_id_fkey FOREIGN KEY (internship_id) REFERENCES public.student_internships(id) ON DELETE CASCADE,
  CONSTRAINT uploaded_attendance_reports_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.uploaded_attendance_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DROP POLICY IF EXISTS "Allow authenticated select uploaded reports" ON public.uploaded_attendance_reports;
CREATE POLICY "Allow authenticated select uploaded reports" ON public.uploaded_attendance_reports
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert uploaded reports" ON public.uploaded_attendance_reports;
CREATE POLICY "Allow authenticated insert uploaded reports" ON public.uploaded_attendance_reports
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update uploaded reports" ON public.uploaded_attendance_reports;
CREATE POLICY "Allow authenticated update uploaded reports" ON public.uploaded_attendance_reports
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete uploaded reports" ON public.uploaded_attendance_reports;
CREATE POLICY "Allow authenticated delete uploaded reports" ON public.uploaded_attendance_reports
  FOR DELETE TO authenticated USING (true);

-- Grant privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON public.uploaded_attendance_reports TO authenticated;
