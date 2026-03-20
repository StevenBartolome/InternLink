// src/data/employerMockData.js

export const companyProfile = {
  name: "Accenture Philippines",
  industry: "Information Technology & Services",
  address: "Robinsons Cybergate Tower 1, Pioneer St, Mandaluyong, 1550 Metro Manila",
  website: "https://www.accenture.com/ph-en",
  email: "ph.careers@accenture.com",
  contactNumber: "+63 2 8585 3000",
  description: "Accenture is a leading global professional services company, providing a broad range of services and solutions in strategy, consulting, digital, technology and operations.",
  logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=200&auto=format&fit=crop" // placeholder
};

export const internshipListings = [
  {
    id: "listing-1",
    jobTitle: "Software Engineer Intern",
    department: "Technology",
    industry: "IT",
    location: "Mandaluyong City & Remote",
    duration: "3 months",
    slotsAvailable: 5,
    datePosted: "2026-03-01",
    status: "Active", // Active, Inactive, Pending Approval
    description: "Join our development team to work on enterprise applications.",
    responsibilities: [
      "Assist in writing clean, maintainable code.",
      "Participate in code reviews and sprint planning.",
      "Debug and troubleshoot application issues."
    ],
    requirements: [
      "Background in Computer Science or IT.",
      "Familiar with React.js and Node.js.",
      "Good communication skills."
    ],
    skills: ["React", "Node.js", "JavaScript", "Git", "Agile"]
  },
  {
    id: "listing-2",
    jobTitle: "Data Analyst Intern",
    department: "Data Engineering",
    industry: "IT",
    location: "Taguig City (BGC)",
    duration: "4 months",
    slotsAvailable: 3,
    datePosted: "2026-03-05",
    status: "Active",
    description: "Analyze large datasets to drive business decisions.",
    responsibilities: [
      "Clean and preprocess data for analysis.",
      "Build dashboards using Python and SQL.",
      "Present findings to the team."
    ],
    requirements: [
      "Proficient in SQL and Python.",
      "Strong analytical and problem-solving skills."
    ],
    skills: ["Python", "SQL", "Pandas", "PowerBI", "Communication"]
  },
  {
    id: "listing-3",
    jobTitle: "UI/UX Designer Intern",
    department: "Design",
    industry: "IT/Creative",
    location: "Remote",
    duration: "3 months",
    slotsAvailable: 2,
    datePosted: "2026-03-10",
    status: "Pending Approval",
    description: "Design user interfaces for mobile and web apps.",
    responsibilities: [
      "Create wireframes and prototypes.",
      "Conduct user research.",
      "Collaborate with developers."
    ],
    requirements: [
      "Proficient in Figma.",
      "Strong portfolio demonstrating UI design."
    ],
    skills: ["Figma", "UI Design", "Prototyping", "User Research"]
  },
  {
    id: "listing-4",
    jobTitle: "QA Engineer Intern",
    department: "Technology",
    industry: "IT",
    location: "Mandaluyong City",
    duration: "3 months",
    slotsAvailable: 4,
    datePosted: "2026-02-25",
    status: "Inactive",
    description: "Test and ensure quality of software products.",
    skills: ["Testing", "Selenium", "Manual Testing"]
  },
  {
    id: "listing-5",
    jobTitle: "HR Intern",
    department: "Human Resources",
    industry: "Corporate",
    location: "Mandaluyong City",
    duration: "3 months",
    slotsAvailable: 2,
    datePosted: "2026-03-12",
    status: "Active",
    description: "Assist in recruitment and employee onboarding.",
    skills: ["Recruitment", "HR", "Communication"]
  }
];

export const applicants = [
  {
    id: "app-1",
    studentName: "Juan Dela Cruz",
    course: "BS Computer Science",
    yearLevel: "4th Year",
    dateApplied: "2026-03-15",
    status: "Pending", // Pending, Approved, Rejected
    listingId: "listing-1",
    position: "Software Engineer Intern",
    skills: ["React", "JavaScript", "HTML/CSS"],
    resumeLink: "#",
    coverLetter: "I am excited to apply for the Software Engineer Intern position. I have been building React apps for 2 years..."
  },
  {
    id: "app-2",
    studentName: "Maria Clara",
    course: "BS Information Technology",
    yearLevel: "4th Year",
    dateApplied: "2026-03-16",
    status: "Pending",
    listingId: "listing-1",
    position: "Software Engineer Intern",
    skills: ["Reactjs", "Nodejs", "SQL"],
    resumeLink: "#",
    coverLetter: "I am a passionate dev looking to expand my fullstack skills."
  },
  {
    id: "app-3",
    studentName: "Jose Rizal",
    course: "BS Data Science",
    yearLevel: "3rd Year",
    dateApplied: "2026-03-14",
    status: "Approved",
    listingId: "listing-2",
    position: "Data Analyst Intern",
    skills: ["Python", "SQL", "Tableau"],
    resumeLink: "#",
    coverLetter: "Data is beautiful. I want to help Accenture make sense of it."
  },
  {
    id: "app-4",
    studentName: "Andres Bonifacio",
    course: "BS Computer Engineering",
    yearLevel: "4th Year",
    dateApplied: "2026-03-13",
    status: "Rejected",
    listingId: "listing-2",
    position: "Data Analyst Intern",
    remarks: "Lacks core Python data analysis skills.",
    skills: ["C++", "Python", "Hardware"],
    resumeLink: "#",
    coverLetter: "Seeking heavy hardware roles, but interested in data too."
  },
  {
    id: "app-5",
    studentName: "Emilio Aguinaldo",
    course: "BS Information Systems",
    yearLevel: "3rd Year",
    dateApplied: "2026-03-17",
    status: "Pending",
    listingId: "listing-1",
    position: "Software Engineer Intern",
    skills: ["Java", "HTML", "CSS"],
    resumeLink: "#",
    coverLetter: "Fast learner seeking enterprise experience."
  },
  {
    id: "app-6",
    studentName: "Apolinario Mabini",
    course: "BS Computer Science",
    yearLevel: "4th Year",
    dateApplied: "2026-03-18",
    status: "Pending",
    listingId: "listing-3",
    position: "UI/UX Designer Intern",
    skills: ["Figma", "Photoshop", "UI Design"],
    resumeLink: "#",
    coverLetter: "Designing accessible and beautiful interfaces is my goal."
  },
  {
    id: "app-7",
    studentName: "Gabriela Silang",
    course: "BS Psychology",
    yearLevel: "4th Year",
    dateApplied: "2026-03-19",
    status: "Pending",
    listingId: "listing-5",
    position: "HR Intern",
    skills: ["Communication", "MS Office", "Psychology"],
    resumeLink: "#",
    coverLetter: "Interested in corporate HR and employee relations."
  },
  {
    id: "app-8",
    studentName: "Melchora Aquino",
    course: "BS IT",
    yearLevel: "4th Year",
    dateApplied: "2026-03-12",
    status: "Approved",
    listingId: "listing-1",
    position: "Software Engineer Intern",
    skills: ["JavaScript", "React", "Node"],
    resumeLink: "#",
    coverLetter: "Looking forward to working with a great team."
  }
];

