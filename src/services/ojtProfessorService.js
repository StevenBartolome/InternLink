import { supabase } from './supabaseClient';

export const ojtProfessorService = {
  /**
   * Fetch all students pending document review (Pre-Internship stage)
   */
  async getDocumentQueue() {
    // 1. Fetch internships and standard docs
    const { data, error } = await supabase
      .from('student_internships')
      .select(`
        id,
        student_id,
        position,
        supervisor_name,
        supervisor_email,
        moa_status,
        is_deployed,
        current_stage,
        company:companies(id, name, address),
        student:users!student_id (
          first_name,
          last_name,
          profile:student_profiles!id (
            student_id, 
            program_id,
            section_id,
            year_level,
            academic_year,
            semester,
            ojt_subject_name,
            programs(id, name, code),
            program_sections(id, name)
          )
        ),
        docs:pre_internship_documents(*)
      `)
      // Remove stage filter so we can see all students including POST_INTERNSHIP
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // 2. Fetch additional requirements separately with try-catch so it won't crash if the table is not created yet
    let additionalMap = {};
    try {
      const { data: additionalData, error: additionalError } = await supabase
        .from('additional_requirements')
        .select('*');

      if (!additionalError && additionalData) {
        additionalData.forEach(doc => {
          if (!additionalMap[doc.internship_id]) {
            additionalMap[doc.internship_id] = [];
          }
          additionalMap[doc.internship_id].push({
            id: doc.id,
            name: doc.document_name,
            status: doc.status,
            submittedAt: doc.submitted_at ? new Date(doc.submitted_at).toLocaleDateString() : 'Not Submitted',
            fileUrl: doc.file_url,
            comment: doc.reviewer_comment,
            isAdditional: true
          });
        });
      }
    } catch (err) {
      console.warn('additional_requirements table might not be created yet:', err.message);
    }

    return data.map(item => {
      const profileData = Array.isArray(item.student?.profile)
        ? item.student.profile[0]
        : item.student?.profile;

      const standardDocs = (item.docs || []).map(doc => ({
        id: doc.id,
        name: doc.document_name,
        status: doc.status,
        submittedAt: doc.submitted_at ? new Date(doc.submitted_at).toLocaleDateString() : 'Not Submitted',
        fileUrl: doc.file_url,
        comment: doc.reviewer_comment,
        isAdditional: false
      }));

      const additionalDocs = additionalMap[item.id] || [];

      // Determine company details from companies relation
      const companyName = item.company?.name || 'Not Applied';
      const companyAddress = item.company?.address || 'Not Provided';

      // Determine program / course details from programs relation
      const course = profileData?.programs?.code || 'Not Set';
      const courseFullName = profileData?.programs?.name || 'Not Set';

      return {
        internshipId: item.id,
        studentId: item.student_id,
        programId: profileData?.program_id,
        studentNo: profileData?.student_id || 'Not Set',
        studentName: `${item.student?.first_name} ${item.student?.last_name}`,
        firstName: item.student?.first_name,
        lastName: item.student?.last_name,
        company: companyName,
        companyName: companyName,
        companyAddress: companyAddress,
        position: item.position || 'Not Assigned',
        supervisorName: item.supervisor_name || 'Not Assigned',
        supervisorEmail: item.supervisor_email || 'Not Provided',
        moaStatus: item.moa_status,
        currentStage: item.current_stage,
        deploymentApproved: item.is_deployed,
        sectionId: profileData?.section_id,
        sectionName: profileData?.program_sections?.name || 'Not Assigned',
        course: course,
        courseFullName: courseFullName,
        yearLevel: profileData?.year_level || 'Not Set',
        academicYear: profileData?.academic_year || 'Not Set',
        semester: profileData?.semester || 'Not Set',
        ojtSubjectName: profileData?.ojt_subject_name || 'Not Set',
        contactNumber: 'Not Set',
        docs: [...standardDocs, ...additionalDocs]
      };
    });
  },

  /**
   * Upload and attach the generated MOA PDF to the student, then update MOA status to PROCESSED
   */
  async attachMOAPDF(internshipId, fileUrl, reviewerId) {
    // 1. Check if there's an existing pre_internship_documents entry with "moa" in the name
    const { data: existingDocs, error: fetchError } = await supabase
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
      // Update existing document
      const { data, error } = await supabase
        .from('pre_internship_documents')
        .update({
          file_url: fileUrl,
          status: 'APPROVED',
          submitted_at: new Date().toISOString(),
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewerId,
          reviewer_comment: 'MOA dynamically generated and signed by OJT Adviser.'
        })
        .eq('id', moaDoc.id)
        .select();

      if (error) throw error;
      docRecord = data[0];
    } else {
      // Check additional requirements
      const { data: existingAdd } = await supabase
        .from('additional_requirements')
        .select('*')
        .eq('internship_id', internshipId);

      const addMoaDoc = (existingAdd || []).find(d => 
        d.document_name.toLowerCase().includes('moa') || 
        d.document_name.toLowerCase().includes('memorandum of agreement')
      );

      if (addMoaDoc) {
        // Update existing additional requirement
        const { data, error } = await supabase
          .from('additional_requirements')
          .update({
            file_url: fileUrl,
            status: 'APPROVED',
            submitted_at: new Date().toISOString(),
            reviewed_at: new Date().toISOString(),
            reviewed_by: reviewerId,
            reviewer_comment: 'MOA dynamically generated and signed by OJT Adviser.'
          })
          .eq('id', addMoaDoc.id)
          .select();

        if (error) throw error;
        docRecord = data[0];
      } else {
        // Create new standard requirement
        const { data, error } = await supabase
          .from('pre_internship_documents')
          .insert({
            internship_id: internshipId,
            document_name: 'Memorandum of Agreement (MOA)',
            file_url: fileUrl,
            status: 'APPROVED',
            submitted_at: new Date().toISOString(),
            reviewed_at: new Date().toISOString(),
            reviewed_by: reviewerId,
            reviewer_comment: 'MOA dynamically generated and signed by OJT Adviser.'
          })
          .select();

        if (error) throw error;
        docRecord = data[0];
      }
    }

    // 2. Automatically update MOA Status to PROCESSED
    await this.updateMOAStatus(internshipId, 'PROCESSED');

    // 3. Save to the new student_moas database table
    try {
      const { data: studentInfo } = await supabase
        .from('student_internships')
        .select('student_id')
        .eq('id', internshipId)
        .single();
      
      if (studentInfo) {
        await supabase
          .from('student_moas')
          .upsert({
            internship_id: internshipId,
            student_id: studentInfo.student_id,
            file_url: fileUrl,
            uploaded_by: reviewerId,
            uploaded_at: new Date().toISOString()
          }, { onConflict: 'internship_id' });
      }
    } catch (dbErr) {
      console.error('Failed to write to student_moas database table:', dbErr);
    }

    return docRecord;
  },

  /**
   * Update a document's status and comment (supports both standard and additional tables)
   */
  async updateDocumentStatus(docId, status, comment, reviewerId) {
    // 1. Try updating pre_internship_documents first
    const { data: stdData } = await supabase
      .from('pre_internship_documents')
      .update({
        status,
        reviewer_comment: comment,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId
      })
      .eq('id', docId)
      .select();

    if (stdData && stdData.length > 0) {
      return stdData[0];
    }

    // 2. If not found in standard documents, update additional_requirements
    const { data: addData, error: addError } = await supabase
      .from('additional_requirements')
      .update({
        status,
        reviewer_comment: comment,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId
      })
      .eq('id', docId)
      .select();

    if (addError) throw addError;
    if (addData && addData.length > 0) {
      return addData[0];
    }

    throw new Error('Document not found in standard or additional requirements.');
  },

  /**
   * Update MOA status for a student
   */
  async updateMOAStatus(internshipId, status) {
    const { data, error } = await supabase
      .from('student_internships')
      .update({ moa_status: status, updated_at: new Date().toISOString() })
      .eq('id', internshipId)
      .select();

    if (error) throw error;
    return data[0];
  },

  /**
   * Approve deployment (Stage 1 -> Stage 2)
   */
  async approveDeployment(internshipId) {
    const response = await fetch('/api/professor/approve-deployment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ internshipId })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to approve deployment on server');
    }

    return data.data;
  },

  /**
   * Add a new document requirement for a student (inserts into additional_requirements table)
   */
  async addDocumentRequirement(internshipId, documentName) {
    const { data, error } = await supabase
      .from('additional_requirements')
      .insert({
        internship_id: internshipId,
        document_name: documentName,
        status: 'NOT_SUBMITTED'
      })
      .select();

    if (error) throw error;
    return data[0];
  },

  /**
   * Remove an additional document requirement (from additional_requirements table)
   */
  async deleteDocumentRequirement(docId) {
    const { error } = await supabase
      .from('additional_requirements')
      .delete()
      .eq('id', docId);

    if (error) throw error;
    return true;
  },

  /**
   * Fetch all Weekly Activity Reports (WAR) for review
   */
  async getWARQueue(professorId) {
    if (!professorId) return [];

    const { data, error } = await supabase
      .from('weekly_activity_reports')
      .select(`
        id,
        week_number,
        week_label,
        summary,
        skills_learned,
        challenges,
        status,
        file_url,
        reviewer_comment,
        submitted_at,
        reviewed_at,
        student_internships!internship_id (
          id,
          student:users!student_id (
            id,
            first_name,
            last_name,
            student_profiles (
              section_id,
              program_sections ( id, name )
            )
          )
        )
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching WAR queue:', error);
      throw error;
    }

    return (data || []).map(war => {
      const student = war.student_internships?.student || {};
      const profile = Array.isArray(student.student_profiles) ? student.student_profiles[0] : student.student_profiles || {};

      let summaryText = war.summary || '';
      if (summaryText.includes('---ACTIVITIES_JSON---')) {
        summaryText = summaryText.split('---ACTIVITIES_JSON---')[0].trim();
      }

      return {
        id: war.id,
        weekNumber: war.week_number,
        weekLabel: war.week_label,
        summary: summaryText,
        skillsLearned: war.skills_learned,
        challenges: war.challenges,
        status: war.status,
        fileUrl: war.file_url || null,
        comment: war.reviewer_comment || '',
        submittedAt: new Date(war.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        studentId: student.id || 'unknown',
        studentName: student.first_name ? `${student.first_name} ${student.last_name}` : 'Unknown Student',
        sectionId: profile?.section_id || 'unassigned',
        sectionName: profile?.program_sections?.name || 'Not Assigned'
      };
    });
  },

  /**
   * Update Weekly Activity Report status and feedback comment
   */
  async updateWARStatus(warId, status, comment, reviewerId) {
    const { data, error } = await supabase
      .from('weekly_activity_reports')
      .update({
        status,
        reviewer_comment: comment,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId
      })
      .eq('id', warId)
      .select();

    if (error) {
      console.error('Error updating WAR status:', error);
      throw error;
    }

    return data[0];
  }
};

