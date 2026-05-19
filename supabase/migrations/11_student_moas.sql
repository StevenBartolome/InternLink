-- Migration: 11_student_moas.sql
-- Description: Creates the student_moas table and sets up RLS and permissions.

CREATE TABLE IF NOT EXISTS public.student_moas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  internship_id uuid NOT NULL,
  student_id uuid NOT NULL,
  file_url text NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  uploaded_by uuid,
  CONSTRAINT student_moas_pkey PRIMARY KEY (id),
  CONSTRAINT student_moas_internship_id_fkey FOREIGN KEY (internship_id) REFERENCES public.student_internships(id) ON DELETE CASCADE,
  CONSTRAINT student_moas_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  CONSTRAINT student_moas_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id),
  CONSTRAINT student_moas_unique_internship UNIQUE(internship_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.student_moas ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DROP POLICY IF EXISTS "Allow authenticated select student moas" ON public.student_moas;
CREATE POLICY "Allow authenticated select student moas" ON public.student_moas
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert student moas" ON public.student_moas;
CREATE POLICY "Allow authenticated insert student moas" ON public.student_moas
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update student moas" ON public.student_moas;
CREATE POLICY "Allow authenticated update student moas" ON public.student_moas
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete student moas" ON public.student_moas;
CREATE POLICY "Allow authenticated delete student moas" ON public.student_moas
  FOR DELETE TO authenticated USING (true);

-- Grant privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_moas TO authenticated;
