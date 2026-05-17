-- Migration: Create Daily Activities table
-- Replaces the text blob approach in attendance_logs.activities
-- with a proper relational structure (one row per activity entry).

CREATE TABLE IF NOT EXISTS public.daily_activities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  internship_id uuid NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT daily_activities_pkey PRIMARY KEY (id),
  CONSTRAINT daily_activities_internship_id_fkey
    FOREIGN KEY (internship_id)
    REFERENCES public.student_internships(id)
    ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;

-- Grant table-level privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_activities TO authenticated;

-- Drop existing policies to allow re-running this script
DROP POLICY IF EXISTS "Students can read their own activities" ON public.daily_activities;
DROP POLICY IF EXISTS "Students can insert their own activities" ON public.daily_activities;
DROP POLICY IF EXISTS "Students can update their own activities" ON public.daily_activities;
DROP POLICY IF EXISTS "Students can delete their own activities" ON public.daily_activities;
DROP POLICY IF EXISTS "OJT Heads can read all activities" ON public.daily_activities;

-- Students: SELECT
CREATE POLICY "Students can read their own activities"
  ON public.daily_activities FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.student_internships
      WHERE id = daily_activities.internship_id
      AND student_id = auth.uid()
    )
  );

-- Students: INSERT
CREATE POLICY "Students can insert their own activities"
  ON public.daily_activities FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.student_internships
      WHERE id = daily_activities.internship_id
      AND student_id = auth.uid()
    )
  );

-- Students: UPDATE
CREATE POLICY "Students can update their own activities"
  ON public.daily_activities FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.student_internships
      WHERE id = daily_activities.internship_id
      AND student_id = auth.uid()
    )
  );

-- Students: DELETE
CREATE POLICY "Students can delete their own activities"
  ON public.daily_activities FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.student_internships
      WHERE id = daily_activities.internship_id
      AND student_id = auth.uid()
    )
  );

-- OJT Heads: READ ALL
CREATE POLICY "OJT Heads can read all activities"
  ON public.daily_activities FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'ojt_head'
    )
  );
