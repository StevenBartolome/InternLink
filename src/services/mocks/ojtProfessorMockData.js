// src/services/mocks/ojtProfessorMockData.js — OJT Adviser stage-based data

export const ojtHeadProfile = {
  name: 'OJT Coordinator',
  assignedCourse: 'BSIT',
  department: 'Information Technology Department',
  role: 'OJT Adviser',
  email: 'ojthead@internlink.edu',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
  isFirstLogin: false,
};

export const mockStudents = [
  {
    id: '2023-00001', name: 'Juan Dela Cruz', course: 'BSIT', yearLevel: '4th Year',
    currentStage: 'DURING_INTERNSHIP', isDeployed: true,
    company: 'Acme Tech Solutions', supervisorName: 'Engr. Roberto Reyes',
    renderedHours: 350, requiredHours: 486, grade: null,
    isAtRisk: true, moaStatus: 'PROCESSED',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
    lastActivity: '2026-05-08',
  },
  {
    id: '2023-00002', name: 'Liza Soberano', course: 'BSIT', yearLevel: '4th Year',
    currentStage: 'PRE_INTERNSHIP', isDeployed: false,
    company: 'Global Innovations Inc.', supervisorName: null,
    renderedHours: 0, requiredHours: 486, grade: null,
    isAtRisk: false, moaStatus: 'IN_PROGRESS',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liza',
    lastActivity: '2026-05-07',
  },
  {
    id: '2023-00003', name: 'Daniel Padilla', course: 'BSIT', yearLevel: '4th Year',
    currentStage: 'DURING_INTERNSHIP', isDeployed: true,
    company: 'CyberSoft PH', supervisorName: 'Mr. David Lim',
    renderedHours: 120, requiredHours: 486, grade: null,
    isAtRisk: true, moaStatus: 'PROCESSED',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel',
    lastActivity: '2026-05-06',
  },
  {
    id: '2023-00004', name: 'Kathryn Bernardo', course: 'BSIT', yearLevel: '4th Year',
    currentStage: 'POST_INTERNSHIP', isDeployed: true,
    company: 'Tech Mahindra', supervisorName: 'Mr. Alex Cruz',
    renderedHours: 486, requiredHours: 486, grade: null,
    isAtRisk: false, moaStatus: 'PROCESSED',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kathryn',
    lastActivity: '2026-05-09',
  },
  {
    id: '2023-00005', name: 'Enrique Gil', course: 'BSIT', yearLevel: '4th Year',
    currentStage: 'PRE_INTERNSHIP', isDeployed: false,
    company: null, supervisorName: null,
    renderedHours: 0, requiredHours: 486, grade: null,
    isAtRisk: false, moaStatus: 'NOT_STARTED',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Enrique',
    lastActivity: '2026-05-01',
  },
  {
    id: '2023-00006', name: 'Nadine Lustre', course: 'BSIT', yearLevel: '4th Year',
    currentStage: 'COMPLETED', isDeployed: true,
    company: 'Ayala Corporation', supervisorName: 'Ms. Elena Ruiz',
    renderedHours: 486, requiredHours: 486, grade: '1.25',
    isAtRisk: false, moaStatus: 'PROCESSED',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nadine',
    lastActivity: '2026-04-30',
  },
];

// Documents pending review for Pre-Internship
export const mockDocumentQueue = [
  {
    studentId: '2023-00002', studentName: 'Liza Soberano',
    company: 'Global Innovations Inc.', position: 'Data Analyst Intern',
    docs: [
      { id: 'doc-1', name: 'Medical Certificate', status: 'PENDING', submittedAt: '2026-05-08' },
      { id: 'doc-2', name: 'Parental Consent Form', status: 'PENDING', submittedAt: '2026-05-08' },
      { id: 'doc-3', name: 'Resume / CV', status: 'APPROVED', submittedAt: '2026-05-07' },
      { id: 'doc-4', name: 'Endorsement Letter', status: 'PENDING', submittedAt: '2026-05-08' },
      { id: 'doc-5', name: 'Acceptance Letter', status: 'REJECTED', comment: 'Missing official company signature.', submittedAt: '2026-05-06' },
    ],
    moaStatus: 'IN_PROGRESS',
    deploymentApproved: false,
  },
  {
    studentId: '2023-00005', studentName: 'Enrique Gil',
    company: null, position: null,
    docs: [],
    moaStatus: 'NOT_STARTED',
    deploymentApproved: false,
  },
];

