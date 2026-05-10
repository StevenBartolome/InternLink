// src/services/mocks/mockData.js — Stage-based student internship data

export const studentProfile = {
  id: '2023-00042',
  name: 'Maria Gabriela Santos',
  course: 'Bachelor of Science in Information Technology',
  courseCode: 'BSIT',
  yearLevel: '4th Year',
  email: 'student@internlink.edu',
  contact: '+63 912 345 6789',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria&backgroundColor=b6e3f4',
  academicYear: '2025-2026',
  semester: '2nd Semester',
  ojtSubject: 'IT 401 - On-the-Job Training (486 hrs)',
};

export const studentInternship = {
  id: 'int-001',
  companyName: 'NexGen Software Solutions',
  companyAddress: '21F Ayala Tower, BGC, Taguig City',
  supervisorName: 'Engr. Alex Mercer',
  supervisorEmail: 'alex.mercer@nexgen.com',
  position: 'Full-Stack Developer Intern',
  currentStage: 'DURING_INTERNSHIP', // PRE_INTERNSHIP | DURING_INTERNSHIP | POST_INTERNSHIP | COMPLETED
  isDeployed: true,
  renderedHours: 186,
  requiredHours: 486,
  startDate: '2026-03-10',
  endDate: '2026-06-10',
  finalGrade: null,
  moaStatus: 'PROCESSED', // NOT_STARTED | IN_PROGRESS | PROCESSED
  deploymentApproved: true,
  stage2Validated: false,
  stage3Submitted: false,
};

// Pre-Internship documents checklist
export const preInternshipDocs = [
  { id: 'd1', name: 'Medical Certificate', status: 'APPROVED', comment: '', required: true, fileUrl: null, submittedAt: '2026-03-01' },
  { id: 'd2', name: 'Parental Consent Form', status: 'APPROVED', comment: '', required: true, fileUrl: null, submittedAt: '2026-03-01' },
  { id: 'd3', name: 'Resume / Curriculum Vitae', status: 'APPROVED', comment: '', required: true, fileUrl: null, submittedAt: '2026-03-02' },
  { id: 'd4', name: 'Endorsement Letter from School', status: 'PENDING', comment: '', required: true, fileUrl: null, submittedAt: '2026-03-03' },
  { id: 'd5', name: 'Acceptance Letter / Company Confirmation', status: 'REJECTED', comment: 'Please resubmit with company letterhead and official signature.', required: true, fileUrl: null, submittedAt: '2026-03-04' },
  { id: 'd6', name: 'Insurance / HMO Card', status: 'NOT_SUBMITTED', comment: '', required: true, fileUrl: null, submittedAt: null },
];

// Attendance / Daily logs
export const attendanceLogs = [
  { id: 'a1', date: '2026-05-09', timeIn: '08:00', timeOut: '17:00', hours: 9, activities: 'Developed REST API endpoints for user auth module. Fixed bug in JWT refresh logic.', status: 'PRESENT' },
  { id: 'a2', date: '2026-05-08', timeIn: '08:15', timeOut: '17:15', hours: 9, activities: 'Integrated frontend login page with backend. Ran unit tests.', status: 'PRESENT' },
  { id: 'a3', date: '2026-05-07', timeIn: '08:00', timeOut: '12:00', hours: 4, activities: 'Half day — attended school seminar in the morning.', status: 'HALF_DAY' },
  { id: 'a4', date: '2026-05-06', timeIn: '08:00', timeOut: '17:00', hours: 9, activities: 'Setup CI/CD pipeline using GitHub Actions. Documentation updates.', status: 'PRESENT' },
  { id: 'a5', date: '2026-05-05', timeIn: '-', timeOut: '-', hours: 0, activities: '', status: 'ABSENT' },
];

