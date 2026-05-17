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

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Helper: Log Security Events
const logEvent = async (req, { action, type, affectedRecord, userId, userName, userRole, metadata = {} }) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        await supabaseAdmin
            .from('audit_logs')
            .insert({
                user_id: userId,
                user_name: userName,
                user_role: userRole,
                action,
                type,
                affected_record: affectedRecord,
                ip_address: ip,
                metadata
            });
    } catch (err) {
        console.error('Failed to log audit event:', err.message);
    }
};

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

// Admin Route: Get User Email
app.get('/admin/user-email/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabaseAdmin.auth.admin.getUserById(id);
        if (error) throw error;
        res.json({ email: data.user.email });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin Route: Get All User Emails
app.get('/api/admin/users-emails', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error) throw error;
        const emails = {};
        data.users.forEach(u => {
            emails[u.id] = u.email;
        });
        res.json({ emails });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Alias without /api just in case
app.get('/admin/users-emails', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error) throw error;
        const emails = {};
        data.users.forEach(u => {
            emails[u.id] = u.email;
        });
        res.json({ emails });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin Route: Create Student Account
app.post('/admin/create-student', async (req, res) => {
    const { 
        email, 
        firstName, 
        lastName, 
        studentId, 
        course, 
        program_id,
        year_level, 
        academic_year, 
        semester, 
        ojt_subject_name, 
        ojtHeadId, 
        password 
    } = req.body;

    if (!email || !firstName || !lastName || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { 
                first_name: firstName, 
                last_name: lastName,
                role: 'student',
                is_first_login: true
            }
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
                role: 'student',
                program_id: program_id
            });

        if (userError) throw userError;

        // 3. Create entry in 'student_profiles' table
        const { error: profileError } = await supabaseAdmin
            .from('student_profiles')
            .insert({
                id: userId,
                student_id: studentId,
                program_id: program_id,
                year_level: year_level,
                academic_year: academic_year,
                semester: semester,
                ojt_subject_name: ojt_subject_name,
                section_id: req.body.section_id // Save the section association
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

        if (internshipError) console.log('Failed to init internship:', internshipError.message);

        // Fetch OJT Adviser name for logging
        const { data: headData } = await supabaseAdmin
            .from('users')
            .select('first_name, last_name')
            .eq('id', ojtHeadId)
            .single();

        // Log the event
        await logEvent(req, {
            action: 'Created Student Account',
            type: 'Create',
            affectedRecord: `Student: ${email} (${course})`,
            userId: ojtHeadId,
            userName: headData ? `${headData.first_name} ${headData.last_name}` : 'Unknown OJT Adviser',
            userRole: 'ojt_head'
        });

        res.json({
            success: true,
            userId,
            message: 'Student account created successfully.'
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
        
        // Log the event
        await logEvent(req, {
            action: 'Initial Admin Setup',
            type: 'Security',
            affectedRecord: `Admin: ${email}`,
            userId,
            userName: `${firstName} ${lastName}`,
            userRole: 'admin'
        });

        res.json({ success: true, message: 'Admin account created successfully.' });

    } catch (error) {
        console.error('Admin Setup error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin Route: Create OJT Adviser (Professor) Account
app.post('/admin/create-ojt-head', async (req, res) => {
    const { firstName, lastName, email, assignedCourse, programId } = req.body;

    if (!firstName || !lastName || !email || !assignedCourse) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('OJT Adviser Creation started for:', email);
    try {
        // 1. Invite user via Supabase Auth (This sends the invitation email)
        console.log('1. Sending Supabase invitation...');
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: { 
                first_name: firstName, 
                last_name: lastName,
                role: 'ojt_head',
                assigned_course: assignedCourse,
                program_id: programId
            },
            redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/setup-account`
        });

        if (authError) {
            console.error('Invitation failed:', authError.message);
            throw authError;
        }
        console.log('Invitation sent successfully:', authData.user.id);

        const userId = authData.user.id;

        // 2. Create entry in 'users' table (including assigned_course)
        console.log('2. Inserting into "users" table...');
        const { error: userError } = await supabaseAdmin
            .from('users')
            .insert({
                id: userId,
                first_name: firstName,
                last_name: lastName,
                role: 'ojt_head',
                program_id: programId
            });

        if (userError) {
            console.error('Users table insertion failed:', userError.message);
            throw userError;
        }

        // 3. Insert section assignments if provided
        const { sectionIds } = req.body;
        if (sectionIds && Array.isArray(sectionIds) && sectionIds.length > 0) {
            console.log('3. Inserting professor section assignments...');
            const sectionInserts = sectionIds.map(sid => ({
                professor_id: userId,
                section_id: sid
            }));
            const { error: sectionError } = await supabaseAdmin
                .from('professor_sections')
                .insert(sectionInserts);
            
            if (sectionError) console.error('Failed to assign sections:', sectionError.message);
        }

        console.log('OJT Adviser creation complete.');

        // Log the event
        await logEvent(req, {
            action: 'Created OJT Adviser Account',
            type: 'Create',
            affectedRecord: `OJT Adviser: ${email} (${assignedCourse})`,
            userId: userId,
            userName: `${firstName} ${lastName}`,
            userRole: 'ojt_head'
        });

        res.json({ success: true, message: 'Invitation sent to ' + email });

    } catch (error) {
        console.error('OJT Adviser Setup error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin Route: Update Professor Sections
app.post('/admin/update-professor-sections', async (req, res) => {
    const { professorId, sectionIds } = req.body;

    if (!professorId || !Array.isArray(sectionIds)) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Remove existing assignments
        await supabaseAdmin
            .from('professor_sections')
            .delete()
            .eq('professor_id', professorId);

        // 2. Insert new assignments
        if (sectionIds.length > 0) {
            const sectionInserts = sectionIds.map(sid => ({
                professor_id: professorId,
                section_id: sid
            }));
            const { error } = await supabaseAdmin
                .from('professor_sections')
                .insert(sectionInserts);
            if (error) throw error;
        }

        res.json({ success: true, message: 'Sections updated successfully' });
    } catch (error) {
        console.error('Update sections error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Student Route: Sync Checklist (Runs with Admin/Service Role privileges to bypass student RLS limitations)
app.post(['/api/student/sync-checklist', '/student/sync-checklist'], async (req, res) => {
    const { internshipId, programId } = req.body;
    
    if (!internshipId || !programId) {
        return res.status(400).json({ error: 'Missing required parameters: internshipId, programId' });
    }

    try {
        console.log(`[Sync Backend] Syncing internship checklist for internshipId: ${internshipId}, programId: ${programId}`);

        // 1. Get master documents for the program
        const { data: masterDocs, error: masterError } = await supabaseAdmin
            .from('program_required_documents')
            .select('document_name')
            .eq('program_id', programId);

        if (masterError) throw masterError;
        const currentProgramDocs = masterDocs || [];

        // 2. Get existing documents for the student
        const { data: existingDocs, error: existingError } = await supabaseAdmin
            .from('pre_internship_documents')
            .select('document_name')
            .eq('internship_id', internshipId);

        if (existingError) throw existingError;
        const existingNames = new Set((existingDocs || []).map(d => d.document_name));

        // 3. Filter out documents already in the student's checklist
        const newDocs = currentProgramDocs
            .filter(md => !existingNames.has(md.document_name))
            .map(md => ({
                internship_id: internshipId,
                document_name: md.document_name,
                status: 'NOT_SUBMITTED'
            }));

        // 4. Find program documents that are no longer in this program's required list
        // To protect custom professor-added student requirements, we only delete documents
        // that are known program-level documents (either in program_required_documents for SOME program
        // or are one of the system-wide default document templates).
        const { data: allMasterDocs, error: allMasterError } = await supabaseAdmin
            .from('program_required_documents')
            .select('document_name');

        if (allMasterError) throw allMasterError;

        const defaultDocs = [
            'Resume / CV',
            'Medical Certificate',
            'Parental Consent Form',
            'Endorsement Letter',
            'Acceptance Letter / Company Confirmation',
            'Insurance / HMO Card'
        ];

        const allMasterNames = new Set([
            ...defaultDocs,
            ...(allMasterDocs || []).map(d => d.document_name)
        ]);

        const currentProgramNames = new Set(currentProgramDocs.map(d => d.document_name));

        const docsToRemove = (existingDocs || [])
            .filter(ed => !currentProgramNames.has(ed.document_name) && allMasterNames.has(ed.document_name))
            .map(ed => ed.document_name);

        console.log('[Sync Backend] Docs to add:', newDocs.map(d => d.document_name));
        console.log('[Sync Backend] Docs to remove:', docsToRemove);

        // 5. Batch delete unassigned program documents from this student's checklist
        if (docsToRemove.length > 0) {
            const { error: deleteError } = await supabaseAdmin
                .from('pre_internship_documents')
                .delete()
                .eq('internship_id', internshipId)
                .in('document_name', docsToRemove);

            if (deleteError) throw deleteError;
        }

        // 6. Batch insert into pre_internship_documents
        let insertedData = [];
        if (newDocs.length > 0) {
            const { data, error: insertError } = await supabaseAdmin
                .from('pre_internship_documents')
                .insert(newDocs)
                .select();

            if (insertError) throw insertError;
            insertedData = data || [];
        }

        res.json({
            success: true,
            insertedCount: newDocs.length,
            deletedCount: docsToRemove.length,
            insertedData
        });

    } catch (error) {
        console.error('[Sync Backend] Critical error during sync:', error);
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
