export const coordinatorProfile = {
  name: "Dr. Maria Clara Santos",
  school: "National University Baliwag",
  department: "Information Technology Department",
  role: "OJT Coordinator",
  email: "coordinator@gmail.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"
};

export const mockStudents = [
  {
    id: "2023-00001",
    name: "Juan Dela Cruz",
    course: "BSIT",
    yearLevel: "4th Year",
    status: "Placed",
    company: "Acme Tech Solutions",
    supervisor: "Engr. Roberto Reyes",
    hoursRendered: 350,
    hoursRequired: 480,
    grade: null,
    skills: ["React", "Node.js", "SQL"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juan"
  },
  {
    id: "2023-00002",
    name: "Liza Soberano",
    course: "BSCS",
    yearLevel: "4th Year",
    status: "Placed",
    company: "Global Innovations Inc.",
    supervisor: "Ms. Sarah Gomez",
    hoursRendered: 0,
    hoursRequired: 480,
    grade: null,
    skills: ["Python", "Machine Learning", "Data Analysis"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liza"
  },
  {
    id: "2023-00003",
    name: "Daniel Padilla",
    course: "BSBA",
    yearLevel: "4th Year",
    status: "Unplaced",
    company: null,
    supervisor: null,
    hoursRendered: 0,
    hoursRequired: 480,
    grade: null,
    skills: ["Marketing", "Sales", "Customer Relations"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel"
  },
  {
    id: "2023-00004",
    name: "Kathryn Bernardo",
    course: "BSIT",
    yearLevel: "4th Year",
    status: "Completed",
    company: "Tech Mahindra",
    supervisor: "Mr. Alex Cruz",
    hoursRendered: 480,
    hoursRequired: 480,
    grade: 98,
    skills: ["UI/UX", "Figma", "HTML/CSS"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kathryn"
  },
  {
    id: "2023-00005",
    name: "Enrique Gil",
    course: "BSCS",
    yearLevel: "4th Year",
    status: "Placed",
    company: "CyberSoft PH",
    supervisor: "Mr. David Lim",
    hoursRendered: 200,
    hoursRequired: 480,
    grade: null,
    skills: ["Java", "Spring Boot", "MySQL"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Enrique"
  },
  {
    id: "2023-00006",
    name: "Nadine Lustre",
    course: "BSBA",
    yearLevel: "4th Year",
    status: "Placed",
    company: "Ayala Corporation",
    supervisor: "Ms. Elena Ruiz",
    hoursRendered: 150,
    hoursRequired: 480,
    grade: null,
    skills: ["Finance", "Accounting", "Excel"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nadine"
  },
  {
    id: "2023-00007",
    name: "James Reid",
    course: "BSIT",
    yearLevel: "4th Year",
    status: "Unplaced",
    company: null,
    supervisor: null,
    hoursRendered: 0,
    hoursRequired: 480,
    grade: null,
    skills: ["PHP", "Laravel", "Javascript"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James"
  },
  {
    id: "2023-00008",
    name: "Joshua Garcia",
    course: "BSCS",
    yearLevel: "4th Year",
    status: "Completed",
    company: "Smart Communications",
    supervisor: "Mr. Rico Blanco",
    hoursRendered: 480,
    hoursRequired: 480,
    grade: 92,
    skills: ["C++", "C#", "Unity"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joshua"
  },
  {
    id: "2023-00011",
    name: "Maine Mendoza",
    course: "BSCS",
    yearLevel: "4th Year",
    status: "Unplaced",
    company: null,
    supervisor: null,
    hoursRendered: 0,
    hoursRequired: 480,
    grade: null,
    skills: ["Data Science", "R", "SQL"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maine"
  },
  {
    id: "2023-00012",
    name: "Coco Martin",
    course: "BSBA",
    yearLevel: "4th Year",
    status: "Completed",
    company: "Jollibee Foods Corp",
    supervisor: "Mr. Tony Tan",
    hoursRendered: 480,
    hoursRequired: 480,
    grade: 90,
    skills: ["Logistics", "Operations", "Supply Chain"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Coco"
  }
];

export const mockEmployerListings = [
  {
    id: 1,
    companyName: "Acme Tech Solutions",
    position: "Frontend Developer Intern",
    department: "Engineering",
    slots: 5,
    duration: "480 Hours",
    status: "Pending",
    dateSubmitted: "2026-03-15",
    remarks: ""
  },
  {
    id: 2,
    companyName: "Global Innovations Inc.",
    position: "Data Analyst Intern",
    department: "Data Science",
    slots: 3,
    duration: "480 Hours",
    status: "Pending",
    dateSubmitted: "2026-03-16",
    remarks: ""
  },
  {
    id: 3,
    companyName: "CyberSoft PH",
    position: "QA Engineer Intern",
    department: "Quality Assurance",
    slots: 2,
    duration: "480 Hours",
    status: "Pending",
    dateSubmitted: "2026-03-17",
    remarks: ""
  },
  {
    id: 4,
    companyName: "Tech Mahindra",
    position: "Software Engineer Intern",
    department: "Engineering",
    slots: 10,
    duration: "480 Hours",
    status: "Approved",
    dateSubmitted: "2026-03-10",
    remarks: "Approved for full capacity."
  },
  {
    id: 5,
    companyName: "Ayala Corporation",
    position: "HR Specialist Intern",
    department: "Human Resources",
    slots: 4,
    duration: "480 Hours",
    status: "Approved",
    dateSubmitted: "2026-03-08",
    remarks: "Approved."
  },
  {
    id: 6,
    companyName: "BDO Unibank",
    position: "Financial Analyst Intern",
    department: "Finance",
    slots: 6,
    duration: "480 Hours",
    status: "Flagged",
    dateSubmitted: "2026-03-12",
    remarks: "Missing company certification document."
  }
];

export const mockApplications = [
  {
    id: 1,
    studentName: "Juan Dela Cruz",
    employer: "Acme Tech Solutions",
    position: "Frontend Developer Intern",
    dateApplied: "2026-03-18",
    status: "Pending",
    coverLetter: "I am a BSIT student passionate about building accessible web apps.",
    skills: ["React", "Node.js", "CSS"]
  },
  {
    id: 2,
    studentName: "Daniel Padilla",
    employer: "Tech Mahindra",
    position: "Software Engineer Intern",
    dateApplied: "2026-03-19",
    status: "Approved",
    coverLetter: "Looking to apply my software engineering skills in a corporate setting.",
    skills: ["Java", "SQL"]
  },
  {
    id: 3,
    studentName: "James Reid",
    employer: "CyberSoft PH",
    position: "QA Engineer Intern",
    dateApplied: "2026-03-20",
    status: "Rejected",
    coverLetter: "Interested in ensuring software quality.",
    skills: ["Python", "Selenium"]
  },
  // Add more applications to reach 15
  ...Array.from({ length: 12 }, (_, i) => ({
    id: i + 4,
    studentName: mockStudents[i % mockStudents.length].name,
    employer: mockEmployerListings[i % mockEmployerListings.length].companyName,
    position: mockEmployerListings[i % mockEmployerListings.length].position,
    dateApplied: `2026-03-${10 + (i % 10)}`,
    status: ["Pending", "Approved", "Rejected"][i % 3],
    coverLetter: "Placholder cover letter content for testing.",
    skills: mockStudents[i % mockStudents.length].skills
  }))
];

export const mockStudentPlacements = [
  {
    id: "PL001",
    studentName: "Juan Dela Cruz",
    studentId: "2023-00001",
    companyName: "Acme Tech Solutions",
    position: "Frontend Developer Intern",
    location: "Quezon City, Metro Manila",
    duration: "480 Hours",
    status: "Pending",
    dateAccepted: "2026-03-18",
    remarks: ""
  },
  {
    id: "PL002",
    studentName: "Liza Soberano",
    studentId: "2023-00002",
    companyName: "Global Innovations Inc.",
    position: "Data Analyst Intern",
    location: "Makati City, Metro Manila",
    duration: "480 Hours",
    status: "Pending",
    dateAccepted: "2026-03-19",
    remarks: ""
  },
  {
    id: "PL003",
    studentName: "Enrique Gil",
    studentId: "2023-00005",
    companyName: "CyberSoft PH",
    position: "QA Engineer Intern",
    location: "BGC, Taguig City",
    duration: "480 Hours",
    status: "Approved",
    dateAccepted: "2026-03-15",
    remarks: "Approved for OJT credit."
  },
  {
    id: "PL004",
    studentName: "Nadine Lustre",
    studentId: "2023-00006",
    companyName: "Ayala Corporation",
    position: "HR Specialist Intern",
    location: "Makati City, Metro Manila",
    duration: "480 Hours",
    status: "Pending",
    dateAccepted: "2026-03-20",
    remarks: ""
  }
];

export const mockProgressData = {
  students: mockStudents.filter(s => s.status === "Placed").map(s => ({
    ...s,
    taskCompletionRate: "8/12",
    taskPercentage: 66,
    attendanceRate: "92%",
    lastActivityDate: "2026-03-20",
    attendanceLogs: [
      { date: "2026-03-20", timeIn: "08:00 AM", timeOut: "05:00 PM", status: "Present", hours: 9 },
      { date: "2026-03-19", timeIn: "08:10 AM", timeOut: "05:15 PM", status: "Present", hours: 9 },
      { date: "2026-03-18", timeIn: "08:00 AM", timeOut: "12:00 PM", status: "Half Day", hours: 4 },
      { date: "2026-03-17", timeIn: "-", timeOut: "-", status: "Absent", hours: 0 }
    ],
    taskLogs: [
      { task: "Design login page", status: "Done", dueDate: "2026-03-15" },
      { task: "Setup API routing", status: "Done", dueDate: "2026-03-18" },
      { task: "Create modal components", status: "In Progress", dueDate: "2026-03-22" },
      { task: "Write unit tests", status: "Pending", dueDate: "2026-03-25" }
    ]
  }))
};

export const mockSuggestedMatches = [
  {
    id: 1,
    studentName: "Daniel Padilla",
    skills: "Marketing, Sales, Customer Relations",
    matchedCompany: "Ayala Corporation",
    position: "Marketing Intern",
    matchScore: 92,
    status: "Pending"
  },
  {
    id: 2,
    studentName: "James Reid",
    skills: "PHP, Laravel, Javascript",
    matchedCompany: "CyberSoft PH",
    position: "Web Developer Intern",
    matchScore: 85,
    status: "Pending"
  },
  {
    id: 3,
    studentName: "Maine Mendoza",
    skills: "Data Science, R, SQL",
    matchedCompany: "Global Innovations Inc.",
    position: "Data Analyst Intern",
    matchScore: 78,
    status: "Pending"
  },
  ...Array.from({ length: 5 }, (_, i) => ({
    id: i + 4,
    studentName: `Student Match ${i + 4}`,
    skills: "React, Node.js",
    matchedCompany: "Tech Mahindra",
    position: "Software Engineer Intern",
    matchScore: 50 + (i * 8),
    status: "Pending"
  }))
];

export const mockGradesData = {
  stats: {
    averageGrade: "1.25",
    totalGraded: 4,
    totalForGrading: 3
  },
  ongoing: mockStudents.filter(s => s.status === "Placed"),
  forGrading: mockStudents.filter(s => s.status === "Placed" && s.hoursRendered >= s.hoursRequired),
  graded: [
    {
      studentName: "Kathryn Bernardo",
      company: "Tech Mahindra",
      supervisor: "Mr. Alex Cruz",
      finalGrade: "1.0",
      dateGraded: "2026-03-15"
    },
    {
      studentName: "Joshua Garcia",
      company: "Smart Communications",
      supervisor: "Mr. Rico Blanco",
      finalGrade: "1.5",
      dateGraded: "2026-03-14"
    }
  ]
};

export const mockReportsData = {
  summary: {
    totalEnrolled: 50,
    totalPlaced: 35,
    totalCompleted: 10,
    averageGrade: "1.35"
  },
  placementRate: {
    overall: 70,
    breakdown: [
      { course: "BSIT", rate: 80, placed: 16, total: 20 },
      { course: "BSCS", rate: 65, placed: 13, total: 20 },
      { course: "BSBA", rate: 60, placed: 6, total: 10 }
    ]
  },
  completionRate: {
    overall: 20
  },
  gradeDistribution: [
    { label: "Excellent (1.0 - 1.25)", count: 5 },
    { label: "Satisfactory (1.5 - 2.5)", count: 4 },
    { label: "Needs Improvement (2.75 - 3.0)", count: 1 },
    { label: "Failed (5.0)", count: 0 }
  ],
  topEmployers: [
    { company: "Acme Tech Solutions", interns: 8, avgEvaluation: 95 },
    { company: "Tech Mahindra", interns: 6, avgEvaluation: 92 },
    { company: "Ayala Corporation", interns: 4, avgEvaluation: 90 },
    { company: "Global Innovations Inc.", interns: 4, avgEvaluation: 88 }
  ]
};

export const mockNotifications = [
  {
    id: 1,
    type: "Application",
    message: "New application from Juan Dela Cruz for Acme Tech Solutions",
    timestamp: "10 mins ago",
    read: false
  },
  {
    id: 2,
    type: "Listing",
    message: "Global Innovations Inc. posted a new listing: Data Analyst Intern",
    timestamp: "1 hour ago",
    read: false
  },
  {
    id: 3,
    type: "Progress",
    message: "Liza Soberano added new attendance logs for this week",
    timestamp: "2 hours ago",
    read: true
  },
  {
    id: 4,
    type: "Evaluation",
    message: "Supervisor Engr. Roberto Reyes submitted evaluation for Juan Dela Cruz",
    timestamp: "1 day ago",
    read: true
  },
  {
    id: 5,
    type: "System",
    message: "End of month reports are now available to generate",
    timestamp: "2 days ago",
    read: true
  },
  {
    id: 6,
    type: "Listing",
    message: "BDO Unibank updated listing remarks",
    timestamp: "3 days ago",
    read: true
  }
];
