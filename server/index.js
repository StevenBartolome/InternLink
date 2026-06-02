console.log('--- BACKEND SERVER INITIALIZING ---');
import express from 'express';
import cors from 'cors';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
import { supabase, supabaseAdmin } from './database.js';
import { sendCredentialsEmail, sendAdminWelcomeEmail, sendAttendanceReminderEmail } from './emailService.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.SERVER_PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

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
                program_id: programId,
                is_first_login: true
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
                program_id: programId,
                is_first_login: true
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

// Admin Route: Toggle User Status
app.post(['/api/admin/toggle-user-status', '/admin/toggle-user-status'], async (req, res) => {
    const { userId, isActive } = req.body;
    if (!userId || isActive === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const { error } = await supabaseAdmin.from('users').update({ is_active: isActive }).eq('id', userId);
        if (error) throw error;
        res.json({ success: true, message: 'Status updated' });
    } catch (error) {
        console.error('Toggle status error:', error);
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

// Admin Route: Update Student Details
app.post(['/api/admin/update-student', '/admin/update-student'], async (req, res) => {
    const { 
        id, 
        firstName, 
        lastName, 
        studentId, 
        programId, 
        sectionId, 
        currentStage 
    } = req.body;

    if (!id || !firstName || !lastName || !studentId) {
        return res.status(400).json({ error: 'Missing required fields: id, firstName, lastName, studentId' });
    }

    try {
        console.log(`[Backend] Updating student ${id} (${studentId})`);

        // 1. Update basic info in users table
        const { error: userError } = await supabaseAdmin
            .from('users')
            .update({ 
                first_name: firstName, 
                last_name: lastName,
                program_id: programId || null,
                section_id: sectionId || null
            })
            .eq('id', id);
      
        if (userError) throw userError;

        // 2. Upsert student_profiles
        const { error: profileError } = await supabaseAdmin
            .from('student_profiles')
            .upsert({
                id: id,
                student_id: studentId,
                program_id: programId || null,
                section_id: sectionId || null
            });

        if (profileError) throw profileError;

        // 3. Upsert student_internships
        const { error: internshipError } = await supabaseAdmin
            .from('student_internships')
            .upsert({
                student_id: id,
                current_stage: currentStage
            }, { onConflict: 'student_id' });

        if (internshipError) throw internshipError;

        // 4. Update Auth User Metadata so it is instantly synced on their next interaction/session
        await supabaseAdmin.auth.admin.updateUserById(id, {
            user_metadata: {
                first_name: firstName,
                last_name: lastName
            }
        });

        res.json({ success: true, message: 'Student details updated successfully.' });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin Route: Update OJT Adviser Details
app.post(['/api/admin/update-ojt-head', '/admin/update-ojt-head'], async (req, res) => {
    const { 
        id, 
        firstName, 
        lastName, 
        programId, 
        sectionIds 
    } = req.body;

    if (!id || !firstName || !lastName) {
        return res.status(400).json({ error: 'Missing required fields: id, firstName, lastName' });
    }

    try {
        console.log(`[Backend] Updating OJT Adviser ${id}`);

        // 1. Update basic info in users table
        const { error: userError } = await supabaseAdmin
            .from('users')
            .update({
                first_name: firstName,
                last_name: lastName,
                program_id: programId || null
            })
            .eq('id', id);

        if (userError) throw userError;

        // 2. Remove existing section assignments
        await supabaseAdmin
            .from('professor_sections')
            .delete()
            .eq('professor_id', id);

        // 3. Insert new section assignments
        if (sectionIds && sectionIds.length > 0) {
            const sectionInserts = sectionIds.map(sid => ({
                professor_id: id,
                section_id: sid
            }));
            const { error: sectionError } = await supabaseAdmin
                .from('professor_sections')
                .insert(sectionInserts);
            if (sectionError) throw sectionError;
        }

        // 4. Update Auth User Metadata
        await supabaseAdmin.auth.admin.updateUserById(id, {
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
                program_id: programId
            }
        });

        res.json({ success: true, message: 'OJT Adviser details updated successfully.' });
    } catch (error) {
        console.error('Update OJT Adviser error:', error);
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

        // 0. Check if student is already deployed or beyond pre-internship
        const { data: internship, error: internFetchError } = await supabaseAdmin
            .from('student_internships')
            .select('current_stage, is_deployed')
            .eq('id', internshipId)
            .maybeSingle();

        if (internFetchError) throw internFetchError;

        if (internship && (internship.is_deployed || internship.current_stage !== 'PRE_INTERNSHIP')) {
            console.log(`[Sync Backend] Student ${internshipId} is already deployed or beyond pre-internship. Freezing checklist sync.`);
            return res.json({ 
                success: true, 
                message: 'Checklist is frozen for deployed students.', 
                insertedCount: 0 
            });
        }

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

        const allMasterNames = new Set((allMasterDocs || []).map(d => d.document_name));

        const currentProgramNames = new Set(currentProgramDocs.map(d => d.document_name));

        const docsToRemove = (existingDocs || [])
            .filter(ed => !currentProgramNames.has(ed.document_name))
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

// Professor Route: Approve Deployment (Bypasses RLS using Admin client)
app.post(['/api/professor/approve-deployment', '/professor/approve-deployment'], async (req, res) => {
    const { internshipId } = req.body;
    
    if (!internshipId) {
        return res.status(400).json({ error: 'Missing required parameter: internshipId' });
    }

    try {
        console.log(`[Deploy Backend] Approving deployment for internshipId: ${internshipId}`);

        const { data, error } = await supabaseAdmin
            .from('student_internships')
            .update({
                is_deployed: true,
                current_stage: 'DURING_INTERNSHIP',
                updated_at: new Date().toISOString()
            })
            .eq('id', internshipId)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Internship record not found or not updated' });
        }

        res.json({
            success: true,
            data: data[0]
        });

    } catch (error) {
        console.error('[Deploy Backend] Critical error during deployment approval:', error);
        res.status(500).json({ error: error.message });
    }
});

// Server Route: Upload Signed MOA (Bypasses Storage RLS using supabaseAdmin)
app.post(['/api/professor/upload-signed-moa', '/professor/upload-signed-moa'], async (req, res) => {
    const { internshipId, fileName, fileBase64, reviewerId } = req.body;
    
    if (!internshipId || !fileName || !fileBase64) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        console.log(`[Upload Server] Uploading signed MOA for internshipId: ${internshipId}`);
        
        // 1. Decode base64 file content
        const fileBuffer = Buffer.from(fileBase64, 'base64');
        const filePath = `pre-internship/${fileName}`;

        // 2. Upload to Supabase Storage using Admin client (bypasses RLS)
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('documents')
            .upload(filePath, fileBuffer, {
                contentType: 'application/pdf',
                upsert: true
            });

        if (uploadError) throw uploadError;

        // 3. Get Public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('documents')
            .getPublicUrl(filePath);

        // 4. Update or insert pre_internship_documents
        const { data: existingDocs, error: fetchError } = await supabaseAdmin
            .from('pre_internship_documents')
            .select('*')
            .eq('internship_id', internshipId);

        if (fetchError) throw fetchError;

        const moaDoc = (existingDocs || []).find(d => 
            d.document_name.toLowerCase().includes('moa') || 
            d.document_name.toLowerCase().includes('memorandum of agreement')
        );

        let docRecord;
        if (moaDoc) {
            const { data, error } = await supabaseAdmin
                .from('pre_internship_documents')
                .update({
                    file_url: publicUrl,
                    status: 'APPROVED',
                    submitted_at: new Date().toISOString(),
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: reviewerId,
                    reviewer_comment: 'MOA signed and uploaded by OJT Adviser.'
                })
                .eq('id', moaDoc.id)
                .select();

            if (error) throw error;
            docRecord = data[0];
        } else {
            const { data, error } = await supabaseAdmin
                .from('pre_internship_documents')
                .insert({
                    internship_id: internshipId,
                    document_name: 'Memorandum of Agreement (MOA)',
                    file_url: publicUrl,
                    status: 'APPROVED',
                    submitted_at: new Date().toISOString(),
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: reviewerId,
                    reviewer_comment: 'MOA signed and uploaded by OJT Adviser.'
                })
                .select();

            if (error) throw error;
            docRecord = data[0];
        }

        // 5. Update internship MOA status to PROCESSED
        await supabaseAdmin
            .from('student_internships')
            .update({ moa_status: 'PROCESSED', updated_at: new Date().toISOString() })
            .eq('id', internshipId);

        // 6. Save to student_moas database table
        const { data: studentInfo } = await supabaseAdmin
            .from('student_internships')
            .select('student_id')
            .eq('id', internshipId)
            .single();
        
        if (studentInfo) {
            await supabaseAdmin
                .from('student_moas')
                .upsert({
                    internship_id: internshipId,
                    student_id: studentInfo.student_id,
                    file_url: publicUrl,
                    uploaded_by: reviewerId,
                    uploaded_at: new Date().toISOString()
                }, { onConflict: 'internship_id' });
        }

        res.json({
            success: true,
            publicUrl,
            docRecord
        });

    } catch (error) {
        console.error('[Upload Server] Critical error during MOA upload:', error);
        res.status(500).json({ error: error.message });
    }
});

// Server Route: Unsubmit/Clear MOA (Bypasses RLS)
app.post(['/api/professor/unsubmit-moa', '/professor/unsubmit-moa'], async (req, res) => {
    const { internshipId } = req.body;
    
    if (!internshipId) {
        return res.status(400).json({ error: 'Missing internshipId' });
    }

    try {
        console.log(`[Unsubmit Server] Clearing MOA for internshipId: ${internshipId}`);

        // 1. Get the student ID
        const { data: internship, error: fetchError } = await supabaseAdmin
            .from('student_internships')
            .select('student_id')
            .eq('id', internshipId)
            .single();
        
        if (fetchError) throw fetchError;

        // 2. Delete the record from student_moas table
        await supabaseAdmin
            .from('student_moas')
            .delete()
            .eq('internship_id', internshipId);

        // 3. Update student_internships moa_status to PENDING
        await supabaseAdmin
            .from('student_internships')
            .update({ moa_status: 'PENDING', updated_at: new Date().toISOString() })
            .eq('id', internshipId);

        // 4. Find the MOA document in pre_internship_documents and delete it
        const { data: existingDocs } = await supabaseAdmin
            .from('pre_internship_documents')
            .select('*')
            .eq('internship_id', internshipId);

        const moaDoc = (existingDocs || []).find(d => 
            d.document_name.toLowerCase().includes('moa') || 
            d.document_name.toLowerCase().includes('memorandum of agreement')
        );

        if (moaDoc) {
            // Delete the document record so it resets the stage checklist
            await supabaseAdmin
                .from('pre_internship_documents')
                .delete()
                .eq('id', moaDoc.id);
        }

        res.json({
            success: true,
            message: 'MOA successfully unsubmitted'
        });

    } catch (error) {
        console.error('[Unsubmit Server] Error unsubmitting MOA:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post(['/api/claude/scan-attendance', '/claude/scan-attendance'], async (req, res) => {
    const { base64Data, mimeType } = req.body;
    
    if (!base64Data) {
        return res.status(400).json({ error: 'Missing base64Data' });
    }

    try {
        console.log('[Claude Scanner] Sending document to Claude 3.5 Sonnet...');
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01',
                'anthropic-beta': 'pdfs-2024-09-25'
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1024,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'document',
                                source: {
                                    type: 'base64',
                                    media_type: mimeType || 'application/pdf',
                                    data: base64Data
                                }
                            },
                            {
                                type: 'text',
                                text: `You are an expert document scanner. Analyze this student OJT (On-the-Job Training) supervisor-signed attendance report sheet or PDF.

Find ONLY the "Total this Period" value — this is the hours rendered SPECIFICALLY for the date range covered by this report sheet, NOT the cumulative or grand total. It is typically labeled as "Total this Period", "Total Hours this Period", or appears in the middle summary row between "Previous Total" and "Total Hours Served".

Do NOT return the "Grand Total", "Total Hours Served", or "Previous Total + this Period" combined value.

Also find the date range covered by this report. It is typically found at the top near the Name and Company fields. Return the start date and end date in YYYY-MM-DD format.

Finally, extract the exact list of all individual dates that have logged hours recorded in the table rows and return them in "loggedDates" as an array of YYYY-MM-DD strings.

Return the result in JSON format ONLY:
{
  "grandTotalHours": 40.5,
  "daysPresent": 5,
  "startDate": "2025-01-01",
  "endDate": "2025-01-07",
  "loggedDates": ["2025-01-01", "2025-01-02", "2025-01-03", "2025-01-06", "2025-01-07"]
}

Where "grandTotalHours" must be the "Total this Period" value only (the new hours for this specific report).
Also, extract the exact list of all individual dates that have logged hours recorded in the table rows and return them in "loggedDates" as an array of YYYY-MM-DD strings.
If you cannot find a value, return null for that field (or empty array for loggedDates). Return only raw JSON without any markdown formatting.`
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error('[Claude Scanner] API Error:', errBody);
            throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.content[0].text.trim();
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not parse AI response as JSON');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        res.json({ success: true, data: parsed });
    } catch (err) {
        console.error('[Claude Scanner] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST API to upload signed attendance report and hours
app.post(['/api/student/upload-signed-attendance-report', '/student/upload-signed-attendance-report'], async (req, res) => {
    const { internshipId, fileUrl, hours, startDate, endDate, loggedDates, originalFileName } = req.body;
    
    if (!internshipId || !fileUrl || !hours) {
        return res.status(400).json({ error: 'Missing required parameters: internshipId, fileUrl, hours' });
    }

    try {
        console.log(`[Attendance Report] Received:`, { internshipId, hours, startDate, endDate, loggedDatesCount: Array.isArray(loggedDates) ? loggedDates.length : 'none', loggedDates, originalFileName });

        // Check for duplicates in backend
        const { data: existingReqs, error: fetchError } = await supabaseAdmin
            .from('additional_requirements')
            .select('*')
            .eq('internship_id', internshipId);

        if (fetchError) throw fetchError;

        const isDuplicateFile = existingReqs.some(req => {
            if (req.document_name && req.document_name.startsWith('Signed Attendance Report')) {
                if (req.reviewer_comment && originalFileName) {
                    const match = req.reviewer_comment.match(/\(File:\s*(.*?)\)/);
                    if (match && match[1] === originalFileName) {
                        return true;
                    }
                }
            }
            return false;
        });

        if (isDuplicateFile) {
            return res.status(400).json({ error: `You have already uploaded a file named "${originalFileName}".` });
        }

        const isDuplicateDate = existingReqs.some(req => {
            if (req.document_name && req.document_name.startsWith('Signed Attendance Report')) {
                const match = req.document_name.match(/\[([0-9-]+)\s+to\s+([0-9-]+)\]/);
                if (match && startDate && endDate) {
                    const [_, existingStart, existingEnd] = match;
                    if (existingStart === startDate && existingEnd === endDate) {
                        return true;
                    }
                }
            }
            return false;
        });

        if (isDuplicateDate) {
            return res.status(400).json({ error: `A report for the period ${startDate} to ${endDate} has already been uploaded.` });
        }

        // Insert into additional_requirements using service role client
        const { data, error } = await supabaseAdmin
            .from('additional_requirements')
            .insert([{
                internship_id: internshipId,
                document_name: `Signed Attendance Report (${parseFloat(hours).toFixed(2)} hrs) [${startDate || 'N/A'} to ${endDate || 'N/A'}]`,
                file_url: fileUrl,
                status: 'APPROVED', // Immediately approved as requested
                reviewer_comment: `[HOURS:${parseFloat(hours).toFixed(2)}] Approved signed attendance report (File: ${originalFileName || 'Unknown'}).`,
                submitted_at: new Date().toISOString()
            }])
            .select();

        if (error) throw error;

        // Mark corresponding daily attendance logs as DEDUCTED to prevent double-deduction
        let updatedCount = 0;

        // Try exact date matching first (Gemini-extracted dates from the PDF)
        if (loggedDates && Array.isArray(loggedDates) && loggedDates.length > 0) {
            // Normalize dates to YYYY-MM-DD to guard against Gemini format variations
            const normalizedDates = loggedDates.map(d => {
                const parsed = new Date(d + 'T00:00:00');
                if (isNaN(parsed.getTime())) return d;
                const y = parsed.getFullYear();
                const m = String(parsed.getMonth() + 1).padStart(2, '0');
                const day = String(parsed.getDate()).padStart(2, '0');
                return `${y}-${m}-${day}`;
            });

            const { data: updatedLogs, error: updateError } = await supabaseAdmin
                .from('attendance_logs')
                .update({
                    status: 'DEDUCTED',
                    updated_at: new Date().toISOString()
                })
                .eq('internship_id', internshipId)
                .eq('status', 'LOGGED')
                .in('log_date', normalizedDates)
                .select();

            if (updateError) {
                console.error('Failed to update attendance logs to DEDUCTED:', updateError.message);
            } else {
                updatedCount = updatedLogs ? updatedLogs.length : 0;
                console.log(`Updated ${updatedCount} logs to DEDUCTED using exact dates.`);
            }
        }

        // Debug: show what LOGGED logs exist for this internship
        if (updatedCount === 0) {
            const { data: existingLogs } = await supabaseAdmin
                .from('attendance_logs')
                .select('log_date, status')
                .eq('internship_id', internshipId)
                .eq('status', 'LOGGED');
            console.log(`[Debug] LOGGED logs in DB for internship ${internshipId}:`, existingLogs?.map(l => l.log_date));
        }

        // Fall back to date range if exact date match found nothing (or no dates provided)
        if (updatedCount === 0 && startDate && endDate) {
            const { data: updatedLogs, error: updateError } = await supabaseAdmin
                .from('attendance_logs')
                .update({
                    status: 'DEDUCTED',
                    updated_at: new Date().toISOString()
                })
                .eq('internship_id', internshipId)
                .eq('status', 'LOGGED')
                .gte('log_date', startDate)
                .lte('log_date', endDate)
                .select();

            if (updateError) {
                console.error('Failed to update attendance logs to DEDUCTED:', updateError.message);
            } else {
                updatedCount = updatedLogs ? updatedLogs.length : 0;
                console.log(`Updated ${updatedCount} logs to DEDUCTED using date range ${startDate} to ${endDate}.`);
            }
        }

        return res.json({ success: true, report: data[0], updatedCount });
    } catch (err) {
        console.error('Failed to save signed attendance report:', err);
        return res.status(500).json({ error: err.message || 'Failed to save signed attendance report' });
    }
});



// Background Worker: Runs immediately on boot and every 5 minutes to deliver Shift Attendance Reminders (Clock-in and Clock-out reminders)
const runAttendanceReminderEngine = async () => {
    console.log('⏰ [Attendance Reminder Engine] Checking OJT schedules (Asia/Manila)...');
    try {
        // 1. Fetch all auth users
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;

        // 2. Filter for students with active reminders enabled
        const activeReminderStudents = (users || []).filter(u => {
            const role = u.user_metadata?.role || u.user_metadata?.userRole || 'student';
            return role === 'student' && u.user_metadata?.reminders_enabled === true;
        });

        console.log(`⏰ [Attendance Reminder Engine] Found ${activeReminderStudents.length} students with reminders enabled.`);
        if (activeReminderStudents.length === 0) return;

        // Get current date/time info in Asia/Manila (Philippine Standard Time)
        const now = new Date();
        const todayStr = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Manila',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(now);

        const currentTimeStr = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Manila',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        }).format(now);

        console.log(`⏰ [Attendance Reminder Engine] Manila Time: ${currentTimeStr} | Date: ${todayStr}`);

        for (const student of activeReminderStudents) {
            try {
                const metadata = student.user_metadata || {};
                const timeInStr = metadata.usual_time_in || '08:00';
                const timeOutStr = metadata.usual_time_out || '17:00';

                // Fetch student internship record to see if they are deployed
                const { data: internship, error: internError } = await supabaseAdmin
                    .from('student_internships')
                    .select('id, is_deployed')
                    .eq('student_id', student.id)
                    .maybeSingle();

                if (internError || !internship || !internship.is_deployed) {
                    console.log(`⏰ [Attendance Reminder Engine] Student ${student.email} is not deployed or has no internship record. Skipping.`);
                    continue;
                }

                // Fetch today's logs for this student
                const { data: logs, error: logsError } = await supabaseAdmin
                    .from('attendance_logs')
                    .select('*')
                    .eq('internship_id', internship.id)
                    .eq('log_date', todayStr);

                if (logsError) {
                    console.error(`⏰ [Attendance Reminder Engine] Failed to fetch logs for student ${student.email}:`, logsError);
                    continue;
                }

                const hasTodayLog = logs && logs.length > 0;
                const activeSession = logs && logs.find(l => l.status === 'IN_PROGRESS');

                // Guard: skip if time-in >= time-out (invalid/mis-configured shift)
                if (timeInStr >= timeOutStr) {
                    console.warn(`⚠️ [Attendance Reminder Engine] Student ${student.email} has invalid shift times: IN=${timeInStr} OUT=${timeOutStr}. Skipping.`);
                    continue;
                }

                console.log(`⏰ [Attendance Reminder Engine] Student: ${student.email} | Shift: ${timeInStr}-${timeOutStr} | Current: ${currentTimeStr} | Today Logged: ${hasTodayLog} | Active Session: ${!!activeSession} | Clock In Reminded Today: ${metadata.last_clock_in_reminder_sent === todayStr} | Clock Out Reminded Today: ${metadata.last_clock_out_reminder_sent === todayStr}`);

                // ── CASE 1: CLOCK-IN REMINDER ──
                if (!hasTodayLog && currentTimeStr >= timeInStr && currentTimeStr < timeOutStr && metadata.last_clock_in_reminder_sent !== todayStr) {
                    const email = student.email || student.user_metadata?.email;
                    const name = `${student.user_metadata?.first_name || ''} ${student.user_metadata?.last_name || ''}`.trim() || 'Student';
                    
                    console.log(`✉️ [Attendance Reminder Engine] Sending CLOCK-IN reminder to ${email}...`);
                    await sendAttendanceReminderEmail(email, name, 'clock_in', timeInStr);
                    
                    // Update metadata
                    await supabaseAdmin.auth.admin.updateUserById(student.id, {
                        user_metadata: {
                            ...metadata,
                            last_clock_in_reminder_sent: todayStr
                        }
                    });
                }

                // ── CASE 2: CLOCK-OUT REMINDER ──
                if (activeSession && currentTimeStr >= timeOutStr && metadata.last_clock_out_reminder_sent !== todayStr) {
                    const email = student.email || student.user_metadata?.email;
                    const name = `${student.user_metadata?.first_name || ''} ${student.user_metadata?.last_name || ''}`.trim() || 'Student';
                    
                    console.log(`✉️ [Attendance Reminder Engine] Sending CLOCK-OUT reminder to ${email}...`);
                    await sendAttendanceReminderEmail(email, name, 'clock_out', timeOutStr);
                    
                    // Update metadata
                    await supabaseAdmin.auth.admin.updateUserById(student.id, {
                        user_metadata: {
                            ...metadata,
                            last_clock_out_reminder_sent: todayStr
                        }
                    });
                }

            } catch (studentErr) {
                console.error(`Error processing reminder for student ${student.id}:`, studentErr);
            }
        }
    } catch (err) {
        console.error('Error running Background Attendance Reminder Engine:', err);
    }
};

// Run immediately on boot
setTimeout(runAttendanceReminderEngine, 3000);

// Run every 5 minutes
setInterval(runAttendanceReminderEngine, 5 * 60 * 1000);



app.post('/api/claude/scan-cor', async (req, res) => {
    try {
        const { base64Data, mimeType } = req.body;
        const apiKey = process.env.CLAUDE_API_KEY;
        
        const prompt = `You are an academic document parser. Analyze this Certificate of Registration (COR) PDF from a Philippine university and extract the following information in JSON format ONLY. Do not include any explanation or markdown formatting outside the JSON.

Extract:
{
  "firstName": "First name of the student",
  "lastName": "Last name of the student",
  "studentId": "Student ID number",
  "course": "Full course name (e.g. Bachelor of Science in Information Technology)",
  "courseCode": "Short course code (e.g. BSIT, BSCS, BSIS)",
  "yearLevel": "Year level (e.g. 4th Year)",
  "ojtSubjectFound": true or false (true if any subject with keywords like OJT, Practicum, On-the-Job Training, Internship, Work Immersion, Field Practice is enrolled),
  "ojtSubjectName": "Name of the OJT/Practicum subject if found, or null",
  "academicYear": "Academic year (e.g. 2025-2026)",
  "semester": "Semester (e.g. 1st Semester)"
}

If a field cannot be found, use null for that field.
Be accurate — this is used for student verification.`;

        const contentBlock = [];
        if (mimeType === 'application/pdf') {
            contentBlock.push({
                type: "document",
                source: {
                    type: "base64",
                    media_type: "application/pdf",
                    data: base64Data
                }
            });
        } else {
            contentBlock.push({
                type: "image",
                source: {
                    type: "base64",
                    media_type: mimeType || "image/png",
                    data: base64Data
                }
            });
        }
        contentBlock.push({ type: "text", text: prompt });

        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-beta': 'pdfs-2024-09-25',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1024,
                messages: [{ role: 'user', content: contentBlock }]
            })
        });

        const data = await claudeResponse.json();
        if (!claudeResponse.ok) {
            throw new Error(data.error?.message || 'Claude API failed');
        }

        const text = data.content[0].text.trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Could not parse Claude response as JSON');
        
        res.json({ success: true, data: JSON.parse(jsonMatch[0]) });

    } catch (err) {
        console.error('Claude proxy error (COR):', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Portfolio Route: Generate Personal Reflection using Claude
app.post(['/api/claude/generate-reflection', '/claude/generate-reflection'], async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Missing prompt' });
    }

    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Claude API key not configured on server.' });
    }

    try {
        console.log('[Claude Reflection] Generating personal reflection with claude-sonnet-4-6...');
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-6',
                max_tokens: 4096,
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error('[Claude Reflection] API Error:', errBody);
            throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.content?.[0]?.text?.trim();
        if (!text) throw new Error('Empty response from Claude');

        console.log('[Claude Reflection] Successfully generated reflection.');
        res.json({ success: true, text });
    } catch (err) {
        console.error('[Claude Reflection] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});
// WAR Generator Route: Generate WAR using Claude
app.post(['/api/claude/generate-war', '/claude/generate-war'], async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Claude API key not configured on server.' });

    try {
        console.log('[Claude WAR] Generating weekly report...');
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-6',
                max_tokens: 4096,
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error('[Claude WAR] API Error:', errBody);
            throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.content?.[0]?.text?.trim();
        if (!text) throw new Error('Empty response from Claude');

        console.log('[Claude WAR] Successfully generated report.');
        res.json({ success: true, text });
    } catch (err) {
        console.error('[Claude WAR] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── Backup & Restore ────────────────────────────────────────────────────────

const BACKUP_BUCKET = 'backups';

// Tables in restore-safe dependency order (parents before children)
const BACKUP_TABLES = [
    'departments',
    'programs',
    'program_sections',
    'program_required_documents',
    'companies',
    'users',
    'student_profiles',
    'student_internships',
    'pre_internship_documents',
    'weekly_activity_reports',
    'daily_activities',
    'attendance_logs',
    'additional_requirements',
    'student_moas',
    'visit_itineraries',
    'portfolio_documents',
];

const ensureBackupBucket = async () => {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some(b => b.name === BACKUP_BUCKET);
    if (!exists) {
        await supabaseAdmin.storage.createBucket(BACKUP_BUCKET, { public: false });
        console.log('[Backup] Created storage bucket:', BACKUP_BUCKET);
    }
};

const performBackup = async (triggeredBy = 'auto') => {
    console.log(`[Backup] Starting ${triggeredBy} backup...`);
    const startTime = Date.now();
    try {
        await ensureBackupBucket();

        const backupData = {
            version: '1.0',
            created_at: new Date().toISOString(),
            triggered_by: triggeredBy,
            tables: {}
        };

        for (const table of BACKUP_TABLES) {
            try {
                const { data, error } = await supabaseAdmin.from(table).select('*');
                if (error) {
                    console.warn(`[Backup] Could not fetch ${table}:`, error.message);
                    backupData.tables[table] = { error: error.message, rows: [] };
                } else {
                    backupData.tables[table] = { rows: data || [], count: (data || []).length };
                }
            } catch (err) {
                console.warn(`[Backup] Exception for ${table}:`, err.message);
                backupData.tables[table] = { error: err.message, rows: [] };
            }
        }

        // Filename: backup_YYYY-MM-DD_HH-MM.json (Manila time)
        const manilaStr = new Intl.DateTimeFormat('sv-SE', {
            timeZone: 'Asia/Manila',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false
        }).format(new Date()).replace(' ', '_').replace(':', '-');
        const fileName = `backup_${manilaStr}.json`;

        const jsonBuffer = Buffer.from(JSON.stringify(backupData), 'utf-8');
        const { error: uploadError } = await supabaseAdmin.storage
            .from(BACKUP_BUCKET)
            .upload(fileName, jsonBuffer, { contentType: 'application/json', upsert: true });

        if (uploadError) throw uploadError;

        const duration = Date.now() - startTime;
        const tableCounts = Object.fromEntries(
            Object.entries(backupData.tables).map(([t, v]) => [t, v.count ?? 0])
        );
        console.log(`[Backup] Done: ${fileName} (${duration}ms) —`, tableCounts);
        return { success: true, fileName, created_at: backupData.created_at, duration_ms: duration, table_counts: tableCounts };
    } catch (err) {
        console.error('[Backup] Failed:', err.message);
        return { success: false, error: err.message };
    }
};

// Schedule auto-backup at midnight Asia/Manila (= 16:00 UTC)
const scheduleMidnightBackup = () => {
    const now = new Date();
    const next = new Date(now);
    next.setUTCHours(16, 0, 0, 0); // 00:00 Manila = 16:00 UTC
    if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
    const delay = next.getTime() - now.getTime();
    console.log(`[Backup] Auto-backup scheduled in ${Math.round(delay / 60000)} min (${next.toISOString()})`);
    setTimeout(async () => {
        await performBackup('auto');
        scheduleMidnightBackup(); // re-schedule for next midnight
    }, delay);
};
scheduleMidnightBackup();

// POST /api/admin/backup/create — manual trigger
app.post(['/api/admin/backup/create', '/admin/backup/create'], async (req, res) => {
    const result = await performBackup('manual');
    result.success ? res.json(result) : res.status(500).json({ error: result.error });
});

// GET /api/admin/backup/list — list available backups
app.get(['/api/admin/backup/list', '/admin/backup/list'], async (req, res) => {
    try {
        await ensureBackupBucket();
        const { data, error } = await supabaseAdmin.storage
            .from(BACKUP_BUCKET)
            .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
        if (error) throw error;
        const backups = (data || [])
            .filter(f => f.name?.endsWith('.json'))
            .map(f => ({ name: f.name, created_at: f.created_at, size: f.metadata?.size || 0 }));
        res.json({ backups });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/backup/restore — restore from a backup file
app.post(['/api/admin/backup/restore', '/admin/backup/restore'], async (req, res) => {
    const { fileName } = req.body;
    if (!fileName) return res.status(400).json({ error: 'Missing fileName' });
    try {
        // Download backup
        const { data: fileData, error: dlError } = await supabaseAdmin.storage
            .from(BACKUP_BUCKET)
            .download(fileName);
        if (dlError) throw dlError;

        const backup = JSON.parse(await fileData.text());
        if (!backup.tables) throw new Error('Invalid backup format');

        // Restore order: skip users/student_profiles to avoid auth FK issues
        const RESTORE_ORDER = [
            'departments', 'programs', 'program_sections', 'program_required_documents',
            'companies', 'student_internships', 'pre_internship_documents',
            'weekly_activity_reports', 'daily_activities', 'attendance_logs',
            'additional_requirements', 'student_moas', 'visit_itineraries', 'portfolio_documents',
        ];

        const results = {};
        for (const table of RESTORE_ORDER) {
            const tableData = backup.tables[table];
            if (!tableData?.rows?.length) { results[table] = { restored: 0 }; continue; }
            try {
                const { error } = await supabaseAdmin
                    .from(table)
                    .upsert(tableData.rows, { onConflict: 'id' });
                results[table] = error ? { error: error.message } : { restored: tableData.rows.length };
            } catch (err) {
                results[table] = { error: err.message };
            }
        }

        console.log(`[Restore] Completed from ${fileName}`);
        res.json({ success: true, restored_from: fileName, created_at: backup.created_at, results });
    } catch (err) {
        console.error('[Restore] Failed:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/backup/upload — upload a backup file
app.post(['/api/admin/backup/upload', '/admin/backup/upload'], upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const fileContent = req.file.buffer.toString('utf-8');
        let parsed;
        try {
            parsed = JSON.parse(fileContent);
        } catch (e) {
            return res.status(400).json({ error: 'Uploaded file is not a valid JSON' });
        }
        if (!parsed.tables) {
            return res.status(400).json({ error: 'Invalid backup format' });
        }

        let fileName = req.file.originalname;
        if (!fileName.endsWith('.json')) fileName += '.json';

        const { error } = await supabaseAdmin.storage
            .from(BACKUP_BUCKET)
            .upload(fileName, req.file.buffer, {
                contentType: 'application/json',
                upsert: true
            });
            
        if (error) throw error;
        res.json({ success: true, fileName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/backup/delete — delete a backup file
app.delete('/api/admin/backup/delete', async (req, res) => {
    const { fileName } = req.body;
    if (!fileName) return res.status(400).json({ error: 'Missing fileName' });
    try {
        const { error } = await supabaseAdmin.storage.from(BACKUP_BUCKET).remove([fileName]);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/backup/download/:fileName — download a backup file
app.get(['/api/admin/backup/download/:fileName', '/admin/backup/download/:fileName'], async (req, res) => {
    const { fileName } = req.params;
    if (!fileName) return res.status(400).json({ error: 'Missing fileName' });
    try {
        const { data, error } = await supabaseAdmin.storage
            .from(BACKUP_BUCKET)
            .createSignedUrl(fileName, 60, { download: true });
        
        if (error) throw error;
        res.redirect(data.signedUrl);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── BullBot: Claude AI Chat with database tool use ──────────────────────────

const PAGE_LABELS = {
    '/dashboard': 'Dashboard', '/company-info': 'Company Info', '/documents': 'Documents',
    '/templates': 'Templates', '/attendance': 'Attendance', '/activities': 'Daily Activities',
    '/weekly-reports': 'Weekly Reports', '/portfolio': 'Portfolio',
    '/notifications': 'Notifications', '/profile': 'Profile',
    '/ojt-professor/dashboard': 'Dashboard', '/ojt-professor/students': 'Student Directory',
    '/ojt-professor/attendance': 'Attendance Management', '/ojt-professor/document-review': 'Document Review',
    '/ojt-professor/war-review': 'WAR Review', '/ojt-professor/monitoring': 'Progress Monitoring',
    '/ojt-professor/completion-validation': 'Completion Validation',
    '/ojt-professor/visit-itinerary': 'Visit Itinerary', '/ojt-professor/grades': 'Grade Management',
    '/ojt-professor/reports': 'Reports', '/ojt-professor/notifications': 'Notifications',
    '/ojt-professor/profile': 'Profile',
    '/admin/dashboard': 'Dashboard', '/admin/users': 'User Management',
    '/admin/internship-config': 'Internship Config', '/admin/reports': 'Reports',
    '/admin/audit': 'Audit Logs', '/admin/settings': 'Settings',
    '/admin/notifications': 'Notifications', '/admin/profile': 'Profile',
    '/admin/departments': 'Departments', '/admin/backup': 'Backup & Restore',
};

const ROLE_PAGES = {
    student: '/dashboard, /company-info, /documents, /templates, /attendance, /activities, /weekly-reports, /portfolio, /notifications, /profile',
    ojt_head: '/ojt-professor/dashboard, /ojt-professor/students, /ojt-professor/attendance, /ojt-professor/document-review, /ojt-professor/war-review, /ojt-professor/monitoring, /ojt-professor/completion-validation, /ojt-professor/visit-itinerary, /ojt-professor/grades, /ojt-professor/reports, /ojt-professor/notifications, /ojt-professor/profile',
    admin: '/admin/dashboard, /admin/users, /admin/internship-config, /admin/departments, /admin/reports, /admin/audit, /admin/backup, /admin/settings, /admin/notifications, /admin/profile',
};

const bullBotSystem = (role, userName) => `You are BullBot, the official AI assistant for InternLink — a comprehensive OJT (On-the-Job Training) management system used by a university.

Current user: ${userName} (role: ${role})

--- FULL SYSTEM KNOWLEDGE ---

InternLink manages the entire OJT internship lifecycle for three user roles:

STUDENT ROLE
Students go through three internship stages: BEFORE_INTERNSHIP (pre-deployment), DURING_INTERNSHIP (actively rendering hours), and POST_INTERNSHIP (completed hours, awaiting grade).
Features available to students:
- Dashboard: shows internship progress, hours rendered vs required, current stage, company info, and recent activity.
- Company Info: displays deployment details — company name, address, industry, department, supervisor name and email, MOA status, and deployment letter status.
- Documents: a checklist of pre-internship requirements (e.g. endorsement letter, medical certificate, parental consent, insurance). Each document has a status of NOT_SUBMITTED, PENDING, APPROVED, or REJECTED. Rejected documents show reviewer comments. Additional custom requirements can also be assigned.
- Attendance: students log daily time-in and time-out. The system calculates hours per day (capped at regular hours + max 2 overtime hours, with absolute 7PM cutoff). Total rendered hours are tracked against required hours (e.g. 486 hours for most programs). NOTE: Attendance logs have statuses. 'LOGGED' means recorded but unsubmitted ('unsubmitted_logged_hours'). 'DEDUCTED' is a GOOD status: it means the hours were officially approved via a PDF report and have been successfully deducted from the student's remaining required hours ('officially_approved_hours'). Always report 'officially_approved_hours' as the student's primary total hours rendered.
- Weekly Reports (WAR): students submit a Weekly Activity Report each week summarizing activities, skills learned, and challenges. Reports have statuses: NOT_SUBMITTED, PENDING, APPROVED, REJECTED. AI can help generate report content.
- Portfolio: post-internship document submissions including reflection papers and certificates.
- Notifications: system alerts for document reviews, approvals, rejections, and deadlines.
- Profile: personal information, profile photo, OJT subject name.

ADVISER ROLE (ojt_head)
Advisers manage and monitor students assigned to their sections within a program.
Features available to advisers:
- Student Directory: full list of assigned students with internship stage, company, hours progress, deployment status, and section.
- Document Review: view and approve or reject student pre-internship documents and additional requirements. Can add reviewer comments.
- WAR Review (Weekly Activity Report Review): review and approve or reject student weekly reports. Can provide feedback.
- Progress Monitoring: track individual student attendance logs, hours rendered, and internship stage.
- Completion Validation: when a student reaches the required number of OJT hours, the adviser validates completion and transitions the student to POST_INTERNSHIP stage. The system checks submitted attendance reports for calculated hours.
- Visit Itinerary: advisers schedule and manage company visits. Each visit has a date, location, notes, a list of students at that location, and a status (SCHEDULED or COMPLETED). The Smart Auto-Generator groups deployed students by geographic location cluster to optimize travel. Advisers can manually add visits or use the auto-generator.
- Grade Management: advisers encode final numeric grades (0-100) for students who have completed their internship and submitted their portfolio. The system tracks final_grade and the date it was encoded.
- Reports Dashboard: summary reports on student progress, document completion rates, hours distribution, and grade statistics.
- Notifications: alerts for student submissions, document uploads, and system events.
- Profile: personal information and section assignments.

ADVISER ROLE — ADDITIONAL CAPABILITY
Advisers (ojt_head) can also register and create new student accounts directly. This is done through the Student Directory page. Advisers fill in the student's details (name, email, student ID, program, section, year level) and the system creates the account and sends login credentials to the student via email.

ADMIN ROLE
Admins manage the entire system configuration and user accounts.
Features available to admins:
- Dashboard: system-wide statistics — total students, advisers, active internships, pending documents, completion rates.
- User Management: create, view, activate/deactivate student and adviser accounts. Bulk import students via CSV. Assign students to sections and programs. Reset passwords. Admins can also create student accounts the same way advisers can.
- Internship Configuration: configure academic programs (name, code, required OJT hours, OJT subject code), document submission deadlines, and portfolio submission deadlines.
- Department Management: manage academic departments and their programs.
- Backup & Restore: export full database backups and restore from backup files.
- Audit Logs: track all system events — who did what and when, with IP address logging.
- Reports: system-wide reports on internship completion, document status, grade distribution.
- Settings: system-wide configuration.
- Notifications: system-wide alerts.

KEY DATA RELATIONSHIPS
- Programs define required OJT hours (commonly 486 hours) and document deadlines.
- Sections belong to programs; advisers are assigned to specific sections via professor_sections.
- Students are enrolled in a section within a program; their profile (student_profiles) stores this.
- Each student has one internship record (student_internships) which tracks company, hours, stage, MOA, grade.
- Documents, attendance logs, weekly reports, and portfolio items all link to the internship record.
- Visit itineraries are per-adviser and store a JSON list of students in that visit.

--- END SYSTEM KNOWLEDGE ---

When a user asks about their data, use the available tools to fetch live data and answer accurately. Always use tools before answering data-specific questions.

You have a powerful 'query_database' tool that allows you to directly query the Supabase database. Use this tool if the specific tools do not provide the information needed. You can query tables like 'users', 'student_profiles', 'student_internships', 'attendance_logs', 'companies', etc. 
SECURITY WARNING: Do not leak sensitive information (like other users' personal data or grades) to students.

If a question is completely unrelated to InternLink, OJT, or internship management (e.g. cooking, entertainment, general coding), politely decline and redirect.

When listing multiple items, use a dash (-) at the start of each item on its own line. Do not use bold, italic, headers, pound signs, underscores, backticks, or other markdown. Write in clear natural sentences.

--- PAGE SHORTCUTS ---
At the end of your response, if there are InternLink pages the user should visit based on what was discussed, add exactly one line in this format:
PAGES: /path1, /path2

Only use paths from this list: ${ROLE_PAGES[role] || ROLE_PAGES.student}
Include at most 3 relevant paths. If no page is directly relevant, omit the PAGES line entirely.`;

const bullBotTools = (role) => {
    const tools = [];

    if (role === 'student') {
        tools.push(
            {
                name: 'get_my_internship',
                description: 'Get the student\'s internship record: company name, position, rendered hours, required hours, current stage (BEFORE_INTERNSHIP, DURING_INTERNSHIP, POST_INTERNSHIP), MOA status, supervisor name.',
                input_schema: { type: 'object', properties: {} }
            },
            {
                name: 'get_my_documents',
                description: 'Get the student\'s document checklist with submission and review status (NOT_SUBMITTED, PENDING, APPROVED, REJECTED) and any reviewer comments.',
                input_schema: { type: 'object', properties: {} }
            },
            {
                name: 'get_my_attendance',
                description: 'Get the student\'s attendance logs (date, time in/out, daily hours) and total rendered vs required hours.',
                input_schema: {
                    type: 'object',
                    properties: {
                        limit: { type: 'number', description: 'Number of recent records to return (default 14)' }
                    }
                }
            },
            {
                name: 'get_my_weekly_reports',
                description: 'Get the student\'s weekly activity reports with week number, status, and review comments.',
                input_schema: { type: 'object', properties: {} }
            }
        );
    }

    if (role === 'ojt_head') {
        tools.push(
            {
                name: 'get_students',
                description: 'Get list of students assigned to this adviser with their internship info: name, company, position, hours rendered, required hours, and current stage.',
                input_schema: {
                    type: 'object',
                    properties: {
                        stage: { type: 'string', description: 'Filter by stage: BEFORE_INTERNSHIP, DURING_INTERNSHIP, POST_INTERNSHIP' }
                    }
                }
            },
            {
                name: 'get_pending_documents',
                description: 'Get all student documents with PENDING status that need review, including the student name and document name.',
                input_schema: { type: 'object', properties: {} }
            },
            {
                name: 'get_student_attendance',
                description: 'Get attendance records for a specific student given their user ID.',
                input_schema: {
                    type: 'object',
                    properties: {
                        student_id: { type: 'string', description: 'Student user ID' }
                    },
                    required: ['student_id']
                }
            },
            {
                name: 'get_student_weekly_reports',
                description: 'Get weekly activity reports for a specific student given their internship ID.',
                input_schema: {
                    type: 'object',
                    properties: {
                        internship_id: { type: 'string', description: 'The student\'s internship ID' }
                    },
                    required: ['internship_id']
                }
            },
            {
                name: 'get_visit_itineraries',
                description: 'Get all scheduled and completed company visit itineraries. Each visit has a date, location, notes, status (SCHEDULED or COMPLETED), and the list of students at that location.',
                input_schema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', description: 'Filter by status: SCHEDULED or COMPLETED' }
                    }
                }
            },
            {
                name: 'get_student_grades',
                description: 'Get final grade records for all assigned students — shows student name, current stage, hours rendered, whether portfolio was submitted (stage3_submitted), and final grade if already encoded.',
                input_schema: { type: 'object', properties: {} }
            }
        );
    }

    if (role === 'admin') {
        tools.push(
            {
                name: 'get_system_stats',
                description: 'Get overall system statistics: total students, total advisers, active internships count, pending documents count.',
                input_schema: { type: 'object', properties: {} }
            },
            {
                name: 'get_users',
                description: 'Get a list of users in the system, optionally filtered by role.',
                input_schema: {
                    type: 'object',
                    properties: {
                        role: { type: 'string', description: 'Filter by role: student, ojt_head, admin' },
                        limit: { type: 'number', description: 'Max results (default 30)' }
                    }
                }
            },
            {
                name: 'get_internships',
                description: 'Get internship records with student name, company, hours, and stage.',
                input_schema: {
                    type: 'object',
                    properties: {
                        stage: { type: 'string', description: 'Filter by current_stage' },
                        limit: { type: 'number', description: 'Max results (default 30)' }
                    }
                }
            }
        );
    }

    // Universal Database Access Tool for BullBot
    tools.push({
        name: 'query_database',
        description: 'Query any table in the database to get information about the system. Use this to fetch schemas, list tables, or get data not covered by other tools. Be mindful of user roles and security.',
        input_schema: {
            type: 'object',
            properties: {
                table: { type: 'string', description: 'Table name to query' },
                select: { type: 'string', description: 'Columns to select (e.g., "*", "id, name")' },
                match: { type: 'object', description: 'Key-value pairs to filter by exact match' },
                limit: { type: 'number', description: 'Max results (default 10, max 50)' }
            },
            required: ['table']
        }
    });

    return tools;
};

const runBullBotTool = async (name, input, userId, userRole) => {
    try {
        switch (name) {
            case 'query_database': {
                try {
                    let query = supabaseAdmin.from(input.table).select(input.select || '*');
                    if (input.match) {
                        query = query.match(input.match);
                    }
                    const limit = Math.min(input.limit || 10, 50);
                    query = query.limit(limit);
                    
                    const { data, error } = await query;
                    if (error) throw error;
                    return data || [];
                } catch (err) {
                    console.error('[BullBot] query_database error:', err.message);
                    return { error: err.message };
                }
            }

            case 'get_my_internship': {
                if (!userId) return { error: 'userId not provided' };
                const { data: internship, error: e1 } = await supabaseAdmin
                    .from('student_internships')
                    .select(`id, position, supervisor_name, supervisor_email, moa_status,
                        is_deployed, current_stage, rendered_hours,
                        company:companies(name, address)`)
                    .eq('student_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                if (e1) { console.error('[BullBot] get_my_internship:', e1.message); return { error: e1.message }; }
                if (!internship) return { message: 'No internship record found.' };

                // Calculate officially approved hours from documents (matches UI logic)
                const { data: docs } = await supabaseAdmin
                    .from('pre_internship_documents')
                    .select('document_name, reviewer_comment, status')
                    .eq('internship_id', internship.id);
                
                let officially_approved_hours = 0;
                if (docs) {
                    docs.filter(d => d.document_name && d.document_name.startsWith('Signed Attendance Report') && d.status !== 'Not submitted')
                        .forEach(d => {
                            if (d.reviewer_comment) {
                                const match = d.reviewer_comment.match(/\[HOURS:([0-9.]+)\]/);
                                if (match) officially_approved_hours += parseFloat(match[1]);
                            }
                        });
                }

                // required_hours lives on the program, not the internship row
                const { data: profile } = await supabaseAdmin
                    .from('student_profiles')
                    .select('programs(required_hours)')
                    .eq('id', userId)
                    .maybeSingle();
                const required_hours = profile?.programs?.required_hours ?? 486;

                return { 
                    ...internship, 
                    required_hours,
                    officially_approved_hours,
                    unsubmitted_logged_hours: internship.rendered_hours
                };
            }

            case 'get_my_documents': {
                const { data: internship } = await supabaseAdmin
                    .from('student_internships').select('id').eq('student_id', userId)
                    .order('created_at', { ascending: false }).limit(1).maybeSingle();
                if (!internship) return { message: 'No internship found.' };
                const [{ data: docs }, { data: extra }] = await Promise.all([
                    supabaseAdmin.from('pre_internship_documents')
                        .select('document_name, status, submitted_at, reviewer_comment')
                        .eq('internship_id', internship.id),
                    supabaseAdmin.from('additional_requirements')
                        .select('document_name, status, submitted_at, reviewer_comment')
                        .eq('internship_id', internship.id)
                ]);
                return { pre_internship_documents: docs || [], additional_requirements: extra || [] };
            }

            case 'get_my_attendance': {
                if (!userId) return { error: 'userId not provided' };
                const { data: internship, error: e1 } = await supabaseAdmin
                    .from('student_internships').select('id, rendered_hours')
                    .eq('student_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
                if (e1) { console.error('[BullBot] get_my_attendance internship:', e1.message); return { error: e1.message }; }
                if (!internship) return { message: 'No internship found.' };

                const { data: profile } = await supabaseAdmin
                    .from('student_profiles').select('programs(required_hours)').eq('id', userId).maybeSingle();
                const required_hours = profile?.programs?.required_hours ?? 486;

                const { data: logs, error: e2 } = await supabaseAdmin
                    .from('attendance_logs')
                    .select('log_date, time_in, time_out, hours_rendered, status')
                    .eq('internship_id', internship.id)
                    .order('log_date', { ascending: false })
                    .limit(input.limit || 14);
                if (e2) { console.error('[BullBot] get_my_attendance logs:', e2.message); return { error: e2.message }; }

                // Calculate officially approved hours from documents (matches UI logic)
                const { data: docs } = await supabaseAdmin
                    .from('pre_internship_documents')
                    .select('document_name, reviewer_comment, status')
                    .eq('internship_id', internship.id);
                
                let officially_approved_hours = 0;
                if (docs) {
                    docs.filter(d => d.document_name && d.document_name.startsWith('Signed Attendance Report') && d.status !== 'Not submitted')
                        .forEach(d => {
                            if (d.reviewer_comment) {
                                const match = d.reviewer_comment.match(/\[HOURS:([0-9.]+)\]/);
                                if (match) officially_approved_hours += parseFloat(match[1]);
                            }
                        });
                }

                return { 
                    officially_approved_hours,
                    unsubmitted_logged_hours: internship.rendered_hours,
                    required_hours, 
                    recent_logs: logs || [] 
                };
            }

            case 'get_my_weekly_reports': {
                const { data: internship } = await supabaseAdmin
                    .from('student_internships').select('id').eq('student_id', userId)
                    .order('created_at', { ascending: false }).limit(1).maybeSingle();
                if (!internship) return { message: 'No internship found.' };
                const { data } = await supabaseAdmin
                    .from('weekly_activity_reports')
                    .select('week_number, week_label, status, submitted_at, reviewer_comment')
                    .eq('internship_id', internship.id)
                    .order('week_number');
                return data || [];
            }

            case 'get_students': {
                // Step 1 — adviser's program + sections
                const { data: adviser, error: e1 } = await supabaseAdmin
                    .from('users')
                    .select('program_id, professor_sections(section_id)')
                    .eq('id', userId)
                    .maybeSingle();
                if (e1) { console.error('[BullBot] adviser lookup:', e1.message); return { error: e1.message }; }

                const sectionIds = (adviser?.professor_sections || []).map(s => s.section_id);
                const programId = adviser?.program_id;

                // Step 2 — user UUIDs from student_profiles (id = UUID FK to users.id)
                let profileQ = supabaseAdmin.from('student_profiles').select('id');
                if (programId) profileQ = profileQ.eq('program_id', programId);
                if (sectionIds.length > 0) profileQ = profileQ.in('section_id', sectionIds);
                const { data: profiles, error: e2 } = await profileQ.limit(200);
                if (e2) { console.error('[BullBot] profiles lookup:', e2.message); return { error: e2.message }; }

                const studentIds = (profiles || []).map(p => p.id);
                if (studentIds.length === 0) return { students: [], message: 'No students found in your assigned sections.' };

                // Step 3 — internships + student names
                let intQ = supabaseAdmin
                    .from('student_internships')
                    .select(`id, student_id, position, current_stage, rendered_hours, required_hours,
                        company:companies(name),
                        student:users!student_id(first_name, last_name)`)
                    .in('student_id', studentIds)
                    .order('updated_at', { ascending: false })
                    .limit(50);
                if (input.stage) intQ = intQ.eq('current_stage', input.stage);
                const { data, error: e3 } = await intQ;
                if (e3) { console.error('[BullBot] internships lookup:', e3.message); return { error: e3.message }; }
                return data || [];
            }

            case 'get_pending_documents': {
                const { data } = await supabaseAdmin
                    .from('pre_internship_documents')
                    .select(`document_name, status, submitted_at,
                        internship:student_internships!internship_id(
                            student:users!student_id(first_name, last_name)
                        )`)
                    .eq('status', 'PENDING')
                    .order('submitted_at', { ascending: true })
                    .limit(50);
                return data || [];
            }

            case 'get_student_attendance': {
                const { data: internship, error: e1 } = await supabaseAdmin
                    .from('student_internships').select('id, rendered_hours')
                    .eq('student_id', input.student_id).limit(1).maybeSingle();
                if (e1) { console.error('[BullBot] get_student_attendance:', e1.message); return { error: e1.message }; }
                if (!internship) return { message: 'Student internship not found.' };

                const { data: profile } = await supabaseAdmin
                    .from('student_profiles').select('programs(required_hours)').eq('id', input.student_id).maybeSingle();
                const required_hours = profile?.programs?.required_hours ?? 486;

                const { data: logs } = await supabaseAdmin
                    .from('attendance_logs')
                    .select('log_date, time_in, time_out, hours_rendered, status')
                    .eq('internship_id', internship.id)
                    .order('log_date', { ascending: false }).limit(30);
                return { rendered_hours: internship.rendered_hours, required_hours, logs: logs || [] };
            }

            case 'get_student_weekly_reports': {
                const { data } = await supabaseAdmin
                    .from('weekly_activity_reports')
                    .select('week_number, week_label, status, submitted_at, reviewer_comment')
                    .eq('internship_id', input.internship_id)
                    .order('week_number');
                return data || [];
            }

            case 'get_visit_itineraries': {
                let q = supabaseAdmin
                    .from('visit_itineraries')
                    .select('id, date, location, notes, status, students')
                    .order('date', { ascending: true });
                if (input.status) q = q.eq('status', input.status);
                const { data, error } = await q;
                if (error) { console.error('[BullBot] visit_itineraries:', error.message); return { error: error.message }; }
                return data || [];
            }

            case 'get_student_grades': {
                // Reuse adviser section lookup
                const { data: adviser } = await supabaseAdmin
                    .from('users').select('program_id, professor_sections(section_id)')
                    .eq('id', userId).maybeSingle();
                const sectionIds = (adviser?.professor_sections || []).map(s => s.section_id);
                const programId = adviser?.program_id;
                let profileQ = supabaseAdmin.from('student_profiles').select('id');
                if (programId) profileQ = profileQ.eq('program_id', programId);
                if (sectionIds.length > 0) profileQ = profileQ.in('section_id', sectionIds);
                const { data: profiles } = await profileQ.limit(200);
                const studentIds = (profiles || []).map(p => p.id);
                if (studentIds.length === 0) return [];
                const { data, error } = await supabaseAdmin
                    .from('student_internships')
                    .select(`student_id, current_stage, rendered_hours, required_hours, final_grade, final_grade_encoded_at, stage3_submitted,
                        student:users!student_id(first_name, last_name)`)
                    .in('student_id', studentIds)
                    .order('student_id');
                if (error) { console.error('[BullBot] grades:', error.message); return { error: error.message }; }
                return data || [];
            }

            case 'get_system_stats': {
                const [
                    { count: students },
                    { count: advisers },
                    { count: activeInternships },
                    { count: pendingDocs }
                ] = await Promise.all([
                    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student'),
                    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).eq('role', 'ojt_head'),
                    supabaseAdmin.from('student_internships').select('id', { count: 'exact', head: true }).eq('current_stage', 'DURING_INTERNSHIP'),
                    supabaseAdmin.from('pre_internship_documents').select('id', { count: 'exact', head: true }).eq('status', 'PENDING')
                ]);
                return { total_students: students, total_advisers: advisers, active_internships: activeInternships, pending_documents: pendingDocs };
            }

            case 'get_users': {
                let query = supabaseAdmin
                    .from('users').select('id, first_name, last_name, role')
                    .order('first_name').limit(input.limit || 30);
                if (input.role) query = query.eq('role', input.role);
                const { data, error } = await query;
                if (error) return { error: error.message };
                return data || [];
            }

            case 'get_internships': {
                let query = supabaseAdmin
                    .from('student_internships')
                    .select(`id, position, current_stage, rendered_hours, required_hours,
                        company:companies(name),
                        student:users!student_id(first_name, last_name)`)
                    .order('updated_at', { ascending: false }).limit(input.limit || 30);
                if (input.stage) query = query.eq('current_stage', input.stage);
                const { data, error } = await query;
                if (error) return { error: error.message };
                return data || [];
            }

            default:
                return { error: `Unknown tool: ${name}` };
        }
    } catch (err) {
        console.error(`[BullBot] Tool "${name}" threw:`, err.message);
        return { error: err.message };
    }
};

app.post(['/api/bullbot/chat', '/bullbot/chat'], async (req, res) => {
    try {
        const { messages, userId, userRole, userName } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'messages array is required' });
        }

        const tools = bullBotTools(userRole || 'student');
        const system = bullBotSystem(userRole || 'student', userName || 'User');

        // Internal message chain for Claude (may grow with tool_use rounds)
        let chain = messages.map(m => ({ role: m.role, content: m.content }));

        for (let iteration = 0; iteration < 6; iteration++) {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': process.env.CLAUDE_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-6',
                    max_tokens: 2048,
                    system,
                    tools,
                    messages: chain,
                }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message || 'Claude API error');

            if (data.stop_reason === 'tool_use') {
                // Add Claude's response (contains tool_use blocks) to chain
                chain.push({ role: 'assistant', content: data.content });

                // Execute every requested tool in parallel
                const toolUseBlocks = data.content.filter(b => b.type === 'tool_use');
                const results = await Promise.all(
                    toolUseBlocks.map(async block => ({
                        type: 'tool_result',
                        tool_use_id: block.id,
                        content: JSON.stringify(await runBullBotTool(block.name, block.input, userId, userRole)),
                    }))
                );

                // Feed results back to Claude
                chain.push({ role: 'user', content: results });
                continue;
            }

            // end_turn — extract text, parse PAGES shortcut line, return
            let text = data.content.find(b => b.type === 'text')?.text || '';
            const pagesMatch = text.match(/\nPAGES:\s*([^\n]+)/);
            let links = [];
            if (pagesMatch) {
                links = pagesMatch[1].split(',')
                    .map(p => p.trim())
                    .filter(p => PAGE_LABELS[p])
                    .map(p => ({ label: PAGE_LABELS[p], path: p }));
                text = text.replace(/\nPAGES:\s*[^\n]+/, '').trim();
            }
            return res.json({ content: text, links });
        }

        return res.status(500).json({ error: 'Too many tool iterations.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Route: System Reports
app.get(['/api/admin/system-reports', '/admin/system-reports'], async (req, res) => {
    try {
        const { data: programs, error: progErr } = await supabaseAdmin.from('programs').select('*');
        if (progErr) throw progErr;

        const { data: profiles, error: profErr } = await supabaseAdmin.from('student_profiles').select('id, program_id, academic_year, semester');
        if (profErr) throw profErr;

        const { data: internships, error: intErr } = await supabaseAdmin.from('student_internships').select('student_id, current_stage');
        if (intErr) throw intErr;

        const courseBreakdown = programs.map(prog => {
            const progProfiles = profiles.filter(p => p.program_id === prog.id);
            const enrolled = progProfiles.length;
            let preInternship = 0;
            let duringInternship = 0;
            let postInternship = 0;
            let completed = 0;

            progProfiles.forEach(prof => {
                const internship = internships.find(i => i.student_id === prof.id);
                if (internship) {
                    if (internship.current_stage === 'PRE_INTERNSHIP') preInternship++;
                    else if (internship.current_stage === 'DURING_INTERNSHIP') duringInternship++;
                    else if (internship.current_stage === 'POST_INTERNSHIP') postInternship++;
                    else if (internship.current_stage === 'COMPLETED') completed++;
                }
            });

            // Using mock avgGrade as actual grade logic depends on a separate feature not fully scoped yet
            const avgGrade = enrolled > 0 ? '1.50' : 'N/A';

            return {
                course: prog.code || prog.name,
                enrolled,
                preInternship,
                duringInternship,
                postInternship,
                completed,
                avgGrade
            };
        });

        // Use the first profile's term info if available, else fallback
        const academicYear = profiles.find(p => p.academic_year)?.academic_year || '2025-2026';
        const semester = profiles.find(p => p.semester)?.semester || '2nd Semester';

        res.json({
            academicYear,
            semester,
            courseBreakdown
        });

    } catch (error) {
        console.error('System Reports error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve static assets from the React build folder
const buildPath = path.join(__dirname, '../build');
app.use(express.static(buildPath));

// Catch-all route to serve the React app
app.get(/.*/, (req, res, next) => {
    if (!req.url.startsWith('/api')) {
        res.sendFile(path.join(buildPath, 'index.html'));
    } else {
        next(); // let API routes registered later handle the request
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
