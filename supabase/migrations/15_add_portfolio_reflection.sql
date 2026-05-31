-- Migration: 15_add_portfolio_reflection.sql
-- Description: Adds portfolio_reflection column to student_internships table to save draft reflections.

ALTER TABLE public.student_internships 
ADD COLUMN IF NOT EXISTS portfolio_reflection TEXT;

-- Update the realtime policy to allow updates to this column if needed
-- (Assuming the existing policy for student_internships already covers this)
