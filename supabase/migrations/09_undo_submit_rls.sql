-- Migration: Update RLS policies to support Undo Submission for students

-- 1. Update pre_internship_documents update policy
DROP POLICY IF EXISTS "Students can upload their own documents" ON public.pre_internship_documents;
CREATE POLICY "Students can upload their own documents" 
ON public.pre_internship_documents 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.student_internships 
        WHERE id = pre_internship_documents.internship_id 
        AND student_id = auth.uid()
    )
)
WITH CHECK (
    status IN ('PENDING', 'NOT_SUBMITTED')
);

-- 2. Update additional_requirements update policy
DROP POLICY IF EXISTS "Students can upload additional requirements" ON public.additional_requirements;
CREATE POLICY "Students can upload additional requirements" 
ON public.additional_requirements 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.student_internships 
        WHERE id = additional_requirements.internship_id 
        AND student_id = auth.uid()
    )
)
WITH CHECK (
    status IN ('PENDING', 'NOT_SUBMITTED')
);