export const activeInterns = [
  {
    id: "intern-1",
    studentName: "Jose Rizal",
    position: "Data Analyst Intern",
    startDate: "2026-04-01",
    endDate: "2026-08-01",
    hoursCompleted: 120,
    totalHours: 400,
    tasks: [
      { id: 1, title: "Clean client dataset", status: "Completed" },
      { id: 2, title: "Build PowerBI dashboard", status: "In Progress" },
      { id: 3, title: "Present weekly summary", status: "Pending" }
    ],
    weeklyLogs: [
      { week: 1, hours: 40, log: "Oriented with the team and started data cleaning." },
      { week: 2, hours: 40, log: "Finished cleaning dataset. Started PowerBI mockups." },
      { week: 3, hours: 40, log: "Dashboard 50% done. Iterating on feedback." }
    ],
    supervisor: "Juan dela Cruz"
  },
  {
    id: "intern-2",
    studentName: "Melchora Aquino",
    position: "Software Engineer Intern",
    startDate: "2026-04-01",
    endDate: "2026-07-01",
    hoursCompleted: 200,
    totalHours: 320,
    tasks: [
      { id: 1, title: "Setup dev environment", status: "Completed" },
      { id: 2, title: "Fix UI bugs", status: "Completed" },
      { id: 3, title: "Implement new landing section", status: "In Progress" }
    ],
    weeklyLogs: [
      { week: 1, hours: 40, log: "Setup env. Familiarized with codebase." },
      { week: 2, hours: 40, log: "Fixed 3 bugs in the login flow." },
      { week: 3, hours: 40, log: "Started working on Landing Page revamp." }
    ],
    supervisor: "Not Assigned"
  },
  {
    id: "intern-3",
    studentName: "Lapu Lapu",
    position: "QA Engineer Intern",
    startDate: "2026-03-01",
    endDate: "2026-06-01",
    hoursCompleted: 350,
    totalHours: 400,
    tasks: [
      { id: 1, title: "Manual testing of login", status: "Completed" },
      { id: 2, title: "Automation scripts for signup", status: "Completed" }
    ],
    weeklyLogs: [{ week: 1, hours: 40, log: "Testing signup." }],
    supervisor: "Juan dela Cruz"
  },
  {
    id: "intern-4",
    studentName: "Gregoria de Jesus",
    position: "HR Intern",
    startDate: "2026-04-10",
    endDate: "2026-07-10",
    hoursCompleted: 40,
    totalHours: 240,
    tasks: [{ id: 1, title: "Sort resumes", status: "In Progress" }],
    supervisor: "Not Assigned"
  }
];

export const notifications = [
  {
    id: "noti-1",
    type: "Applicant", // Applicant, Evaluation, System
    message: "New applicant Juan Dela Cruz for Software Engineer Intern position.",
    timestamp: "2026-03-15 09:30 AM",
    read: false
  },
  {
    id: "noti-2",
    type: "Applicant",
    message: "New applicant Maria Clara for Software Engineer Intern position.",
    timestamp: "2026-03-16 02:15 PM",
    read: false
  },
  {
    id: "noti-3",
    type: "Evaluation",
    message: "Reminder: Evaluation due for Melchora Aquino from week 3.",
    timestamp: "2026-03-18 08:00 AM",
    read: true
  },
  {
    id: "noti-4",
    type: "System",
    message: "Listing UI/UX Designer Intern is pending approval from Admin.",
    timestamp: "2026-03-10 10:00 AM",
    read: true
  },
  {
    id: "noti-5",
    type: "Applicant",
    message: "New applicant Apolinario Mabini applied for UI/UX Designer.",
    timestamp: "2026-03-18 11:45 AM",
    read: false
  }
];

export const supervisors = [
  { id: 1, name: "Juan dela Cruz", department: "IT Department", email: "supervisor@gmail.com" },
  { id: 2, name: "Petra Magtanggol", department: "HR Department", email: "petra@accenture.com" },
  { id: 3, name: "Tomas Morato", department: "Technology Department", email: "tomas@accenture.com" }
];
