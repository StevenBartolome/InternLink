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
        // Step 1: Immediate 'Instant Role' check from metadata
        const metadata = session.user.user_metadata || {};
        const role = metadata.role || session.user.app_metadata?.role;
        
        if (role) {
          // Set a basic user object immediately if we don't have one, 
          // but don't overwrite a fully loaded profile for the same user.
          setUser(prev => {
            if (prev && prev.id === session.user.id && !prev.is_loading_full_profile) {
              return prev;
            }
            const basicUser = {
              ...session.user,
              role,
              first_name: metadata.first_name || '',
              last_name: metadata.last_name || '',
              name: metadata.first_name ? `${metadata.first_name} ${metadata.last_name}` : '',
              program_id: metadata.program_id || '',
              is_first_login: metadata.is_first_login !== undefined ? metadata.is_first_login : false,
              is_loading_full_profile: true
            };
            console.log('[Auth] Setting basic user profile:', {
              id: basicUser.id,
              role: basicUser.role,
              is_first_login: basicUser.is_first_login,
              source: 'metadata'
            });
            return basicUser;
          });
          setLoading(false);
        }

        try {
          // Add a small delay to avoid clashing with internal auth lock
          setTimeout(async () => {
            if (mounted) await fetchProfile(session.user);
          }, 100);
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
    
    // If we're already fetching or have the full profile, don't fetch again
    if (currentFetchPromise.current && currentFetchPromise.current.userId === authUser.id) {
      return currentFetchPromise.current.promise;
    }
    
    if (user?.id === authUser.id && !user?.is_loading_full_profile) {
      console.log('fetchProfile: Profile already loaded, skipping fetch');
      return user;
    }

    const fetchAction = async () => {
      try {
        // Step 1: Fetch base user data to determine role
        // Increased timeout to 40s to allow Supabase wake-up, but prevent infinite hang
        console.log('fetchProfile: Fetching public.users for', authUser.id);
        const { data: baseUser, error: baseError } = await supabase
            .from('users')
            .select('*, programs(id, code, name)')
            .eq('id', authUser.id)
            .single();

        if (baseError) {
          console.error('fetchProfile: Base users fetch error:', baseError);
          throw baseError;
        }

        console.log('fetchProfile: Found base user:', baseUser);

        let specificProfile = {};
        let internshipData = {};

        // Step 2: Fetch role-specific data
        if (baseUser.role === 'student') {
          // Fetch student profile
          console.log('fetchProfile: Fetching student_profiles for', authUser.id);
          const { data: sProfile, error: sError } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();
            
          if (sError) console.error('fetchProfile: student_profiles error:', sError);
          console.log('fetchProfile: student_profiles data:', sProfile);
            
          if (sProfile) {
            specificProfile = sProfile;
            console.log('fetchProfile: Specific profile set to:', specificProfile);
          } else {
            console.warn('fetchProfile: No student_profile found for ID:', authUser.id);
          }

          // Fetch internship data
          const { data: sInternship } = await supabase
            .from('student_internships')
            .select('*')
            .eq('student_id', authUser.id)
            .maybeSingle();
            
          if (sInternship) internshipData = sInternship;
        } else if (baseUser.role === 'ojt_head') {
          // OJT Heads now have all their data in the base users table
          console.log('fetchProfile: Professor detected, program:', baseUser.programs?.code);
          specificProfile = {};
        } else if (baseUser.role === 'admin') {
          // Admins currently only have base user data
          specificProfile = {};
        }

        // Flatten the profile data for easy access
        const userData = {
          ...authUser,
          ...baseUser,
          course_code: baseUser.programs?.code,
          course_name: baseUser.programs?.name,
          name: `${baseUser.first_name} ${baseUser.last_name}`,
          ...internshipData,
          ...specificProfile,
          // Explicitly include internship fields
          internship_id: internshipData?.id,
          // Ensure we don't overwrite user ID with join IDs if they differ
          id: authUser.id,
          is_loading_full_profile: false
        };

        setUser(userData);
        console.log('[Auth] Full profile loaded:', {
          id: userData.id,
          role: userData.role,
          is_first_login: userData.is_first_login,
          source: 'database'
        });
        return userData;
      } catch (err) {
        console.error('CRITICAL: Error in fetchProfile:', err);
        if (user) {
          setUser(prev => ({ ...prev, is_loading_full_profile: false }));
        }
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

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

      // AUTO-CLEAR FIRST LOGIN FLAG FOR NON-STUDENTS
      // Students have their flag cleared in SetupAccount.jsx after password change
      if (fullProfile.is_first_login && fullProfile.role !== 'student') {
        await supabase.from('users').update({ is_first_login: false }).eq('id', data.user.id);
        // Also sync to Auth Metadata
        await supabase.auth.updateUser({ data: { is_first_login: false } });
        fullProfile.is_first_login = false;
      }

      return { success: true, user: fullProfile };
    } catch (err) {
      console.error('Unexpected error during login:', err.message);
      return { success: false, error: "An unexpected error occurred. Please try again." };
    }
  };

  const logout = async () => {
    // 1. CLEAR STATE IMMEDIATELY (Synchronous)
    // This ensures the UI updates and ProtectedRoutes kick the user out instantly
    currentFetchPromise.current = null;
    setUser(null);

    try {
      // 2. Clear Supabase storage manually as a backup
      // This ensures that even if signOut() fails, the session is gone from the browser
      const storageKey = `sb-${new URL(process.env.REACT_APP_SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
      localStorage.removeItem(storageKey);
      
      // 3. Fire and forget the server-side sign out
      // We don't await this because if the network is slow, it blocks the UI
      supabase.auth.signOut().catch(err => console.error('SignOut background error:', err));
      
      console.log('User logout initiated and local state cleared.');
    } catch (err) {
      console.error('Logout cleanup error:', err);
    }
  };

  const updateUser = async (updates) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (!error) {
        // Sync to Auth Metadata if relevant fields are updated
        const metadataUpdates = {};
        if (updates.is_first_login !== undefined) metadataUpdates.is_first_login = updates.is_first_login;
        if (updates.first_name) metadataUpdates.first_name = updates.first_name;
        if (updates.last_name) metadataUpdates.last_name = updates.last_name;
        
        if (Object.keys(metadataUpdates).length > 0) {
          await supabase.auth.updateUser({ data: metadataUpdates });
        }

        setUser(prev => ({ ...prev, ...updates }));
      }
      return { error };
    } catch (err) {
      console.error('updateUser error:', err);
      return { error: err };
    }
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
          program_id: studentData.programId || studentData.program_id,
          year_level: studentData.yearLevel || studentData.year_level,
          academic_year: studentData.academicYear || studentData.academic_year,
          semester: studentData.semester,
          ojt_subject_name: studentData.ojtSubjectName || studentData.ojt_subject_name
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
