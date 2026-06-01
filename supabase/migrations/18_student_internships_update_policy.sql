-- Migration: Add UPDATE policies for student_internships

-- 1. Allow students to update their own internship record (e.g., submitting portfolio)
DROP POLICY IF EXISTS "Allow students to update their own internship" ON public.student_internships;
CREATE POLICY "Allow students to update their own internship"
ON public.student_internships FOR UPDATE
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- 2. Allow OJT Heads to update internships
DROP POLICY IF EXISTS "Allow OJT heads to update internships" ON public.student_internships;
CREATE POLICY "Allow OJT heads to update internships"
ON public.student_internships FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'ojt_head'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'ojt_head'
  )
);

-- 3. Allow Admins to update all internships
DROP POLICY IF EXISTS "Allow admins to update all internships" ON public.student_internships;
CREATE POLICY "Allow admins to update all internships"
ON public.student_internships FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
