// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Listen for auth changes (login, logout, sign in, and initial session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session) {
        try {
          await fetchProfile(session.user);
        } catch (err) {
          console.error('Auth state change profile fetch failed:', err);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Use a ref to track the current profile fetch to avoid race conditions across renders
  const currentFetchPromise = React.useRef(null);

  // Helper for timeouts
  const withTimeout = (promise, ms, errorMessage = 'Request timed out') => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(errorMessage)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
  };

  // Helper to fetch profile data from our custom tables
  const fetchProfile = async (authUser) => {
    if (!authUser) return null;
    
    // If we're already fetching this user's profile, return the existing promise
    if (currentFetchPromise.current && currentFetchPromise.current.userId === authUser.id) {
      console.log('fetchProfile: Returning existing promise for user:', authUser.id);
      return currentFetchPromise.current.promise;
    }

    const fetchAction = async () => {
      try {
        // Step 1: Fetch base user data to determine role
        const { data: baseUser, error: baseError } = await withTimeout(
          supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single(),
          8000,
          'Base profile fetch timed out'
        );

        if (baseError) {
          if (baseError.code === 'PGRST116') {
            console.warn('No profile found in "users" table for auth user');
          } else {
            console.error('Database error fetching base profile:', baseError.message);
          }
          throw baseError;
        }

        let specificProfile = {};
        let internshipData = {};

        // Step 2: Fetch role-specific data
        if (baseUser.role === 'student') {
          // Fetch student profile
          const { data: sProfile } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle(); // Use maybeSingle to not throw if missing
            
          if (sProfile) specificProfile = sProfile;

          // Fetch internship data
          const { data: sInternship } = await supabase
            .from('student_internships')
            .select('*')
            .eq('student_id', authUser.id)
            .maybeSingle();
            
          if (sInternship) internshipData = sInternship;
        } else if (baseUser.role === 'ojt_head') {
          const { data: oProfile } = await supabase
            .from('ojt_head_profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();
            
          if (oProfile) specificProfile = oProfile;
        }

        // Flatten the profile data for easy access
        const userData = {
          ...authUser,
          ...baseUser,
          name: `${baseUser.first_name} ${baseUser.last_name}`,
          ...specificProfile,
          // Explicitly include internship fields
          ...internshipData,
          internship_id: internshipData?.id,
          // Ensure we don't overwrite user ID with join IDs if they differ
          id: authUser.id 
        };

        setUser(userData);
        return userData;
      } catch (err) {
        console.error('Error in fetchProfile:', err.message);
        return null;
      } finally {
        currentFetchPromise.current = null;
      }
    };

    currentFetchPromise.current = {
      userId: authUser.id,
      promise: fetchAction()
    };

    console.log('fetchProfile: Started new fetch promise for', authUser.id);
    return currentFetchPromise.current.promise;
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        8000,
        'Sign in request timed out after 8 seconds'
      );

      console.log('signInWithPassword completed:', { 
        hasError: !!error, 
        userId: data?.user?.id 
      });

      if (error) {
        console.error('Login error:', error.message);
        return { success: false, error: error.message };
      }
      
      // Fetch profile immediately to ensure role-based logic works in callers
      const fullProfile = await fetchProfile(data.user);
      
      if (!fullProfile) {
        console.error('Login failed: Profile not found for auth user', data.user.id);
        return { 
          success: false, 
          error: "Your account exists but your profile was not found. Please register again or contact support." 
        };
      }

      if (fullProfile.is_active === false) {
        await logout();
        return { success: false, error: "Your account is deactivated. Please contact the administrator." };
      }

      console.log('Login successful for:', fullProfile.name, 'Role:', fullProfile.role);
      return { success: true, user: fullProfile };
    } catch (err) {
      console.error('Unexpected error during login:', err.message);
      return { success: false, error: "An unexpected error occurred. Please try again." };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = async (updates) => {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      setUser(prev => ({ ...prev, ...updates }));
    }
    return { error };
  };

  const registerStudent = async (studentData, password) => {
    try {
      console.log('Starting registration for:', studentData.email);
      // 1. Sign up user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: studentData.email,
        password: password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Registration failed: No user returned from Auth');

      console.log('Auth user created:', authData.user.id);

      // 2. Create entry in 'users' table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          first_name: studentData.firstName,
          last_name: studentData.lastName,
          role: 'student'
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError.message);
        throw new Error('Failed to create user profile: ' + profileError.message);
      }

      // 3. Create entry in 'student_profiles' table (COR details)
      const { error: studError } = await supabase
        .from('student_profiles')
        .insert({
          id: authData.user.id,
          student_id: studentData.studentId,
          course: studentData.course,
          course_full_name: studentData.courseFullName,
          year_level: studentData.yearLevel,
          academic_year: studentData.academicYear,
          semester: studentData.semester,
          ojt_subject_name: studentData.ojtSubjectName
        });

      if (studError) {
        console.error('Error creating student profile:', studError.message);
        throw new Error('Failed to create student details: ' + studError.message);
      }

      // 4. Initialize empty internship record for Stage 1
      const { error: internshipError } = await supabase
        .from('student_internships')
        .insert({
          student_id: authData.user.id,
          current_stage: 'PRE_INTERNSHIP'
        });

      if (internshipError) {
        console.warn('Warning: Failed to initialize internship record:', internshipError.message);
        // We don't throw here to avoid failing the whole registration, 
        // but it's better if we do or handle it in the dashboard.
      }

      console.log('Registration complete for:', authData.user.id);
      return { success: true, user: authData.user };
    } catch (err) {
      console.error('Registration Error:', err.message);
      return { success: false, error: err.message };
    }
  };

  const createStudentAccount = async (studentData) => {
    try {
      const response = await fetch('/api/admin/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...studentData,
          ojtHeadId: user.id // The current logged-in OJT Head
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create student account');
      
      return { success: true, ...data };
    } catch (err) {
      console.error('Create Student Error:', err.message);
      return { success: false, error: err.message };
    }
  };

  const bulkCreateStudentAccounts = async (students) => {
    const results = { success: [], failed: [] };
    
    // We process sequentially to avoid overwhelming the API/Email service
    for (const student of students) {
      const password = student.password || Math.random().toString(36).slice(-10);
      const res = await createStudentAccount({ ...student, password });
      
      if (res.success) {
        results.success.push({ email: student.email, name: `${student.firstName} ${student.lastName}` });
      } else {
        results.failed.push({ email: student.email, error: res.error });
      }
    }
    
    return results;
  };

  const seedAdmin = async () => {
    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        return { success: response.ok, ...data };
      } else {
        const text = await response.text();
        return { 
          success: response.ok, 
          message: response.ok ? 'Admin seeded successfully' : (text.slice(0, 100) || 'Server error') 
        };
      }
    } catch (err) {
      console.error('Seed Admin Error:', err.message);
      return { success: false, error: 'Network error or server is down' };
    }
  };

  const setupAdmin = async (adminData) => {
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        return { success: response.ok, ...data };
      } else {
        const text = await response.text();
        // If it's a 504 or other HTML error, don't try to parse as JSON
        return { 
          success: response.ok, 
          error: response.ok ? null : `Server error: ${response.status}. The server might be taking too long or is unavailable.`
        };
      }
    } catch (err) {
      console.error('Setup Admin Error:', err.message);
      return { success: false, error: 'Network error: Could not reach the server.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, registerStudent, createStudentAccount, bulkCreateStudentAccounts, seedAdmin, setupAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
