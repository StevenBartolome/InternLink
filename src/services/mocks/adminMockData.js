// src/services/mocks/adminMockData.js — Admin mock data (OJT Adviser-centric)

export const adminProfile = {
  name: 'System Administrator',
  email: 'admin@internlink.edu',
  role: 'Admin',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
};

export const dashboardStats = {
  totalStudents: 54,
  totalOjtHeads: 4, // Total OJT Advisers
  studentsInPreInternship: 18,
  studentsInDuringInternship: 24,
  studentsInPostInternship: 6,
  studentsCompleted: 6,
  activeRegistrationsToday: 3,
};

// OJT Adviser accounts
export const ojtHeadsList = [
  { id: 'h1', name: 'Dr. Maria Clara Santos', email: 'mcsantos@internlink.edu', assignedCourse: 'BSIT', status: 'Active', dateCreated: '2026-01-10', studentsCount: 20 },
  { id: 'h2', name: 'Prof. Rodrigo dela Peña', email: 'rdpeña@internlink.edu', assignedCourse: 'BSCS', status: 'Active', dateCreated: '2026-01-10', studentsCount: 15 },
  { id: 'h3', name: 'Dr. Angela Reyes', email: 'areyes@internlink.edu', assignedCourse: 'BSIS', status: 'Active', dateCreated: '2026-01-12', studentsCount: 12 },
  { id: 'h4', name: 'Prof. Marco Tan', email: 'mtan@internlink.edu', assignedCourse: 'BSCPE', status: 'Inactive', dateCreated: '2026-02-01', studentsCount: 7 },
];

// Student accounts (COR-registered)
export const studentsList = [
  { id: 's1', name: 'Maria Gabriela Santos', email: 'student@internlink.edu', studentId: '2023-00042', course: 'BSIT', yearLevel: '4th Year', currentStage: 'DURING_INTERNSHIP', status: 'Active', dateRegistered: '2026-02-15' },
  { id: 's2', name: 'Juan Dela Cruz', email: 'jdelacruz@student.edu', studentId: '2023-00001', course: 'BSIT', yearLevel: '4th Year', currentStage: 'DURING_INTERNSHIP', status: 'Active', dateRegistered: '2026-02-16' },
  { id: 's3', name: 'Liza Soberano', email: 'lsoberano@student.edu', studentId: '2023-00002', course: 'BSIT', yearLevel: '4th Year', currentStage: 'PRE_INTERNSHIP', status: 'Active', dateRegistered: '2026-02-17' },
  { id: 's4', name: 'Daniel Padilla', email: 'dpadilla@student.edu', studentId: '2023-00003', course: 'BSCS', yearLevel: '4th Year', currentStage: 'DURING_INTERNSHIP', status: 'Active', dateRegistered: '2026-02-18' },
  { id: 's5', name: 'Kathryn Bernardo', email: 'kbernardo@student.edu', studentId: '2023-00004', course: 'BSIT', yearLevel: '4th Year', currentStage: 'POST_INTERNSHIP', status: 'Active', dateRegistered: '2026-02-19' },
  { id: 's6', name: 'Enrique Gil', email: 'egil@student.edu', studentId: '2023-00005', course: 'BSIT', yearLevel: '4th Year', currentStage: 'PRE_INTERNSHIP', status: 'Active', dateRegistered: '2026-02-20' },
  { id: 's7', name: 'Nadine Lustre', email: 'nlustre@student.edu', studentId: '2023-00006', course: 'BSIT', yearLevel: '4th Year', currentStage: 'COMPLETED', status: 'Active', dateRegistered: '2026-02-21' },
  { id: 's8', name: 'James Reid', email: 'jreid@student.edu', studentId: '2023-00007', course: 'BSCS', yearLevel: '4th Year', currentStage: 'PRE_INTERNSHIP', status: 'Inactive', dateRegistered: '2026-02-22' },
];

