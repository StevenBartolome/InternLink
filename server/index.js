console.log('--- BACKEND SERVER INITIALIZING ---');
import express from 'express';
import cors from 'cors';
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
                'x-api-key': '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',
                'anthropic-version': '2023-06-01',
                'anthropic-beta': 'pdfs-2024-09-25'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
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
    const { internshipId, fileUrl, hours, startDate, endDate, loggedDates } = req.body;
    
    if (!internshipId || !fileUrl || !hours) {
        return res.status(400).json({ error: 'Missing required parameters: internshipId, fileUrl, hours' });
    }

    try {
        console.log(`[Attendance Report] Received:`, { internshipId, hours, startDate, endDate, loggedDatesCount: Array.isArray(loggedDates) ? loggedDates.length : 'none', loggedDates });

        // Insert into additional_requirements using service role client
        const { data, error } = await supabaseAdmin
            .from('additional_requirements')
            .insert([{
                internship_id: internshipId,
                document_name: `Signed Attendance Report (${parseFloat(hours).toFixed(2)} hrs)`,
                file_url: fileUrl,
                status: 'APPROVED', // Immediately approved as requested
                reviewer_comment: `[HOURS:${parseFloat(hours).toFixed(2)}] Approved signed attendance report.`,
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
