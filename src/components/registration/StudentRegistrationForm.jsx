import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../services/supabaseClient';

const studentSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string(),
  student_id: z.string().min(5, 'Student ID is required'),
  course: z.string().min(1, 'Course is required'),
  year_level: z.string().default('4th Year'),
  academic_year: z.string().min(1, 'Academic year is required'),
  semester: z.string().min(1, 'Please select a semester'),
  ojt_subject_name: z.string().min(1, 'Please select an OJT subject'),
  contact_number: z.string().min(10, 'Valid contact number is required'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

const StudentRegistrationForm = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeAY, setActiveAY] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      year_level: '4th Year'
    }
  });

  useEffect(() => {
    fetchActiveAY();
  }, []);

  const fetchActiveAY = async () => {
    const { data } = await supabase
      .from('academic_years')
      .select('year_range')
      .eq('is_active', true)
      .single();
    
    if (data) {
      setActiveAY(data.year_range);
      setValue('academic_year', data.year_range);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const names = data.full_name.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || '';

      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            first_name: firstName,
            last_name: lastName,
            role: 'student',
            is_first_login: false // Registering users set their own password
          }
        }
      });

      if (authError) throw authError;

      // 2. Insert into users table
      const { error: userError } = await supabase.from('users').insert([{
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        role: 'student',
        assigned_course: data.course,
        is_first_login: false
      }]);

      if (userError) throw userError;

      // 3. Insert into student_profiles table
      const { error: studentError } = await supabase.from('student_profiles').insert([{
        id: authData.user.id,
        student_id: data.student_id,
        course: data.course,
        year_level: data.year_level,
        academic_year: data.academic_year,
        semester: data.semester,
        ojt_subject_name: data.ojt_subject_name
      }]);

      if (studentError) throw studentError;

      // 4. Initialize internship
      await supabase.from('student_internships').insert([{
        student_id: authData.user.id,
        current_stage: 'PRE_INTERNSHIP'
      }]);

      setMessage({ type: 'success', text: 'Registration successful! You can now log in.' });
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Inline styles for Rich Aesthetics
  const styles = {
    container: {
      maxWidth: '500px',
      margin: '40px auto',
      padding: '40px',
      borderRadius: '24px',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,255,255,0.5)',
      fontFamily: '"Inter", system-ui, sans-serif',
    },
    title: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#1a1a1a',
      marginBottom: '8px',
      textAlign: 'center',
      background: 'linear-gradient(45deg, #4F46E5, #9333EA)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    subtitle: {
      fontSize: '14px',
      color: '#666',
      textAlign: 'center',
      marginBottom: '32px',
    },
    inputGroup: {
      marginBottom: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#444',
      marginLeft: '4px',
    },
    input: {
      padding: '12px 16px',
      borderRadius: '12px',
      border: '1px solid #e0e0e0',
      fontSize: '15px',
      outline: 'none',
      transition: 'all 0.2s ease',
      backgroundColor: '#f9fafb',
    },
    error: {
      fontSize: '12px',
      color: '#ef4444',
      marginLeft: '4px',
    },
    button: {
      width: '100%',
      padding: '14px',
      borderRadius: '12px',
      border: 'none',
      background: 'linear-gradient(45deg, #4F46E5, #7C3AED)',
      color: 'white',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      marginTop: '12px',
      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
    },
    message: {
      padding: '12px',
      borderRadius: '12px',
      marginBottom: '20px',
      fontSize: '14px',
      textAlign: 'center',
    },
    successMessage: {
      backgroundColor: '#ecfdf5',
      color: '#059669',
      border: '1px solid #10b981',
    },
    errorMessage: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #ef4444',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Student Registration</h2>
      <p style={styles.subtitle}>Join InternLink to start your OJT journey</p>

      {message.text && (
        <div style={{ ...styles.message, ...(message.type === 'success' ? styles.successMessage : styles.errorMessage) }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name</label>
          <input 
            {...register('full_name')} 
            style={styles.input} 
            placeholder="Juan Dela Cruz"
          />
          {errors.full_name && <span style={styles.error}>{errors.full_name.message}</span>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input 
            {...register('email')} 
            style={styles.input} 
            placeholder="juan.delacruz@nua.edu.ph"
          />
          {errors.email && <span style={styles.error}>{errors.email.message}</span>}
        </div>

        <div style={styles.grid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              {...register('password')} 
              style={styles.input} 
            />
            {errors.password && <span style={styles.error}>{errors.password.message}</span>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input 
              type="password" 
              {...register('confirm_password')} 
              style={styles.input} 
            />
            {errors.confirm_password && <span style={styles.error}>{errors.confirm_password.message}</span>}
          </div>
        </div>

        <div style={styles.grid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Student ID</label>
            <input 
              {...register('student_id')} 
              style={styles.input} 
              placeholder="2021-12345"
            />
            {errors.student_id && <span style={styles.error}>{errors.student_id.message}</span>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contact Number</label>
            <input 
              {...register('contact_number')} 
              style={styles.input} 
              placeholder="09123456789"
            />
            {errors.contact_number && <span style={styles.error}>{errors.contact_number.message}</span>}
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Course</label>
          <input 
            {...register('course')} 
            style={styles.input} 
            placeholder="Bachelor of Science in Information Technology"
          />
          {errors.course && <span style={styles.error}>{errors.course.message}</span>}
        </div>

        <div style={styles.grid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Year Level</label>
            <input 
              {...register('year_level')} 
              style={{ ...styles.input, backgroundColor: '#f1f5f9' }} 
              readOnly 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Academic Year</label>
            <input 
              {...register('academic_year')} 
              style={styles.input} 
              placeholder="2024-2025"
            />
            {errors.academic_year && <span style={styles.error}>{errors.academic_year.message}</span>}
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Semester</label>
          <select {...register('semester')} style={styles.input}>
            <option value="">Select Semester</option>
            <option value="First Semester">First Semester</option>
            <option value="Second Semester">Second Semester</option>
            <option value="Third Semester">Third Semester</option>
          </select>
          {errors.semester && <span style={styles.error}>{errors.semester.message}</span>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>OJT Subject Name</label>
          <select {...register('ojt_subject_name')} style={styles.input}>
            <option value="">Select Subject</option>
            <option value="CCNTERN1">CCNTERN1</option>
            <option value="CCNTERN2">CCNTERN2</option>
          </select>
          {errors.ojt_subject_name && <span style={styles.error}>{errors.ojt_subject_name.message}</span>}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Submitting...' : 'Register as Student'}
        </button>
      </form>
    </div>
  );
};

export default StudentRegistrationForm;
