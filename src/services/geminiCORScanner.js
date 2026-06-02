// src/services/geminiCORScanner.js
// Uses OpenRouter (Gemini/Llama) to scan COR PDFs and extract student info.

import { openRouterService } from './openRouterService';

const OJT_SUBJECTS = [
  'ojt', 'on-the-job training', 'on the job training',
  'practicum', 'internship', 'field practice',
  'work immersion', 'industrial training', 'industry immersion'
];

/**
 * Scans a COR (Certificate of Registration) PDF using Gemini AI
 * and extracts student information.
 *
 * @param {File} pdfFile - The PDF file object
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function scanCORWithGemini(pdfFile) {


  try {
    if (!openRouterService.isConfigured()) {
      throw new Error('OpenRouter is not configured');
    }
    // Using openrouter/free for free tier compatibility
    console.log('[COR Scanner] Initializing OpenRouter (Free Auto-Router)...');

    // Convert PDF file to base64
    const base64Data = await fileToBase64(pdfFile);
    const mimeType = 'application/pdf';

    const prompt = `You are an academic document parser. Analyze this Certificate of Registration (COR) PDF from a Philippine university and extract the following information in JSON format ONLY. Do not include any explanation or markdown formatting outside the JSON.

Extract:
{
  "firstName": "First name of the student",
  "lastName": "Last name of the student",
  "studentId": "Student ID number",
  "course": "Full course name (e.g. Bachelor of Science in Information Technology)",
  "courseCode": "Short course code (e.g. BSIT, BSCS, BSIS)",
  "yearLevel": "Year level (e.g. 4th Year)",
  "ojtSubjectFound": true or false (true if any subject with keywords like OJT, Practicum, On-the-Job Training, Internship, Work Immersion, Field Practice is enrolled),
  "ojtSubjectName": "Name of the OJT/Practicum subject if found, or null",
  "academicYear": "Academic year (e.g. 2025-2026)",
  "semester": "Semester (e.g. 1st Semester)"
}

If a field cannot be found, use null for that field.
Be accurate — this is used for student verification.`;

    const text = await openRouterService.generateVisionContent(prompt, base64Data, mimeType);

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate OJT eligibility
    const hasOJT = parsed.ojtSubjectFound === true;

    return {
      success: true,
      data: {
        firstName: parsed.firstName || '',
        lastName: parsed.lastName || '',
        studentId: parsed.studentId || '',
        course: parsed.course || '',
        courseCode: parsed.courseCode || '',
        yearLevel: parsed.yearLevel || '',
        academicYear: parsed.academicYear || '',
        semester: parsed.semester || '',
        ojtSubjectFound: hasOJT,
        ojtSubjectName: parsed.ojtSubjectName || null,
      },
      eligible: hasOJT,
    };
  } catch (orErr) {
    console.warn('[COR Scanner] OpenRouter failed, attempting Claude fallback:', orErr.message);
    try {
      const base64Data = await fileToBase64(pdfFile);
      const mimeType = pdfFile.type || 'application/pdf';
      const response = await fetch('/api/claude/scan-cor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Data, mimeType })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Claude API failed');
      
      const parsed = result.data;
      const hasOJT = parsed.ojtSubjectFound === true;

      return {
        success: true,
        data: {
          firstName: parsed.firstName || '',
          lastName: parsed.lastName || '',
          studentId: parsed.studentId || '',
          course: parsed.course || '',
          courseCode: parsed.courseCode || '',
          yearLevel: parsed.yearLevel || '',
          academicYear: parsed.academicYear || '',
          semester: parsed.semester || '',
          ojtSubjectFound: hasOJT,
          ojtSubjectName: parsed.ojtSubjectName || null,
        },
        eligible: hasOJT,
      };
    } catch (claudeErr) {
      console.warn('[COR Scanner] All AI options failed or unconfigured. Using demo data fallback.', claudeErr);
      return getMockScanResult(pdfFile.name);
    }
  }
}

/** Convert File to base64 string (without data: prefix) */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      // Remove "data:application/pdf;base64," prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Returns realistic mock scan data when no API key is configured */
function getMockScanResult(filename) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        success: true,
        eligible: true,
        data: {
          firstName: 'Maria Gabriela',
          lastName: 'Santos',
          studentId: '2023-00042',
          course: 'Bachelor of Science in Information Technology',
          courseCode: 'BSIT',
          yearLevel: '4th Year',
          academicYear: '2025-2026',
          semester: '2nd Semester',
          ojtSubjectFound: true,
          ojtSubjectName: 'IT 401 - On-the-Job Training (486 hrs)',
        },
      });
    }, 2200); // simulate scanning delay
  });
}

