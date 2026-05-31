-- Migration: 14_portfolio_documents.sql
-- Description: Creates the portfolio_documents table to store uploaded portfolio document metadata.

CREATE TABLE IF NOT EXISTS public.portfolio_documents (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  internship_id uuid NOT NULL,
  doc_type text NOT NULL,
  document_name text NOT NULL,
  file_url text NOT NULL,
  submitted_at timestamp with time zone DEFAULT now(),
  CONSTRAINT portfolio_documents_pkey PRIMARY KEY (id),
  CONSTRAINT portfolio_documents_internship_id_fkey FOREIGN KEY (internship_id) REFERENCES public.student_internships(id) ON DELETE CASCADE,
  CONSTRAINT portfolio_documents_internship_doc_type_key UNIQUE (internship_id, doc_type)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.portfolio_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow authenticated select portfolio docs" ON public.portfolio_documents;
CREATE POLICY "Allow authenticated select portfolio docs" ON public.portfolio_documents
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert portfolio docs" ON public.portfolio_documents;
CREATE POLICY "Allow authenticated insert portfolio docs" ON public.portfolio_documents
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update portfolio docs" ON public.portfolio_documents;
CREATE POLICY "Allow authenticated update portfolio docs" ON public.portfolio_documents
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete portfolio docs" ON public.portfolio_documents;
CREATE POLICY "Allow authenticated delete portfolio docs" ON public.portfolio_documents
  FOR DELETE TO authenticated USING (true);

-- Grant privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_documents TO authenticated;