// WARs pending review
export const mockWARQueue = [
  {
    id: 'war-01', studentId: '2023-00001', studentName: 'Juan Dela Cruz',
    weekNumber: 4, weekLabel: 'Week 4 (Apr 28–May 2)',
    summary: 'Completed user authentication module and integrated with main backend API.',
    skillsLearned: 'JWT, middleware chaining, REST API design patterns.',
    challenges: 'Debugging token refresh on concurrent requests.',
    status: 'PENDING', comment: '', submittedAt: '2026-05-02',
  },
  {
    id: 'war-02', studentId: '2023-00003', studentName: 'Daniel Padilla',
    weekNumber: 2, weekLabel: 'Week 2 (Apr 21–25)',
    summary: 'Worked on QA test scripts for the main product features.',
    skillsLearned: 'Selenium, Pytest, bug tracking on Jira.',
    challenges: 'Understanding test coverage requirements.',
    status: 'PENDING', comment: '', submittedAt: '2026-04-25',
  },
  {
    id: 'war-03', studentId: '2023-00001', studentName: 'Juan Dela Cruz',
    weekNumber: 3, weekLabel: 'Week 3 (Apr 21–25)',
    summary: 'React dashboard development and API integration.',
    skillsLearned: 'React hooks, Chart.js, axios.',
    challenges: 'Chart rendering performance with large datasets.',
    status: 'APPROVED', comment: 'Excellent technical depth!', submittedAt: '2026-04-25',
  },
];

// Student attendance summary for monitoring
export const mockAttendanceSummary = mockStudents
  .filter(s => s.currentStage === 'DURING_INTERNSHIP')
  .map(s => ({
    ...s,
    weeklyHours: [36, 40, 38, 20],
    recentLogs: [
      { date: '2026-05-09', timeIn: '08:00', timeOut: '17:00', hours: 9, status: 'PRESENT' },
      { date: '2026-05-08', timeIn: '08:15', timeOut: '17:15', hours: 9, status: 'PRESENT' },
      { date: '2026-05-07', timeIn: '-', timeOut: '-', hours: 0, status: 'ABSENT' },
    ],
    missedDays: 1,
  }));

// Completion validation queue (Stage 2 → Stage 3)
export const mockCompletionQueue = [
  {
    studentId: '2023-00004', studentName: 'Kathryn Bernardo',
    company: 'Tech Mahindra', renderedHours: 486, requiredHours: 486,
    certificateUploaded: true, supervisorEvalUploaded: true,
    stage3Unlocked: false,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kathryn',
  },
];

// Visit itinerary
export const mockVisitItinerary = [
  {
    id: 'v1', date: '2026-05-15', location: 'BGC, Taguig City',
    students: [
      { name: 'Kathryn Bernardo', company: 'Tech Mahindra', address: '31F BGC Corporate Center' },
    ],
    notes: '', status: 'SCHEDULED',
  },
  {
    id: 'v2', date: '2026-05-20', location: 'Makati City',
    students: [
      { name: 'Juan Dela Cruz', company: 'Acme Tech Solutions', address: '10F Ayala Tower One' },
    ],
    notes: 'Bring evaluation form.', status: 'SCHEDULED',
  },
];

// Grading queue (post-internship)
export const mockGradingQueue = [
  {
    studentId: '2023-00004', studentName: 'Kathryn Bernardo',
    company: 'Tech Mahindra', renderedHours: 486,
    portfolioSubmitted: true, submittedAt: '2026-05-08',
    supervisorScore: 92, finalGrade: null,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kathryn',
  },
];

export const mockGradedStudents = [
  {
    studentId: '2023-00006', studentName: 'Nadine Lustre',
    company: 'Ayala Corporation', finalGrade: '1.25',
    dateGraded: '2026-04-30',
  },
];

export const mockNotifications = [
  { id: 1, type: 'Document', message: 'Liza Soberano submitted 4 pre-internship documents for review.', timestamp: '1 hour ago', read: false },
  { id: 2, type: 'WAR', message: 'Juan Dela Cruz submitted Week 4 WAR.', timestamp: '3 hours ago', read: false },
  { id: 3, type: 'WAR', message: 'Daniel Padilla submitted Week 2 WAR.', timestamp: '1 day ago', read: false },
  { id: 4, type: 'Completion', message: 'Kathryn Bernardo uploaded completion documents — ready for Stage 3 validation.', timestamp: '2 days ago', read: true },
  { id: 5, type: 'System', message: 'Friday WAR reminder sent to all active students.', timestamp: '3 days ago', read: true },
];
