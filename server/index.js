console.log('--- BACKEND SERVER INITIALIZING ---');
import express from 'express';
import cors from 'cors';
import { supabase, supabaseAdmin } from './database.js';
// import { sendCredentialsEmail, sendAdminWelcomeEmail } from './emailService.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.SERVER_PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// API Routes
app.get('/health', async (req, res) => {
    try {
        if (supabase) {
            res.json({ status: 'healthy', database: 'supabase-connected' });
        } else {
            res.status(500).json({ status: 'unhealthy', error: 'Database client not initialized' });
        }
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

// Admin Route: Create Student Account
app.post('/admin/create-student', async (req, res) => {
    const { email, firstName, lastName, studentId, course, ojtHeadId, password } = req.body;

    if (!email || !firstName || !lastName || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { first_name: firstName, last_name: lastName }
        });

        if (authError) throw authError;

        const userId = authData.user.id;

        // 2. Create entry in 'users' table
        const { error: userError } = await supabaseAdmin
            .from('users')
            .insert({
                id: userId,
                first_name: firstName,
                last_name: lastName,
                role: 'student'
            });

        if (userError) throw userError;

        // 3. Create entry in 'student_profiles' table
        const { error: profileError } = await supabaseAdmin
            .from('student_profiles')
            .insert({
                id: userId,
                student_id: studentId || `S-${Date.now()}`, // Fallback if no student ID provided
                course: course || 'BSIT' // Default course
            });

        if (profileError) throw profileError;

        // 4. Initialize 'student_internships'
        const { error: internshipError } = await supabaseAdmin
            .from('student_internships')
            .insert({
                student_id: userId,
                ojt_head_id: ojtHeadId,
                current_stage: 'PRE_INTERNSHIP'
            });

        if (internshipError) console.warn('Failed to init internship:', internshipError.message);

        // 5. Email notification (Removed nodemailer per user request)
        // const emailResult = await sendCredentialsEmail(email, firstName, password);

        res.json({
            success: true,
            userId,
            message: 'Student account created successfully. (Email notification disabled)'
        });

    } catch (error) {
        console.error('Account creation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin Route: Seed Default Admin (Development Only)
app.post('/admin/seed', async (req, res) => {
    const adminEmail = 'admin@internlink.edu';
    const adminPassword = 'adminpassword123';

    try {
        // Check if admin already exists in auth
        const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
        const adminFound = existingUser.users.find(u => u.email === adminEmail);

        if (adminFound) {
            return res.json({ message: 'Admin account already exists', userId: adminFound.id });
        }

        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: { first_name: 'System', last_name: 'Admin' }
        });

        if (authError) throw authError;

        const userId = authData.user.id;

        // 2. Create entry in 'users' table
        const { error: userError } = await supabaseAdmin
            .from('users')
            .insert({
                id: userId,
                first_name: 'System',
                last_name: 'Admin',
                role: 'admin'
            });

        if (userError) throw userError;

        res.json({ success: true, message: 'Admin account created successfully', email: adminEmail, password: adminPassword });

    } catch (error) {
        console.error('Seed Admin error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin Route: Custom Admin Setup
app.post('/admin/setup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Admin Setup started for:', email);
    try {
        // 1. Create user in Supabase Auth
        console.log('1. Attempting to create Auth user...');
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { first_name: firstName, last_name: lastName }
        });

        if (authError) {
            console.error('Auth creation failed:', authError.message);
            throw authError;
        }
        console.log('Auth user created successfully:', authData.user.id);

        const userId = authData.user.id;

        // 2. Create entry in 'users' table
        console.log('2. Inserting into "users" table...');
        const { error: userError } = await supabaseAdmin
            .from('users')
            .insert({
                id: userId,
                first_name: firstName,
                last_name: lastName,
                role: 'admin'
            });

        if (userError) {
            console.error('Users table insertion failed:', userError.message);
            throw userError;
        }
        console.log('User record created successfully.');

        // Send a confirmation email (Removed nodemailer per user request)
        console.log('3. Skipping email notification (disabled).');
        // await sendAdminWelcomeEmail(email, `${firstName} ${lastName}`);

        console.log('Admin Setup completed successfully.');
        res.json({ success: true, message: 'Admin account created successfully.' });

    } catch (error) {
        console.error('Admin Setup error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve static assets from the React build folder
const buildPath = path.join(__dirname, '../build');
app.use(express.static(buildPath));

// Catch-all route to serve the React app
app.get(/.*/, (req, res) => {
    // Only serve index.html if it's not an API request
    if (!req.url.startsWith('/api')) {
        res.sendFile(path.join(buildPath, 'index.html'));
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
