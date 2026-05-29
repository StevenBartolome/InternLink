// src/services/geminiCORScanner.js
// Uses Google Gemini 1.5 Flash (FREE) to scan COR PDFs and extract student info.
// Get your free API key at: https://aistudio.google.com/apikey

import { GoogleGenerativeAI } from '@google/generative-ai';

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
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    // Fallback: return demo data so the app works without a key
    console.warn('[COR Scanner] No Gemini API key set. Using demo data.');
    return getMockScanResult(pdfFile.name);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using gemini-2.5-flash as it is the available flash model for this API key
    console.log('[COR Scanner] Initializing Gemini 2.5 Flash...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text().trim();

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
  } catch (err) {
    console.error('[COR Scanner] Gemini failed, attempting Claude fallback:', err);
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
      console.error('[COR Scanner] Claude fallback also failed:', claudeErr);
      return {
        success: false,
        error: `Gemini Error: ${err.message}. Claude Error: ${claudeErr.message}`,
      };
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
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  const filename = pdfFile.name;
  const match = filename.match(/(\d+(?:\.\d+)?)\s*hrs?/i);
  const fallbackHours = match ? parseFloat(match[1]) : 40.0;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Attendance Scanner] No Gemini API key set. Using fallback parse.');
    return {
      success: true,
      grandTotalHours: fallbackHours,
      daysPresent: 5,
      startDate: null,
      endDate: null,
      loggedDates: []
    };
  }

  const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

  const prompt = `You are an expert document scanner. Analyze this student OJT (On-the-Job Training) supervisor-signed attendance report sheet or PDF.

Find ONLY the "Total this Period" value — this is the hours rendered SPECIFICALLY for the date range covered by this report sheet, NOT the cumulative or grand total. It is typically labeled as "Total this Period", "Total Hours this Period", or appears in the middle summary row between "Previous Total" and "Total Hours Served".

Do NOT return the "Grand Total", "Total Hours Served", or "Previous Total + this Period" combined value.

Also find the date range covered by this report. It is typically found at the top near the Name and Company fields. Return the start date and end date in YYYY-MM-DD format.

Return the result in JSON format ONLY:
{
  "grandTotalHours": 40.5,
  "daysPresent": 5,
  "startDate": "2025-01-01",
  "endDate": "2025-01-07",
  "loggedDates": ["2025-01-01", "2025-01-02", "2025-01-03", "2025-01-06", "2025-01-07"]
}

Where "grandTotalHours" must be the "Total this Period" value only (the new hours for this specific report).
Also, extract the exact list of all individual dates that have logged hours recorded in the table rows and return them in "loggedDates" as an array of YYYY-MM-DD strings.
If you cannot find a value, return null for that field (or empty array for loggedDates). Return only raw JSON without any markdown formatting.`;

  let lastError = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`[Attendance Scanner] Trying model: ${modelName}`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });

      const base64Data = await fileToBase64(pdfFile);
      const mimeType = pdfFile.type || 'application/pdf';

      const result = await model.generateContent([
        { inlineData: { mimeType, data: base64Data } },
        prompt,
      ]);

      const text = result.response.text().trim();
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
        loggedDates: Array.isArray(parsed.loggedDates) ? parsed.loggedDates : []
      };
    } catch (err) {
      const is503 = err.message && (err.message.includes('503') || err.message.includes('high demand') || err.message.includes('overloaded'));
      console.warn(`[Attendance Scanner] Model ${modelName} failed${is503 ? ' (503 overloaded)' : ''}: ${err.message}`);
      lastError = err;
      if (!is503) break; // Only retry on 503 overload — other errors won't be fixed by switching models
    }
  }

  // If all Gemini models failed, attempt Claude fallback
  console.error('[Attendance Scanner] Gemini models failed, attempting Claude fallback...', lastError?.message);
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
        loggedDates: Array.isArray(result.data.loggedDates) ? result.data.loggedDates : []
    };
  } catch (claudeErr) {
    console.error('[Attendance Scanner] Claude fallback also failed:', claudeErr);
    return {
      success: false,
      grandTotalHours: fallbackHours,
      daysPresent: 5,
      startDate: null,
      endDate: null,
      loggedDates: [],
      error: `Gemini Error: ${lastError?.message}. Claude Error: ${claudeErr.message}`
    };
  }
}
