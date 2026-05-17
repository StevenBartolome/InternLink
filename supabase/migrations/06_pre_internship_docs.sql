-- Migration: Create Pre-Internship Documents table
-- This table handles the checklist of documents students need to upload before being deployed.

-- 1. Create document status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create the pre_internship_documents table
CREATE TABLE IF NOT EXISTS public.pre_internship_documents (
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

-- 3. Enable Row Level Security
ALTER TABLE public.pre_internship_documents ENABLE ROW LEVEL SECURITY;

-- 4. Policies

-- Students can view their own documents
CREATE POLICY "Students can view their own documents" 
ON public.pre_internship_documents 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.student_internships 
        WHERE id = pre_internship_documents.internship_id 
        AND student_id = auth.uid()
    )
);

-- Students can update/upload their own documents if they are not yet approved
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
    status = 'PENDING' -- When uploading, it automatically goes to pending
);

-- OJT Advisers (professors) can view all documents
CREATE POLICY "Professors can view all documents" 
ON public.pre_internship_documents 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('ojt_head', 'admin')
    )
);

-- OJT Advisers can review and update status
CREATE POLICY "Professors can review documents" 
ON public.pre_internship_documents 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('ojt_head', 'admin')
    )
);

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pre_internship_documents_updated_at
    BEFORE UPDATE ON public.pre_internship_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