// Internship configuration per course
export const internshipConfig = [
  {
    course: 'BSIT', courseFullName: 'Bachelor of Science in Information Technology',
    requiredHours: 486, ojtSubjectCode: 'IT 401',
    deadlines: { docSubmission: '2026-03-15', warSubmission: 'Every Friday', portfolioSubmission: '2026-06-30' },
    requiredDocuments: ['Medical Certificate', 'Parental Consent Form', 'Resume / CV', 'Endorsement Letter', 'Acceptance Letter / Company Confirmation', 'Insurance / HMO Card'],
  },
  {
    course: 'BSCS', courseFullName: 'Bachelor of Science in Computer Science',
    requiredHours: 486, ojtSubjectCode: 'CS 401',
    deadlines: { docSubmission: '2026-03-15', warSubmission: 'Every Friday', portfolioSubmission: '2026-06-30' },
    requiredDocuments: ['Medical Certificate', 'Parental Consent Form', 'Resume / CV', 'Endorsement Letter', 'Acceptance Letter / Company Confirmation', 'Insurance / HMO Card'],
  },
  {
    course: 'BSIS', courseFullName: 'Bachelor of Science in Information Systems',
    requiredHours: 400, ojtSubjectCode: 'IS 401',
    deadlines: { docSubmission: '2026-03-20', warSubmission: 'Every Friday', portfolioSubmission: '2026-06-30' },
    requiredDocuments: ['Medical Certificate', 'Parental Consent Form', 'Resume / CV', 'Endorsement Letter', 'Acceptance Letter'],
  },
  {
    course: 'BSCPE', courseFullName: 'Bachelor of Science in Computer Engineering',
    requiredHours: 486, ojtSubjectCode: 'CPE 401',
    deadlines: { docSubmission: '2026-03-15', warSubmission: 'Every Friday', portfolioSubmission: '2026-06-30' },
    requiredDocuments: ['Medical Certificate', 'Parental Consent Form', 'Resume / CV', 'Endorsement Letter', 'Acceptance Letter', 'Insurance Card'],
  },
];

export const announcements = [
  { id: 1, title: 'Welcome to OJT 2026!', message: 'The OJT season officially starts. Please complete your pre-internship requirements early.', target: 'All', targetCourse: null, dateSent: '2026-02-01', sentBy: 'System Administrator', read: 12 },
  { id: 2, title: 'Document Submission Reminder', message: 'All BSIT students must submit their pre-internship documents by March 15.', target: 'Students', targetCourse: 'BSIT', dateSent: '2026-03-10', sentBy: 'System Administrator', read: 8 },
  { id: 3, title: 'WAR Submission Deadline', message: 'Weekly Activity Reports must be submitted every Friday before 11:59 PM.', target: 'Students', targetCourse: null, dateSent: '2026-03-20', sentBy: 'System Administrator', read: 15 },
];

export const systemReports = {
  academicYear: '2025-2026',
  semester: '2nd Semester',
  courseBreakdown: [
    { course: 'BSIT', enrolled: 20, preInternship: 5, duringInternship: 10, postInternship: 2, completed: 3, avgGrade: '1.35' },
    { course: 'BSCS', enrolled: 15, preInternship: 6, duringInternship: 6, postInternship: 2, completed: 1, avgGrade: '1.50' },
    { course: 'BSIS', enrolled: 12, preInternship: 4, duringInternship: 6, postInternship: 1, completed: 1, avgGrade: '1.25' },
    { course: 'BSCPE', enrolled: 7, preInternship: 3, duringInternship: 2, postInternship: 1, completed: 1, avgGrade: '1.75' },
  ],
};

export const auditLogs = [
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    timestamp: new Date(Date.now() - i * 3600000).toISOString().replace('T', ' ').substring(0, 19),
    user: ['System Admin', 'Dr. Maria Clara Santos', 'Prof. Rodrigo dela Peña'][i % 3],
    role: ['Admin', 'OJT Adviser', 'OJT Adviser'][i % 3],
    action: ['Created OJT Adviser account', 'Approved student document', 'Approved WAR', 'Approved deployment', 'Encoded final grade', 'Reset user password', 'Updated internship config'][i % 7],
    affectedRecord: `Record #${100 + i}`,
    type: ['Create', 'Update', 'Update', 'Update', 'Update', 'Update', 'Update'][i % 7],
  }))
];

export const systemSettings = {
  academicYear: '2025-2026',
  semester: '2nd Semester',
  maintenanceMode: false,
  allowNewRegistrations: true,
  warReminderDay: 'Friday',
};

// ── Backwards-compatibility ───────────────────────────────────────────────────
export const internshipListings = [];
export const reportsData = systemReports;
export const notificationsList = [];
export const sentAnnouncements = announcements;

