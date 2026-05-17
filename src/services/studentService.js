import { supabase } from './supabaseClient';

export const studentService = {
  /**
   * Get all pre-internship documents for the current student's internship
   */
  async getPreInternshipDocuments(internshipId) {
    if (!internshipId) return [];

    const { data, error } = await supabase
      .from('pre_internship_documents')
      .select('*')
      .eq('internship_id', internshipId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching pre-internship documents:', error);
      throw error;
    }

    return data.map(doc => ({
      id: doc.id,
      name: doc.document_name,
      status: this.mapStatus(doc.status),
      comment: doc.reviewer_comment,
      fileUrl: doc.file_url,
      submittedAt: doc.submitted_at
    }));
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
    }
  },

  /**
   * Upload a document
   */
  async uploadDocument(docId, file) {
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

      // 3. Update document record
      const { data, error: updateError } = await supabase
        .from('pre_internship_documents')
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
  }
};