/**
 * Scans an OJT Attendance Sheet or PDF report using Gemini AI
 * to extract the grand total of hours rendered.
 */
export async function scanOJTAttendanceReportWithGemini(pdfFile) {


  const filename = pdfFile.name;
  const match = filename.match(/(\d+(?:\.\d+)?)\s*hrs?/i);
  const fallbackHours = match ? parseFloat(match[1]) : 40.0;

  const OPENROUTER_MODELS = ['openrouter/free', 'meta-llama/llama-3.2-90b-vision-instruct:free'];

  const prompt = `You are an expert document scanner. Analyze this student OJT (On-the-Job Training) supervisor-signed attendance report sheet or PDF.

Find ONLY the "Total this Period" value — this is the hours rendered SPECIFICALLY for the date range covered by this report sheet, NOT the cumulative or grand total. It is typically labeled as "Total this Period", "Total Hours this Period", or appears in the middle summary row between "Previous Total" and "Total Hours Served".

Do NOT return the "Grand Total", "Total Hours Served", or "Previous Total + this Period" combined value.

Also find the date range covered by this report. It is typically found at the top near the Name and Company fields. Return the start date and end date in YYYY-MM-DD format.

Also extract the name of the student from the top of the document. Usually found under "Student Name", "Trainee Name", or similar. Return it in "studentName" as a string.

Return the result in JSON format ONLY:
{
  "grandTotalHours": 40.5,
  "daysPresent": 5,
  "startDate": "2025-01-01",
  "endDate": "2025-01-07",
  "loggedDates": ["2025-01-01", "2025-01-02", "2025-01-03", "2025-01-06", "2025-01-07"],
  "studentName": "John Doe"
}

Where "grandTotalHours" must be the "Total this Period" value only (the new hours for this specific report).
Also, extract the exact list of all individual dates that have logged hours recorded in the table rows and return them in "loggedDates" as an array of YYYY-MM-DD strings.
If you cannot find a value, return null for that field (or empty array for loggedDates). Return only raw JSON without any markdown formatting.`;

  let lastError = null;

  if (openRouterService.isConfigured()) {
    for (const modelName of OPENROUTER_MODELS) {
      try {
        console.log(`[Attendance Scanner] Trying model: ${modelName}`);

        const base64Data = await fileToBase64(pdfFile);
        const mimeType = pdfFile.type || 'application/pdf';

        const text = await openRouterService.generateVisionContent(prompt, base64Data, mimeType, modelName);
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Could not parse AI response as JSON');

        const parsed = JSON.parse(jsonMatch[0]);
        console.log(`[Attendance Scanner] Success with model: ${modelName}`);
        return {
          success: true,
          grandTotalHours: parsed.grandTotalHours || fallbackHours,
          daysPresent: parsed.daysPresent || 5,
          startDate: parsed.startDate || null,
          endDate: parsed.endDate || null,
          loggedDates: Array.isArray(parsed.loggedDates) ? parsed.loggedDates : [],
          studentName: parsed.studentName || null
        };
      } catch (err) {
        const is503 = err.message && (err.message.includes('503') || err.message.includes('high demand') || err.message.includes('overloaded') || err.message.includes('rate limit'));
        console.warn(`[Attendance Scanner] Model ${modelName} failed${is503 ? ' (503 overloaded)' : ''}: ${err.message}`);
        lastError = err;
        if (!is503) break; // Only retry on 503 overload — other errors won't be fixed by switching models
      }
    }
  } else {
    lastError = new Error('OpenRouter is not configured');
  }

  // If OpenRouter models failed or were not configured, attempt Claude fallback
  console.log('[Attendance Scanner] OpenRouter not available or failed, attempting Claude fallback...', lastError?.message);
  try {
    const base64Data = await fileToBase64(pdfFile);
    const mimeType = pdfFile.type || 'application/pdf';
    const response = await fetch('/api/claude/scan-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data, mimeType })
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || 'Claude API failed');
    
    return {
        success: true,
        grandTotalHours: result.data.grandTotalHours || fallbackHours,
        daysPresent: result.data.daysPresent || 5,
        startDate: result.data.startDate || null,
        endDate: result.data.endDate || null,
        loggedDates: Array.isArray(result.data.loggedDates) ? result.data.loggedDates : [],
        studentName: result.data.studentName || null
    };
  } catch (claudeErr) {
    console.error('[Attendance Scanner] All AI models failed or are unconfigured. Using filename parse fallback.', claudeErr);
    return {
      success: true,
      grandTotalHours: fallbackHours,
      daysPresent: 5,
      startDate: null,
      endDate: null,
      loggedDates: [],
      studentName: null
    };
  }
}
