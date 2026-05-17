import { supabase } from './supabaseClient';

export const attendanceService = {
  /**
   * Fetch all logs for the current student's internship
   */
  async getAttendanceLogs(internshipId) {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('internship_id', internshipId)
      .order('log_date', { ascending: false })
      .order('time_in',  { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Fetch the current active (IN_PROGRESS) session for today, if any.
   * Multiple sessions per day are allowed, so we grab the most recent one.
   */
  async getTodayLog(internshipId) {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('internship_id', internshipId)
      .eq('log_date',      todayStr)
      .eq('status',        'IN_PROGRESS')
      .order('time_in',    { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data; // null if student is not currently clocked in
  },

  /**
   * Clock in — always inserts a fresh session row.
   * The unique constraint on (internship_id, log_date) must be dropped
   * to allow multiple sessions per day.
   */
  async clockIn(internshipId) {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const nowStr   = new Date().toISOString();

    const { data, error } = await supabase
      .from('attendance_logs')
      .insert({
        internship_id: internshipId,
        log_date:      todayStr,
        time_in:       nowStr,
        status:        'IN_PROGRESS'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Clock out — closes the active session and re-sums all hours.
   */
  async clockOut(logId, internshipId, timeIn) {
    const nowStr        = new Date().toISOString();
    const diffMs        = new Date(nowStr) - new Date(timeIn);
    const hoursRendered = Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));

    // 1. Close this session
    const { data: updatedLog, error: updateError } = await supabase
      .from('attendance_logs')
      .update({
        time_out:       nowStr,
        hours_rendered: hoursRendered,
        status:         'LOGGED',
        updated_at:     nowStr
      })
      .eq('id', logId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 2. Sum ALL logged sessions across all days
    const { data: allLogs, error: fetchError } = await supabase
      .from('attendance_logs')
      .select('hours_rendered')
      .eq('internship_id', internshipId)
      .eq('status',        'LOGGED');

    if (fetchError) throw fetchError;

    const totalHours   = allLogs.reduce((sum, l) => sum + (l.hours_rendered || 0), 0);
    const roundedHours = Math.round(totalHours);

    // 3. Sync to the internship record
    const { error: internError } = await supabase
      .from('student_internships')
      .update({ rendered_hours: roundedHours, updated_at: nowStr })
      .eq('id', internshipId);

    if (internError) throw internError;

    return { log: updatedLog, totalHours: roundedHours };
  }
};
