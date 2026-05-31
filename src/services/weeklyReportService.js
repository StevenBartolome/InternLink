import { supabase } from './supabaseClient';
import { openRouterService } from './openRouterService';

export const weeklyReportService = {
  /**
   * Get all weekly activity reports for the internship
   */
  async getWeeklyReports(internshipId) {
    if (!internshipId) return [];

    const { data, error } = await supabase
      .from('weekly_activity_reports')
      .select('*')
      .eq('internship_id', internshipId)
      .order('week_number', { ascending: false });

    if (error) {
      console.error('Error fetching weekly reports:', error);
      throw error;
    }

    return (data || []).map(report => {
      let selectedActs = null;
      let summaryText = report.summary || '';
      if (summaryText.includes('---ACTIVITIES_JSON---')) {
        const parts = summaryText.split('---ACTIVITIES_JSON---');
        summaryText = parts[0].trim();
        try {
          selectedActs = JSON.parse(parts[1].trim());
        } catch (e) {
          console.error("Error parsing activities metadata:", e);
        }
      }
      return {
        ...report,
        summary: summaryText,
        selected_activities: selectedActs
      };
    });
  },

  /**
   * Fetch all daily activities to let the user select which ones to include in the WAR
   */
  async getDailyActivitiesForSelection(internshipId) {
    if (!internshipId) return [];

    const { data, error } = await supabase
      .from('daily_activities')
      .select('id, log_date, description, created_at')
      .eq('internship_id', internshipId)
      .order('log_date', { ascending: false });

    if (error) {
      console.error('Error fetching daily activities:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Submit/Save a Weekly Activity Report (with optional PDF/image file upload)
   */
  async submitWeeklyReport(reportData, file = null) {
    const { internship_id, week_number, week_label, summary, skills_learned, challenges, status } = reportData;
    let fileUrl = reportData.file_url || null;
    const reportStatus = status || 'PENDING';

    try {
      // 1. If an actual file is selected, upload it first
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${internship_id}-${week_number}-${Math.random()}.${fileExt}`;
        const filePath = `weekly-reports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
      }

      // 2. Upsert into weekly_activity_reports table
      const { data, error } = await supabase
        .from('weekly_activity_reports')
        .upsert({
          internship_id,
          week_number,
          week_label,
          summary,
          skills_learned,
          challenges,
          file_url: fileUrl, // Store upload URL
          status: reportStatus,
          submitted_at: new Date().toISOString()
        }, {
          onConflict: 'internship_id,week_number'
        })
        .select();

      if (error) throw error;

      const report = data[0];
      if (report && report.summary && report.summary.includes('---ACTIVITIES_JSON---')) {
        const parts = report.summary.split('---ACTIVITIES_JSON---');
        report.summary = parts[0].trim();
        try {
          report.selected_activities = JSON.parse(parts[1].trim());
        } catch (e) {
          console.error("Error parsing activities metadata:", e);
        }
      }
      return report;
    } catch (err) {
      console.error('Error in submitWeeklyReport:', err);
      throw err;
    }
  },

  /**
   * Automatically generate Weekly Activity Report content using Gemini 2.5 Flash
   * based on the selected daily activities
   */
  async generateWARWithAI(activities) {
    const activitiesText = activities
      .map(act => `Date: ${act.log_date}\nActivity: ${act.description}`)
      .join('\n\n');

    let prompt = `You are an AI assistant designed to help college students write highly professional Weekly Activity Reports (WAR) for their On-the-Job Training (OJT) or internship.
Analyze the following daily activities logged by the student during this week:

${activitiesText}

Generate a weekly report containing the following three parts in JSON format ONLY:
{
  "summary": "A concise, formal, and professionally written summary paragraph that aggregates the tasks, duties, and achievements accomplished during the week.",
  "skills_learned": "A bulleted or structured list of professional, technical, or soft skills acquired or reinforced through these activities.",
  "challenges": "A brief reflection on minor obstacles, learning curves, or challenges encountered during the week and how they were handled or resolved constructively."
}

Do not include any explanation or markdown formatting outside the JSON block. Ensure the tone is extremely professional, clear, and academic.`;

    try {
      if (openRouterService.isConfigured()) {
        try {
          console.log('[WAR Generator] Initializing OpenRouter (Free Auto-Router)...');
          const text = await openRouterService.generateContent(prompt);
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error('Could not parse AI response as JSON');
          console.log('[WAR Generator] OpenRouter succeeded.');
          return JSON.parse(jsonMatch[0]);
        } catch (orErr) {
          console.warn('[WAR Generator] OpenRouter failed, attempting Claude fallback:', orErr.message);
          throw orErr;
        }
      } else {
        throw new Error('OpenRouter not configured');
      }
    } catch (primaryErr) {
      // Claude Fallback
      try {
        console.log('[WAR Generator] Trying Claude backup...');
        const response = await fetch('/api/claude/generate-war', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `You are an AI assistant designed to help college students write highly professional Weekly Activity Reports (WAR) for their On-the-Job Training (OJT) or internship.
Analyze the following daily activities logged by the student during this week:

${activities.map(act => `Date: ${act.log_date}\nActivity: ${act.description}`).join('\n\n')}

Generate a weekly report containing the following three parts in JSON format ONLY:
{
  "summary": "A concise, formal, and professionally written summary paragraph that aggregates the tasks, duties, and achievements accomplished during the week.",
  "skills_learned": "A bulleted or structured list of professional, technical, or soft skills acquired or reinforced through these activities.",
  "challenges": "A brief reflection on minor obstacles, learning curves, or challenges encountered during the week and how they were handled or resolved constructively."
}

Do not include any explanation or markdown formatting outside the JSON block. Ensure the tone is extremely professional, clear, and academic.` })
        });

        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || 'Claude API failed');

        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Could not parse Claude AI response as JSON');

        console.log('[WAR Generator] Claude backup succeeded.');
        return JSON.parse(jsonMatch[0]);
      } catch (claudeErr) {
        console.error('[WAR Generator] All AI options failed or unconfigured. Using mock data fallback.', claudeErr);
        return this.getMockWARGeneration();
      }
    }
  },

  /**
   * Refine the existing Weekly Activity Report based on custom user feedback instructions
   */
  async refineWARWithAI(currentReport, instruction) {

      let prompt = `You are a professional academic writing assistant. You have already generated a Weekly Activity Report for a student's internship:

Current Report:
Summary: ${currentReport.summary}
Skills Learned: ${currentReport.skills_learned}
Challenges: ${currentReport.challenges}

The student wants to modify or refine this report with the following specific instruction:
"${instruction}"

Refine the report according to their instruction. Return the updated report in JSON format ONLY:
{
  "summary": "The updated/refined summary",
  "skills_learned": "The updated/refined skills learned",
  "challenges": "The updated/refined challenges faced"
}

Do not include any explanation or markdown formatting outside the JSON block. Preserve the professional, academic tone.`;

      try {
        if (openRouterService.isConfigured()) {
          try {
            console.log('[WAR Refiner] Initializing OpenRouter (Free Auto-Router)...');
            const text = await openRouterService.generateContent(prompt);
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Could not parse AI response as JSON');
            console.log('[WAR Refiner] OpenRouter succeeded.');
            return JSON.parse(jsonMatch[0]);
          } catch (orErr) {
            console.warn('[WAR Refiner] OpenRouter failed, attempting Claude fallback:', orErr.message);
            throw orErr;
          }
        } else {
          throw new Error('OpenRouter not configured');
        }
      } catch (primaryErr) {
        // Claude Fallback
        try {
          console.log('[WAR Refiner] Trying Claude backup...');
          const response = await fetch('/api/claude/generate-war', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `You are a professional academic writing assistant. You have already generated a Weekly Activity Report for a student's internship:

Current Report:
Summary: ${currentReport.summary}
Skills Learned: ${currentReport.skills_learned}
Challenges: ${currentReport.challenges}

The student wants to modify or refine this report with the following specific instruction:
"${instruction}"

Refine the report according to their instruction. Return the updated report in JSON format ONLY:
{
  "summary": "The updated/refined summary",
  "skills_learned": "The updated/refined skills learned",
  "challenges": "The updated/refined challenges faced"
}

Do not include any explanation or markdown formatting outside the JSON block. Preserve the professional, academic tone.` })
          });

          const result = await response.json();
          if (!response.ok || !result.success) throw new Error(result.error || 'Claude API failed');

          const jsonMatch = result.text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error('Could not parse Claude AI response as JSON');

          console.log('[WAR Refiner] Claude backup succeeded.');
          return JSON.parse(jsonMatch[0]);
        } catch (claudeErr) {
          console.error('[WAR Refiner] Claude fallback also failed:', claudeErr);
          throw new Error(primaryErr.message || 'Failed to refine report with AI.');
        }
      }
    },

  /**
   * Realistic fallback mock data when no API key is configured
   */
  getMockWARGeneration() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          summary: "This week was focused on software maintenance and system integration. Successfully troubleshooted and resolved performance bottlenecks in database retrieval queries. Conducted minor UI revisions on the dashboard to ensure responsive design standards are met.",
          skills_learned: "• Advanced database indexing and query optimization\n• Frontend performance tuning using CSS properties\n• Professional communication and collaborative software testing workflows",
          challenges: "Faced initial difficulty mapping relational data from Supabase due to missing indices, but successfully overcame this by adding strategic foreign key indexes and analyzing database logs."
        });
      }, 1500);
    });
  }
};
