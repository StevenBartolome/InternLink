-- Migration: 05_permissions.sql
-- Description: Sets up Row Level Security (RLS) and Grants for departments, programs, and user profiles

-- 1. Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_internships ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies for Departments
DROP POLICY IF EXISTS "Allow public read access for departments" ON departments;
CREATE POLICY "Allow public read access for departments" 
ON departments FOR SELECT 
TO public 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage departments" ON departments;
CREATE POLICY "Allow authenticated users to manage departments" 
ON departments FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 3. Create Policies for Programs
DROP POLICY IF EXISTS "Allow public read access for programs" ON programs;
CREATE POLICY "Allow public read access for programs" 
ON programs FOR SELECT 
TO public 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage programs" ON programs;
CREATE POLICY "Allow authenticated users to manage programs" 
ON programs FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 4. Policies for Users
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON users;
CREATE POLICY "Allow authenticated users to read users" 
ON users FOR SELECT 
TO authenticated 
USING (true);

-- 5. Policies for Student Profiles
DROP POLICY IF EXISTS "Allow authenticated users to read student profiles" ON student_profiles;
CREATE POLICY "Allow authenticated users to read student profiles" 
ON student_profiles FOR SELECT 
TO authenticated 
USING (true);

-- 6. Policies for Student Internships
DROP POLICY IF EXISTS "Allow authenticated users to read student internships" ON student_internships;
CREATE POLICY "Allow authenticated users to read student internships" 
ON student_internships FOR SELECT 
TO authenticated 
USING (true);

-- 7. Grant schema usage and table permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
