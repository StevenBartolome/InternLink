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
        company:companies(name),
        position,
        moa_status,
        is_deployed,
        current_stage,
        student:users!student_id (
          first_name,
          last_name,
          profile:student_profiles!id (
            student_id, 
            program_id,
            section_id,
            program_sections(id, name)
          )
        ),
        docs:pre_internship_documents(*)
      `)
      .in('current_stage', ['PRE_INTERNSHIP', 'DURING_INTERNSHIP'])
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

      return {
        internshipId: item.id,
        studentId: item.student_id,
        programId: profileData?.program_id,
        studentNo: profileData?.student_id || 'Not Set',
        studentName: `${item.student?.first_name} ${item.student?.last_name}`,
        company: item.company?.name || 'Not Applied',
        position: item.position,
        moaStatus: item.moa_status,
        deploymentApproved: item.is_deployed,
        sectionId: profileData?.section_id,
        sectionName: profileData?.program_sections?.name || 'Not Assigned',
        docs: [...standardDocs, ...additionalDocs]
      };
    });
  },

  /**
   * Update a document's status and comment (supports both standard and additional tables)
   */
  async updateDocumentStatus(docId, status, comment, reviewerId) {
    // 1. Try updating pre_internship_documents first
    const { data: stdData, error: stdError } = await supabase
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
  }
};
