-- Migration: Create Additional Requirements table
-- This table handles student-specific custom/additional requirements assigned by professors.

-- 1. Create the additional_requirements table
CREATE TABLE IF NOT EXISTS public.additional_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internship_id UUID NOT NULL REFERENCES public.student_internships(id) ON DELETE CASCADE,
    document_name CHARACTER VARYING(255) NOT NULL,
    file_url TEXT,
    status public.document_status NOT NULL DEFAULT 'NOT_SUBMITTED'::document_status,
    reviewer_comment TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.additional_requirements ENABLE ROW LEVEL SECURITY;

-- 3. Policies

-- Students can view their own additional requirements
DROP POLICY IF EXISTS "Students can view their own additional requirements" ON public.additional_requirements;
CREATE POLICY "Students can view their own additional requirements" 
ON public.additional_requirements 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.student_internships 
        WHERE id = additional_requirements.internship_id 
        AND student_id = auth.uid()
    )
);

-- Students can upload/update their own additional requirements (must result in PENDING status)
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
    status = 'PENDING'
);

-- Professors/Advisers (role: ojt_head or admin) can manage everything (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Professors can manage additional requirements" ON public.additional_requirements;
CREATE POLICY "Professors can manage additional requirements" 
ON public.additional_requirements 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('ojt_head', 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('ojt_head', 'admin')
    )
);

-- 4. Grant table permissions
GRANT ALL ON public.additional_requirements TO authenticated;
GRANT ALL ON public.additional_requirements TO anon;

-- 5. Trigger for updated_at
CREATE TRIGGER update_additional_requirements_updated_at
    BEFORE UPDATE ON public.additional_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
