-- Create the visit_itineraries table
CREATE TABLE IF NOT EXISTS public.visit_itineraries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  date date NOT NULL,
  location character varying NOT NULL,
  notes text,
  status character varying NOT NULL DEFAULT 'SCHEDULED'::character varying,
  students jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT visit_itineraries_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.visit_itineraries ENABLE ROW LEVEL SECURITY;

-- Enable public access policies for authenticated users
DROP POLICY IF EXISTS "Allow all actions for authenticated users" ON public.visit_itineraries;
CREATE POLICY "Allow all actions for authenticated users" 
ON public.visit_itineraries 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Grant required privileges to authenticated, anon, and service_role roles
GRANT ALL ON TABLE public.visit_itineraries TO postgres, anon, authenticated, service_role;
