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
   * Enforces a 2-hour maximum overtime limit and an absolute 7:00 PM (19:00) cutoff.
   */
  async clockOut(logId, internshipId, timeIn, usualTimeOut = '17:00') {
    const now = new Date();
    
    // Parse timeIn to extract the local date of the shift
    const timeInDate = new Date(timeIn);
    const year = timeInDate.getFullYear();
    const month = timeInDate.getMonth();
    const date = timeInDate.getDate();

    // 1. Parse standard usualTimeOut (HH:mm)
    const [outHrs, outMins] = (usualTimeOut || '17:00').split(':').map(Number);
    const shiftEndTime = new Date(year, month, date, outHrs, outMins, 0);

    // 2. Maximum overtime is 2 hours
    const maxOtEndTime = new Date(shiftEndTime.getTime() + 2 * 60 * 60 * 1000);

    // 3. Absolute cap is 7:00 PM (19:00) on that shift day
    const absoluteCapTime = new Date(year, month, date, 19, 0, 0);

    // 4. Maximum allowed credited end time is the smaller of shiftEndTime+2h or 7 PM
    const allowedEndTime = new Date(Math.min(maxOtEndTime.getTime(), absoluteCapTime.getTime()));

    let timeOutToSave = now;
    let wasCapped = false;
    let capReason = '';

    if (now > allowedEndTime) {
      timeOutToSave = allowedEndTime;
      wasCapped = true;
      if (maxOtEndTime.getTime() < absoluteCapTime.getTime()) {
        capReason = 'daily overtime limit (maximum 2 hours)';
      } else {
        capReason = 'absolute 7:00 PM cutoff rule';
      }
    }

    const diffMs = timeOutToSave - timeInDate;
    const hoursRendered = Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));
    const nowStr = now.toISOString();
    const timeOutIso = timeOutToSave.toISOString();

    // 1. Close this session
    const { data: updatedLog, error: updateError } = await supabase
      .from('attendance_logs')
      .update({
        time_out:       timeOutIso,
        hours_rendered: hoursRendered,
        status:         'LOGGED',
        updated_at:     nowStr
      })
      .eq('id', logId)
      .select()
      .single();

    if (updateError) throw updateError;

    const { data: allLogs, error: fetchError } = await supabase
      .from('attendance_logs')
      .select('hours_rendered')
      .eq('internship_id', internshipId)
      .in('status',        ['LOGGED', 'DEDUCTED']);

    if (fetchError) throw fetchError;

    const totalHours   = allLogs.reduce((sum, l) => sum + (l.hours_rendered || 0), 0);
    const roundedHours = Math.round(totalHours);

    const { data: internData } = await supabase
      .from('student_internships')
      .select('required_hours, current_stage')
      .eq('id', internshipId)
      .single();

    const updatePayload = { rendered_hours: roundedHours, updated_at: nowStr };

    if (internData && roundedHours >= internData.required_hours && internData.current_stage === 'DURING_INTERNSHIP') {
      updatePayload.current_stage = 'POST_INTERNSHIP';
    }

    // 3. Sync to the internship record
    const { error: internError } = await supabase
      .from('student_internships')
      .update(updatePayload)
      .eq('id', internshipId);

    if (internError) throw internError;

    return { 
      log: updatedLog, 
      totalHours: roundedHours,
      wasCapped,
      capReason,
      allowedEndTime: timeOutIso
    };
  }
};
