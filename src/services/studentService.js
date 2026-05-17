import { supabase } from './supabaseClient';

export const studentService = {
  /**
   * Get all pre-internship documents for the current student's internship
   */
  async getPreInternshipDocuments(internshipId) {
    if (!internshipId) return [];

    // Fetch standard documents
    const { data: standardData, error: standardError } = await supabase
      .from('pre_internship_documents')
      .select('*')
      .eq('internship_id', internshipId)
      .order('created_at', { ascending: true });

    if (standardError) {
      console.error('Error fetching pre-internship documents:', standardError);
      throw standardError;
    }

    // Fetch additional/custom documents
    const { data: additionalData, error: additionalError } = await supabase
      .from('additional_requirements')
      .select('*')
      .eq('internship_id', internshipId)
      .order('created_at', { ascending: true });

    if (additionalError) {
      console.warn('Error fetching additional requirements, table may not be live yet:', additionalError.message);
    }

    const mappedStandard = (standardData || []).map(doc => ({
      id: doc.id,
      name: doc.document_name,
      status: this.mapStatus(doc.status),
      comment: doc.reviewer_comment,
      fileUrl: doc.file_url,
      submittedAt: doc.submitted_at,
      isAdditional: false
    }));

    const mappedAdditional = (additionalData || []).map(doc => ({
      id: doc.id,
      name: doc.document_name,
      status: this.mapStatus(doc.status),
      comment: doc.reviewer_comment,
      fileUrl: doc.file_url,
      submittedAt: doc.submitted_at,
      isAdditional: true
    }));

    return [...mappedStandard, ...mappedAdditional];
  },

  /**
   * Helper to map DB status to UI status labels
   */
  mapStatus(dbStatus) {
    switch (dbStatus) {
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected - re-upload';
      case 'PENDING': return 'Pending review';
      case 'NOT_SUBMITTED': return 'Not submitted';
      default: return 'Not submitted';
      case 'Approved': return 'Approved';
      case 'Pending review': return 'Pending review';
    }
  },

  /**
   * Upload a document
   */
  async uploadDocument(docId, file, isAdditional = false) {
    try {
      // 1. Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${docId}-${Math.random()}.${fileExt}`;
      const filePath = `pre-internship/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // 3. Update document record (target either pre_internship_documents or additional_requirements)
      const targetTable = isAdditional ? 'additional_requirements' : 'pre_internship_documents';
      const { data, error: updateError } = await supabase
        .from(targetTable)
        .update({
          file_url: publicUrl,
          status: 'PENDING',
          submitted_at: new Date().toISOString()
        })
        .eq('id', docId)
        .select();

      if (updateError) throw updateError;
      return data[0];
    } catch (err) {
      console.error('Error in uploadDocument:', err);
      throw err;
    }
  },

  /**
   * Undo submission of a document (resets status to NOT_SUBMITTED and clears file_url)
   */
  async undoSubmission(docId, isAdditional = false) {
    try {
      const targetTable = isAdditional ? 'additional_requirements' : 'pre_internship_documents';
      const { data, error } = await supabase
        .from(targetTable)
        .update({
          file_url: null,
          status: 'NOT_SUBMITTED',
          submitted_at: null
        })
        .eq('id', docId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error('Error in undoSubmission:', err);
      throw err;
    }
  }
};
