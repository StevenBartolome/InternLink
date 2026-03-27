// src/data/supervisorMockData.js

export const supervisorData = {
  id: 1,
  name: "Juan dela Cruz",
  email: "supervisor@gmail.com",
  company: "Accenture Philippines",
  department: "IT Department",
  role: "Supervisor",
  avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
};

export const internsData = [
  {
    id: 1,
    name: "Maria Santos",
    school: "National University Baliwag",
    course: "BS Information Technology",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    contact: "+63 912 345 6789",
    requiredHours: 486,
    renderedHours: 243, // 50%
    todayStatus: "Present", // Present, Absent, No Log
    evaluationStatus: "Eligible", // Eligible, Evaluated, Not Eligible
    attendanceLogs: [
      { date: "2026-03-20", timeIn: "08:00 AM", timeOut: "05:00 PM", totalHours: 8, status: "Present" },
      { date: "2026-03-19", timeIn: "08:15 AM", timeOut: "05:15 PM", totalHours: 8, status: "Late" },
      { date: "2026-03-18", timeIn: "08:00 AM", timeOut: "05:00 PM", totalHours: 8, status: "Present" },
      { date: "2026-03-17", timeIn: "---", timeOut: "---", totalHours: 0, status: "Absent" },
      { date: "2026-03-16", timeIn: "08:00 AM", timeOut: "05:00 PM", totalHours: 8, status: "Present" },
    ],
    tasks: [
      { id: 1, name: "Database Schema Design", description: "Design the initial schema for the user module.", dueDate: "2026-03-25", status: "Done" },
      { id: 2, name: "API Integration", description: "Integrate the login API with the frontend.", dueDate: "2026-03-28", status: "In Progress" },
      { id: 3, name: "Unit Testing", description: "Write tests for the auth controller.", dueDate: "2026-04-01", status: "Not Started" },
    ]
  },
  {
    id: 2,
    name: "Juan Miguel",
    school: "National University Baliwag",
    course: "BS Computer Science",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    contact: "+63 922 888 7777",
    requiredHours: 486,
    renderedHours: 400, // ~82%
    todayStatus: "No Log",
    evaluationStatus: "Eligible",
    attendanceLogs: [
      { date: "2026-03-19", timeIn: "08:00 AM", timeOut: "05:00 PM", totalHours: 8, status: "Present" },
      { date: "2026-03-18", timeIn: "08:00 AM", timeOut: "05:00 PM", totalHours: 8, status: "Present" },
    ],
    tasks: [
      { id: 4, name: "Frontend Setup", description: "Initialize React app with routing.", dueDate: "2026-03-10", status: "Done" },
      { id: 5, name: "UI Components", description: "Build buttons, inputs, and modals.", dueDate: "2026-03-15", status: "Done" },
      { id: 6, name: "Dashboard Layout", description: "Create the sidebar and topbar structure.", dueDate: "2026-03-22", status: "In Progress" },
    ]
  },
  {
    id: 3,
    name: "Ana Lopez",
    school: "National University Baliwag",
    course: "BS Business Administration",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    contact: "+63 916 555 4321",
    requiredHours: 486,
    renderedHours: 120, // ~25%
    todayStatus: "Absent",
    evaluationStatus: "Evaluated", // Already evaluated
    attendanceLogs: [
      { date: "2026-03-20", timeIn: "---", timeOut: "---", totalHours: 0, status: "Absent" },
      { date: "2026-03-19", timeIn: "08:00 AM", timeOut: "05:00 PM", totalHours: 8, status: "Present" },
    ],
    tasks: [
      { id: 7, name: "Market Research", description: "Analyze competitor strategies.", dueDate: "2026-03-25", status: "In Progress" },
      { id: 8, name: "Social Media Plan", description: "Draft a content calendar for April.", dueDate: "2026-03-30", status: "Not Started" },
    ],
    evaluation: {
      attendance: 9,
      attitude: 10,
      workQuality: 8,
      punctuality: 9,
      teamwork: 10,
      overallScore: 9.2,
      remarks: "Ana is highly motivated and quick to learn. Great teamwork skills and always on time when she reports."
    }
  }
];

export const notificationsData = [
  { id: 1, icon: "log-in", message: "Maria Santos timed in at 08:00 AM", timestamp: "1 hour ago", read: false },
  { id: 2, icon: "check-circle", message: "Juan Miguel completed the task: 'Frontend Setup'", timestamp: "3 hours ago", read: false },
  { id: 3, icon: "alert-circle", message: "Ana Lopez is absent today", timestamp: "5 hours ago", read: true },
  { id: 4, icon: "file-text", message: "Evaluation reminder: Juan Miguel is eligible for evaluation", timestamp: "1 day ago", read: true },
  { id: 5, icon: "users", message: "New intern assigned: Maria Santos", timestamp: "3 days ago", read: true },
];

export const statsSummary = {
  totalInterns: 3,
  presentToday: 1,
  pendingTasks: 4,
  evaluationsDue: 2
};
