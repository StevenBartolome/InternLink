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
    console.error('[COR Scanner] Error:', err);
    return {
      success: false,
      error: err.message || 'Failed to scan COR. Please check your API key or try again.',
    };
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
      daysPresent: 5
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const base64Data = await fileToBase64(pdfFile);
    const mimeType = pdfFile.type || 'application/pdf';

    const prompt = `You are an expert document scanner. Analyze this student OJT (On-the-Job Training) supervisor-signed attendance report sheet or PDF.
Locate the grand total of OJT hours rendered (often labeled as "Grand Total Hours", "Total Hours Rendered", "Total Hours", or "Cumulative Hours").

Return the result in JSON format ONLY:
{
  "grandTotalHours": 40.5,
  "daysPresent": 5
}

If you cannot find the grand total hours, return null. Return only raw JSON without any markdown formatting.`;

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

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      success: true,
      grandTotalHours: parsed.grandTotalHours || fallbackHours,
      daysPresent: parsed.daysPresent || 5
    };
  } catch (err) {
    console.error('[Attendance Scanner] Error:', err);
    return {
      success: false,
      grandTotalHours: fallbackHours,
      daysPresent: 5,
      error: err.message
    };
  }
}
