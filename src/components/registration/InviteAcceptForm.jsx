import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../services/supabaseClient';

const inviteSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

const InviteAcceptForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(inviteSchema)
  });

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setMessage({ type: 'error', text: 'Invalid or missing invite token.' });
      setLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const { data, error } = await supabase
        .from('invites')
        .select(`
          *,
          schools(name),
          programs(name)
        `)
        .eq('token', token)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        throw new Error('This invite is invalid, expired, or has already been used.');
      }

      setInviteData(data);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteData.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            role: 'faculty'
          }
        }
      });

      if (authError) throw authError;

      // 2. Create faculty assignment
      const { error: assignError } = await supabase.from('faculty_assignments').insert([{
        user_id: authData.user.id,
        position: inviteData.position,
        school_id: inviteData.school_id,
        program_id: inviteData.program_id
      }]);

      if (assignError) throw assignError;

      // 3. Mark invite as used
      await supabase
        .from('invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', inviteData.id);

      setMessage({ type: 'success', text: 'Account created successfully! You can now log in.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '450px',
      margin: '60px auto',
      padding: '40px',
      borderRadius: '30px',
      background: 'linear-gradient(145deg, #ffffff, #f3f4f6)',
      boxShadow: '20px 20px 60px #d1d5db, -20px -20px 60px #ffffff',
      fontFamily: '"Inter", sans-serif',
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
    },
    title: {
      fontSize: '26px',
      fontWeight: '900',
      color: '#111827',
      marginBottom: '10px',
    },
    badge: {
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '20px',
      backgroundColor: '#ede9fe',
      color: '#5b21b6',
      fontSize: '12px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    contextBox: {
      padding: '20px',
      borderRadius: '16px',
      backgroundColor: '#f9fafb',
      border: '1px dashed #d1d5db',
      marginBottom: '30px',
    },
    contextLabel: {
      fontSize: '11px',
      color: '#6b7280',
      textTransform: 'uppercase',
      fontWeight: 'bold',
      marginBottom: '4px',
    },
    contextValue: {
      fontSize: '16px',
      color: '#1f2937',
      fontWeight: '600',
    },
    input: {
      width: '100%',
      padding: '14px',
      borderRadius: '12px',
      border: '1px solid #d1d5db',
      fontSize: '15px',
      marginBottom: '4px',
      boxSizing: 'border-box',
    },
    button: {
      width: '100%',
      padding: '16px',
      borderRadius: '12px',
      border: 'none',
      backgroundColor: '#4f46e5',
      color: 'white',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '20px',
      boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Validating Invite...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.badge}>Faculty Invitation</div>
        <h2 style={styles.title}>Complete Your Profile</h2>
      </div>

      {message.text && (
        <div style={{ 
          padding: '15px', 
          borderRadius: '12px', 
          marginBottom: '25px', 
          backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {message.text}
        </div>
      )}

      {inviteData && (
        <>
          <div style={styles.contextBox}>
            <div style={{ marginBottom: '15px' }}>
              <div style={styles.contextLabel}>Position</div>
              <div style={styles.contextValue}>{inviteData.position}</div>
            </div>
            <div>
              <div style={styles.contextLabel}>Assigned To</div>
              <div style={styles.contextValue}>
                {inviteData.programs?.name || inviteData.schools?.name}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Full Name</label>
              <input {...register('full_name')} style={styles.input} />
              {errors.full_name && <p style={{ color: 'red', fontSize: '12px' }}>{errors.full_name.message}</p>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Set Password</label>
              <input type="password" {...register('password')} style={styles.input} />
              {errors.password && <p style={{ color: 'red', fontSize: '12px' }}>{errors.password.message}</p>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Confirm Password</label>
              <input type="password" {...register('confirm_password')} style={styles.input} />
              {errors.confirm_password && <p style={{ color: 'red', fontSize: '12px' }}>{errors.confirm_password.message}</p>}
            </div>

            <button type="submit" disabled={submitting} style={{ ...styles.button, opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Creating Account...' : 'Finish Setup'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default InviteAcceptForm;
