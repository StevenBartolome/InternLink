import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../services/supabaseClient';

const companySchema = z.object({
  company_name: z.string().min(2, 'Company name is required'),
  industry: z.string().min(2, 'Industry is required'),
  address: z.string().min(5, 'Address is required'),
  contact_person: z.string().min(2, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string(),
  phone: z.string().min(7, 'Valid phone number is required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

const CompanyRegistrationForm = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(companySchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.contact_person, // Store contact person as full_name
            role: 'company',
            contact_number: data.phone
          }
        }
      });

      if (authError) throw authError;

      // 2. Insert into companies table
      const { error: companyError } = await supabase.from('companies').insert([{
        user_id: authData.user.id,
        company_name: data.company_name,
        industry: data.industry,
        address: data.address,
        contact_person: data.contact_person,
        phone: data.phone,
        website: data.website || null,
        status: 'pending_approval'
      }]);

      if (companyError) throw companyError;

      setMessage({ type: 'success', text: 'Registration submitted. Awaiting admin approval.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '40px auto',
      padding: '40px',
      borderRadius: '24px',
      background: '#ffffff',
      boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
      border: '1px solid #f0f0f0',
      fontFamily: '"Outfit", "Inter", sans-serif',
    },
    title: {
      fontSize: '32px',
      fontWeight: '800',
      color: '#1e293b',
      marginBottom: '10px',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: '15px',
      color: '#64748b',
      textAlign: 'center',
      marginBottom: '35px',
    },
    inputGroup: {
      marginBottom: '22px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#475569',
      marginLeft: '2px',
    },
    input: {
      padding: '14px 18px',
      borderRadius: '14px',
      border: '2px solid #f1f5f9',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.2s',
      backgroundColor: '#f8fafc',
    },
    error: {
      fontSize: '12px',
      color: '#e11d48',
      fontWeight: '500',
    },
    button: {
      width: '100%',
      padding: '16px',
      borderRadius: '14px',
      border: 'none',
      background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
      color: 'white',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)',
      marginTop: '15px',
    },
    message: {
      padding: '14px',
      borderRadius: '14px',
      marginBottom: '25px',
      fontSize: '14px',
      textAlign: 'center',
      fontWeight: '600',
    },
    success: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
    errorBox: { background: '#fff1f2', color: '#9f1239', border: '1px solid #fecdd3' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Partner Registration</h2>
      <p style={styles.subtitle}>Partner with us to find top student talent</p>

      {message.text && (
        <div style={{ ...styles.message, ...(message.type === 'success' ? styles.success : styles.errorBox) }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Company Name</label>
          <input {...register('company_name')} style={styles.input} placeholder="Tech Solutions Inc." />
          {errors.company_name && <span style={styles.error}>{errors.company_name.message}</span>}
        </div>

        <div style={styles.row}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Industry</label>
            <input {...register('industry')} style={styles.input} placeholder="Information Technology" />
            {errors.industry && <span style={styles.error}>{errors.industry.message}</span>}
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number</label>
            <input {...register('phone')} style={styles.input} placeholder="+63 912 345 6789" />
            {errors.phone && <span style={styles.error}>{errors.phone.message}</span>}
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Office Address</label>
          <input {...register('address')} style={styles.input} placeholder="123 Business Park, Makati City" />
          {errors.address && <span style={styles.error}>{errors.address.message}</span>}
        </div>

        <div style={styles.row}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Contact Person</label>
            <input {...register('contact_person')} style={styles.input} placeholder="Jane Doe" />
            {errors.contact_person && <span style={styles.error}>{errors.contact_person.message}</span>}
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Website (Optional)</label>
            <input {...register('website')} style={styles.input} placeholder="https://company.com" />
            {errors.website && <span style={styles.error}>{errors.website.message}</span>}
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input {...register('email')} style={styles.input} placeholder="hr@company.com" />
          {errors.email && <span style={styles.error}>{errors.email.message}</span>}
        </div>

        <div style={styles.row}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" {...register('password')} style={styles.input} />
            {errors.password && <span style={styles.error}>{errors.password.message}</span>}
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input type="password" {...register('confirm_password')} style={styles.input} />
            {errors.confirm_password && <span style={styles.error}>{errors.confirm_password.message}</span>}
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Processing...' : 'Register Company'}
        </button>
      </form>
    </div>
  );
};

export default CompanyRegistrationForm;