// Weekly Activity Reports
export const warSubmissions = [
  { id: 'w1', weekNumber: 1, weekLabel: 'Week 1 (Mar 10–14)', summary: 'Set up development environment, cloned repos, attended onboarding.', skillsLearned: 'Git branching, project setup, company coding standards.', challenges: 'Adapting to large existing codebase.', status: 'APPROVED', comment: 'Great start! Keep it up.', submittedAt: '2026-03-14' },
  { id: 'w2', weekNumber: 2, weekLabel: 'Week 2 (Mar 17–21)', summary: 'Started working on authentication module. Implemented JWT login flow.', skillsLearned: 'JWT authentication, Node.js middleware.', challenges: 'Token refresh logic was complex.', status: 'APPROVED', comment: 'Well documented progress.', submittedAt: '2026-03-21' },
  { id: 'w3', weekNumber: 3, weekLabel: 'Week 3 (Mar 24–28)', summary: 'Built React login/register UI components.', skillsLearned: 'React hooks, form validation, axios integration.', challenges: 'Managing form state with multiple fields.', status: 'REJECTED', comment: 'WAR is too brief. Please provide more detail on technical challenges.', submittedAt: '2026-03-28' },
  { id: 'w4', weekNumber: 4, weekLabel: 'Week 4 (Mar 31–Apr 4)', summary: 'Revised and resubmitted Week 3 WAR. Continued with dashboard development.', skillsLearned: 'Data visualization, Chart.js, responsive design.', challenges: 'Optimizing chart rendering performance.', status: 'PENDING', comment: '', submittedAt: '2026-04-04' },
];

export const completionDocs = {
  certificateOfCompletion: null,     // file URL when uploaded
  supervisorEvaluation: null,        // file URL when uploaded
  certificateStatus: 'NOT_SUBMITTED',
  evaluationStatus: 'NOT_SUBMITTED',
};

export const portfolioItems = [
  { id: 'p1', name: 'Compiled Daily Activity Logs', uploaded: false, fileUrl: null },
  { id: 'p2', name: 'Weekly Activity Reports (All Weeks)', uploaded: false, fileUrl: null },
  { id: 'p3', name: 'Certificate of Completion', uploaded: false, fileUrl: null },
  { id: 'p4', name: 'Supervisor Evaluation Form', uploaded: false, fileUrl: null },
  { id: 'p5', name: 'Updated Resume / CV', uploaded: false, fileUrl: null },
  { id: 'p6', name: 'Final Narrative Report', uploaded: false, fileUrl: null },
];

export const studentNotifications = [
  { id: 'n1', type: 'document', message: 'Your Acceptance Letter was REJECTED by your OJT Head. Please resubmit with company letterhead.', timestamp: '2 hours ago', read: false, stage: 'PRE_INTERNSHIP' },
  { id: 'n2', type: 'war', message: 'Your Week 3 WAR was REJECTED. Reason: "Too brief — add more technical detail."', timestamp: '3 days ago', read: false, stage: 'DURING_INTERNSHIP' },
  { id: 'n3', type: 'deployment', message: '🎉 You have been approved for deployment! Stage 2 (During Internship) is now unlocked.', timestamp: '1 week ago', read: true, stage: 'DURING_INTERNSHIP' },
  { id: 'n4', type: 'system', message: '📋 Reminder: Your Week 4 WAR is due today (Friday). Please submit before end of day.', timestamp: '1 week ago', read: true, stage: 'DURING_INTERNSHIP' },
  { id: 'n5', type: 'document', message: 'Your Medical Certificate and Parental Consent Form have been APPROVED.', timestamp: '2 weeks ago', read: true, stage: 'PRE_INTERNSHIP' },
];

// ── Backwards-compatibility exports for legacy pages ─────────────────────────
export const userNotifications = studentNotifications;

export const progressState = {
  company: studentInternship.company,
  supervisor: studentInternship.supervisorName,
  startDate: studentInternship.startDate,
  hoursCompleted: studentInternship.renderedHours,
  hoursTotal: studentInternship.requiredHours,
  tasks: [],
  weeklyLogs: [],
};

export const gradesEvaluations = {
  overallGrade: studentInternship.finalGrade || 'Pending',
  coordinatorRemarks: 'Awaiting final evaluation.',
  evaluations: [],
};

export const applicationRecords = [];
export const internshipListings = [];
