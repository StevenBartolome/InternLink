-- Create Attendance Logs Table
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  internship_id uuid NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  time_in timestamp with time zone NOT NULL,
  time_out timestamp with time zone,
  activities text,
  hours_rendered double precision DEFAULT 0.0,
  status character varying NOT NULL DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'LOGGED'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT attendance_logs_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_logs_internship_id_fkey FOREIGN KEY (internship_id) REFERENCES public.student_internships(id) ON DELETE CASCADE,
  CONSTRAINT attendance_logs_unique_date_per_internship UNIQUE (internship_id, log_date)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent duplicate errors
DROP POLICY IF EXISTS "Students can read their own attendance logs" ON public.attendance_logs;
DROP POLICY IF EXISTS "Students can insert their own attendance logs" ON public.attendance_logs;
DROP POLICY IF EXISTS "Students can update their own attendance logs" ON public.attendance_logs;
DROP POLICY IF EXISTS "Professors can read all student attendance logs" ON public.attendance_logs;
DROP POLICY IF EXISTS "OJT Heads can read all student attendance logs" ON public.attendance_logs;

-- Enable student select access to their own logs
CREATE POLICY "Students can read their own attendance logs" 
  ON public.attendance_logs 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.student_internships 
      WHERE id = attendance_logs.internship_id 
      AND student_id = auth.uid()
    )
  );

-- Enable student insert access to their own logs
CREATE POLICY "Students can insert their own attendance logs" 
  ON public.attendance_logs 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.student_internships 
      WHERE id = attendance_logs.internship_id 
      AND student_id = auth.uid()
    )
  );

-- Enable student update access to their own logs (for clocking out)
CREATE POLICY "Students can update their own attendance logs" 
  ON public.attendance_logs 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.student_internships 
      WHERE id = attendance_logs.internship_id 
      AND student_id = auth.uid()
    )
  );

-- Enable ojt_head select access to all student attendance logs
CREATE POLICY "OJT Heads can read all student attendance logs" 
  ON public.attendance_logs 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'ojt_head'
    )
  );
