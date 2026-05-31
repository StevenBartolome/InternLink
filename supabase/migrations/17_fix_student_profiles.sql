-- Migration: 17_fix_student_profiles.sql
-- Description: Ensures contact_number column exists in student_profiles and refreshes the PostgREST schema cache to fix PGRST204.

ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS contact_number VARCHAR(30);

-- Notify PostgREST to reload the schema cache so the API recognizes the column
NOTIFY pgrst, 'reload schema';
