import { supabase } from './supabaseClient';

export const adminService = {
  /**
   * Fetch all programs with their internship configuration
   */
  async getProgramConfigs() {
    const { data, error } = await supabase
      .from('programs')
      .select(`
        *,
        required_documents:program_required_documents(*)
      `)
      .order('code', { ascending: true });

    if (error) throw error;

    return data.map(p => ({
      id: p.id,
      course: p.code,
      courseFullName: p.name,
      requiredHours: p.required_hours,
      ojtSubjectCode: p.ojt_subject_code || '',
      deadlines: {
        docSubmission: p.doc_submission_deadline || '',
        portfolioSubmission: p.portfolio_submission_deadline || ''
      },
      requiredDocuments: (p.required_documents || []).map(d => ({
        id: d.id,
        name: d.document_name
      }))
    }));
  },

  /**
   * Update program configuration
   */
  async updateProgramConfig(programId, updates) {
    const { data, error } = await supabase
      .from('programs')
      .update({
        required_hours: updates.requiredHours,
        ojt_subject_code: updates.ojtSubjectCode,
        doc_submission_deadline: updates.deadlines?.docSubmission || null,
        portfolio_submission_deadline: updates.deadlines?.portfolioSubmission || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', programId)
      .select();

    if (error) throw error;
    return data[0];
  },

  /**
   * Add a master document requirement to a program
   */
  async addMasterDocument(programId, documentName) {
    const { data, error } = await supabase
      .from('program_required_documents')
      .insert({
        program_id: programId,
        document_name: documentName
      })
      .select();

    if (error) throw error;
    return data[0];
  },

  /**
   * Remove a master document requirement
   */
  async deleteMasterDocument(docId) {
    const { error } = await supabase
      .from('program_required_documents')
      .delete()
      .eq('id', docId);

    if (error) throw error;
    return true;
  },

  /**
   * Sync/Populate a student's checklist from the program's master list
   * This is useful for both new registrations and existing users.
   */
  async syncStudentChecklist(internshipId, programId) {
    try {
      const response = await fetch('/api/student/sync-checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ internshipId, programId })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync checklist on server');
      }

      return data.insertedData || [];
    } catch (err) {
      console.error('Error in syncStudentChecklist:', err);
      throw err;
    }
  },

  /**
   * Toggle a document requirement for a specific program
   */
  async toggleProgramDocument(programId, documentName, isEnabled) {
    if (isEnabled) {
      const { error } = await supabase
        .from('program_required_documents')
        .insert({ program_id: programId, document_name: documentName });
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('program_required_documents')
        .delete()
        .eq('program_id', programId)
        .eq('document_name', documentName);
      if (error) throw error;
    }
    return true;
  },

  /**
   * Remove a document name from ALL programs
   */
  async deleteGlobalDocument(documentName) {
    // 1. Delete from program master configurations
    const { error: programError } = await supabase
      .from('program_required_documents')
      .delete()
      .eq('document_name', documentName);
    
    if (programError) throw programError;

    // 2. Delete from student checklists so it instantly disappears from students and professors
    const { error: studentError } = await supabase
      .from('pre_internship_documents')
      .delete()
      .eq('document_name', documentName);

    if (studentError) throw studentError;
    return true;
  },

  /**
   * Rename a document across ALL programs and student checklists
   */
  async renameGlobalDocument(oldName, newName) {
    // 1. Rename in program master configurations
    const { error: programError } = await supabase
      .from('program_required_documents')
      .update({ document_name: newName })
      .eq('document_name', oldName);
    
    if (programError) throw programError;

    // 2. Rename in student pre-internship checklists to preserve uploads/reviews
    const { error: studentError } = await supabase
      .from('pre_internship_documents')
      .update({ document_name: newName })
      .eq('document_name', oldName);
    
    if (studentError) {
      console.warn('Could not update document name in student checklists:', studentError.message);
    }
    
    return true;
  }
};
