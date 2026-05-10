-- InternLink Full Schema Migration
-- Aligned to the new 3-Stage Sequential OJT Management System

-- ══════════════════════════════════════════════════════
-- 1. Enums
-- ══════════════════════════════════════════════════════

CREATE TYPE internship_stage AS ENUM (
  'PRE_INTERNSHIP', 'DURING_INTERNSHIP', 'POST_INTERNSHIP', 'COMPLETED'
);

CREATE TYPE document_status AS ENUM (
  'NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'
);

CREATE TYPE moa_status AS ENUM (
  'NOT_STARTED', 'IN_PROGRESS', 'PROCESSED'
);

CREATE TYPE war_status AS ENUM (
  'PENDING', 'APPROVED', 'REJECTED'
);

CREATE TYPE user_role AS ENUM (
  'admin', 'ojt_head', 'student'
);

-- ══════════════════════════════════════════════════════
-- 2. User Profiles (extends Supabase auth.users)
-- ══════════════════════════════════════════════════════

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_first_login BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════
-- 3. Student Profiles (COR-extracted data)
-- ══════════════════════════════════════════════════════

CREATE TABLE student_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  student_id VARCHAR(50) UNIQUE NOT NULL,         -- e.g. 2023-00042
  course VARCHAR(100) NOT NULL,                    -- e.g. BSIT
  course_full_name TEXT,
  year_level VARCHAR(20),
  academic_year VARCHAR(20),
  semester VARCHAR(50),
  ojt_subject_name TEXT,
  contact_number VARCHAR(30)
);

-- ══════════════════════════════════════════════════════
-- 4. OJT Head Profiles
-- ══════════════════════════════════════════════════════

CREATE TABLE ojt_head_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_course VARCHAR(100) NOT NULL,          -- e.g. BSIT
  department VARCHAR(255),
  contact_number VARCHAR(30),
  temp_password VARCHAR(255)                      -- cleared after first login
);

-- ══════════════════════════════════════════════════════
-- 5. Internship Configuration (per course, set by Admin)
-- ══════════════════════════════════════════════════════

CREATE TABLE internship_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course VARCHAR(100) UNIQUE NOT NULL,
  course_full_name TEXT,
  required_hours INTEGER NOT NULL DEFAULT 486,
  ojt_subject_code VARCHAR(50),
  doc_submission_deadline DATE,
  portfolio_submission_deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Required documents per course (configurable)
CREATE TABLE required_documents_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID NOT NULL REFERENCES internship_config(id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- ══════════════════════════════════════════════════════
-- 6. Student Internships (core record)
-- ══════════════════════════════════════════════════════

CREATE TABLE student_internships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ojt_head_id UUID REFERENCES profiles(id),       -- auto-assigned by course
  company_name VARCHAR(255),
  company_address TEXT,
  position VARCHAR(255),
  supervisor_name VARCHAR(255),
  supervisor_email VARCHAR(255),
  current_stage internship_stage NOT NULL DEFAULT 'PRE_INTERNSHIP',
  moa_status moa_status NOT NULL DEFAULT 'NOT_STARTED',
  is_deployed BOOLEAN NOT NULL DEFAULT FALSE,
  deployment_approved_at TIMESTAMPTZ,
  rendered_hours NUMERIC(6,2) NOT NULL DEFAULT 0,
  required_hours INTEGER NOT NULL DEFAULT 486,
  stage2_validated BOOLEAN NOT NULL DEFAULT FALSE,
  stage2_validated_at TIMESTAMPTZ,
  stage3_submitted BOOLEAN NOT NULL DEFAULT FALSE,
  final_grade NUMERIC(4,2),
  final_grade_encoded_at TIMESTAMPTZ,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════
-- 7. Pre-Internship Documents
-- ══════════════════════════════════════════════════════

CREATE TABLE pre_internship_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  internship_id UUID NOT NULL REFERENCES student_internships(id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,
  file_url TEXT,
  status document_status NOT NULL DEFAULT 'NOT_SUBMITTED',
  reviewer_comment TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id)
);

-- ══════════════════════════════════════════════════════
-- 8. Daily Attendance Logs
-- ══════════════════════════════════════════════════════

CREATE TABLE daily_attendance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  internship_id UUID NOT NULL REFERENCES student_internships(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  time_in TIME,
  time_out TIME,
  hours_rendered NUMERIC(4,2),
  activities_description TEXT,
  status VARCHAR(20) DEFAULT 'PRESENT',  -- PRESENT, ABSENT, HALF_DAY
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(internship_id, log_date)
);

-- ══════════════════════════════════════════════════════
-- 9. Weekly Activity Reports (WARs)
-- ══════════════════════════════════════════════════════

CREATE TABLE weekly_activity_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  internship_id UUID NOT NULL REFERENCES student_internships(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  week_label VARCHAR(100),
  summary TEXT NOT NULL,
  skills_learned TEXT,
  challenges TEXT,
  status war_status NOT NULL DEFAULT 'PENDING',
  reviewer_comment TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  UNIQUE(internship_id, week_number)
);

-- ══════════════════════════════════════════════════════
-- 10. During Internship Completion Documents
-- ══════════════════════════════════════════════════════

CREATE TABLE during_internship_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  internship_id UUID NOT NULL REFERENCES student_internships(id) ON DELETE CASCADE,
  certificate_of_completion_url TEXT,
  certificate_status document_status NOT NULL DEFAULT 'NOT_SUBMITTED',
  supervisor_evaluation_url TEXT,
  evaluation_status document_status NOT NULL DEFAULT 'NOT_SUBMITTED',
  uploaded_at TIMESTAMPTZ
);

-- ══════════════════════════════════════════════════════
-- 11. Post-Internship Portfolio
-- ══════════════════════════════════════════════════════

CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  internship_id UUID NOT NULL REFERENCES student_internships(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  file_url TEXT,
  is_uploaded BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ
);

-- ══════════════════════════════════════════════════════
-- 12. Company Visit Logs (OJT Head)
-- ══════════════════════════════════════════════════════

CREATE TABLE company_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ojt_head_id UUID NOT NULL REFERENCES profiles(id),
  visit_date DATE NOT NULL,
  location TEXT NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'SCHEDULED',  -- SCHEDULED, COMPLETED
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE company_visit_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES company_visits(id) ON DELETE CASCADE,
  internship_id UUID NOT NULL REFERENCES student_internships(id)
);

-- ══════════════════════════════════════════════════════
-- 13. Notifications
-- ══════════════════════════════════════════════════════

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,  -- document, war, deployment, stage_unlock, system, reminder
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  related_stage internship_stage,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════
-- 14. Announcements (Admin)
-- ══════════════════════════════════════════════════════

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  target_role user_role,   -- null = all roles
  target_course VARCHAR(100),  -- null = all courses
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════
-- 15. At-Risk Flags (auto-computed)
-- ══════════════════════════════════════════════════════

CREATE TABLE at_risk_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  internship_id UUID NOT NULL REFERENCES student_internships(id) ON DELETE CASCADE,
  reason TEXT,
  flagged_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ══════════════════════════════════════════════════════
-- 16. Seed: Default internship config per course
-- ══════════════════════════════════════════════════════

INSERT INTO internship_config (course, course_full_name, required_hours, ojt_subject_code)
VALUES
  ('BSIT',  'Bachelor of Science in Information Technology', 486, 'IT 401'),
  ('BSCS',  'Bachelor of Science in Computer Science',       486, 'CS 401'),
  ('BSIS',  'Bachelor of Science in Information Systems',    400, 'IS 401'),
  ('BSCPE', 'Bachelor of Science in Computer Engineering',   486, 'CPE 401');
