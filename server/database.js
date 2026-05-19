import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY must be set in environment variables');
}

if (!serviceKey) {
    console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY is missing. Admin features will fail.');
} else {
    console.log('Service Role Key loaded successfully.');
}

// Client for general use
export const supabase = createClient(url, key);

// Admin client for user management
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
