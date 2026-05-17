import { supabase } from './supabaseClient';

export const ojtProfessorService = {
  /**
   * Fetch all students pending document review (Pre-Internship stage)
   */
  async getDocumentQueue() {
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
          profile:student_profiles!id (student_id, program_id)
        ),
        docs:pre_internship_documents(*)
      `)
      .eq('current_stage', 'PRE_INTERNSHIP')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      internshipId: item.id,
      studentId: item.student_id,
      programId: item.student?.profile?.[0]?.program_id,
      studentNo: item.student?.profile?.[0]?.student_id || 'Not Set',
      studentName: `${item.student?.first_name} ${item.student?.last_name}`,
      company: item.company?.name || 'Not Applied',
      position: item.position,
      moaStatus: item.moa_status,
      deploymentApproved: item.is_deployed,
      docs: (item.docs || []).map(doc => ({
        id: doc.id,
        name: doc.document_name,
        status: doc.status,
        submittedAt: doc.submitted_at ? new Date(doc.submitted_at).toLocaleDateString() : 'Not Submitted',
        fileUrl: doc.file_url,
        comment: doc.reviewer_comment
      }))
    }));
  },

  /**
   * Update a document's status and comment
   */
  async updateDocumentStatus(docId, status, comment, reviewerId) {
    const { data, error } = await supabase
      .from('pre_internship_documents')
      .update({
        status,
        reviewer_comment: comment,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId
      })
      .eq('id', docId)
      .select();

    if (error) throw error;
    return data[0];
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
    const { data, error } = await supabase
      .from('student_internships')
      .update({
        is_deployed: true,
        current_stage: 'DURING_INTERNSHIP',
        deployment_approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', internshipId)
      .select();

    if (error) throw error;
    return data[0];
  },

  /**
   * Add a new document requirement for a student
   */
  async addDocumentRequirement(internshipId, documentName) {
    const { data, error } = await supabase
      .from('pre_internship_documents')
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
   * Remove a document requirement
   */
  async deleteDocumentRequirement(docId) {
    const { error } = await supabase
      .from('pre_internship_documents')
      .delete()
      .eq('id', docId);

    if (error) throw error;
    return true;
  }
};
