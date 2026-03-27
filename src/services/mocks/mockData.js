// src/data/mockData.js

export const studentProfile = {
  id: "STUD-2023-0042",
  name: "Gabriela Dela Cruz",
  course: "BS Information Technology Major in Web and Mobile Application",
  yearLevel: "4th Year",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juan&backgroundColor=b6e3f4",
  email: "gabriela.delacruz@student.edu.ph",
  contact: "+63 912 345 6789",
  address: "123 Mabini St., Quezon City, Metro Manila",
  skills: ["React.js", "Node.js", "JavaScript", "HTML/CSS", "UI Setup", "Git"],
  certifications: [
    { id: 1, title: "AWS Cloud Practitioner", issuer: "Amazon Web Services", date: "Jan 2025" },
    { id: 2, title: "Meta Front-End Developer", issuer: "Coursera", date: "Nov 2024" }
  ],
  resumeFiles: [
    { id: 1, filename: "Juan_DelaCruz_Resume_2026.pdf", date: "Mar 15, 2026" },
    { id: 2, filename: "Juan_DelaCruz_Portfolio.pdf", date: "Mar 10, 2026" }
  ],
  portfolioLinks: [
    { id: 1, url: "https://github.com/juandlc" },
    { id: 2, url: "https://juandelacruz.dev" }
  ]
};

export const internshipListings = [
  {
    id: 1,
    company: "SGV & Co. (Ernst & Young)",
    title: "Technology Risk Intern",
    location: "Ayala Ave, Makati City",
    duration: "3 months (300 hours)",
    slots: 3,
    industry: "IT Audit / Consulting",
    description: "Assist in evaluating IT systems and financial data processing for various clients, identifying technology risks and compliance details.",
    responsibilities: [
      "Review IT configurations and security controls",
      "Document system walkthroughs",
      "Assist in vulnerability mapping and resolution reporting"
    ],
    requirements: [
      "BS CS / IS / IT student",
      "Understanding of networks & security concepts",
      "Strong analytical mapping and communication skills"
    ]
  },
  {
    id: 2,
    company: "Accenture Philippines",
    title: "Software Engineering Intern",
    location: "BGC, Taguig City",
    duration: "4 months (400 hours)",
    slots: 5,
    industry: "Software Development",
    description: "Work on enterprise-level applications using modern JavaScript frameworks and cloud infrastructures.",
    responsibilities: [
      "Develop UI components based on Figma wireframes",
      "Create API endpoints using Node.js/Express",
      "Participate in daily standups and Agile sprints"
    ],
    requirements: [
      "Proficient in React or Angular",
      "Basic Node.js & Database knowledge",
      "Willingness to learn and code independently"
    ]
  },
  {
    id: 3,
    company: "GCash (Mynt)",
    title: "Mobile QA Engineering Intern",
    location: "BGC, Taguig City",
    duration: "3 months (300 hours)",
    slots: 2,
    industry: "Fintech / QA",
    description: "Help test mobile wallet features for stability, security, and edge-case behaviors before production sets.",
    responsibilities: [
      "Run manual and automated regression test sets",
      "Bug-report detailing and ticket tracking on Jira",
      "Collaborate with mobile devs to reproduce issues"
    ],
    requirements: [
      "Analytical mindset",
      "Basic automation framework understanding (e.g., Appium)",
      "High attention to detail"
    ]
  },
  {
    id: 4,
    company: "Globe Telecom",
    title: "Network Administration Intern",
    location: "Mandaluyong City",
    duration: "4 months (400 hours)",
    slots: 4,
    industry: "Telecommunications",
    description: "Gain hands-on experience maintaining network routers, switches, and edge firewall setups.",
    responsibilities: [
      "Monitor network traffic logs",
      "Assist with cabling setup and cable testing",
      "Configure VLANs and route policies under supervision"
    ],
    requirements: [
      "CCNA course takers preferred",
      "Knowledge of TCP/IP, OSI Model",
      "Good communication skills"
    ]
  },
  {
    id: 5,
    company: "Shopee Philippines",
    title: "UI/UX Design Intern",
    location: "BGC, Taguig City",
    duration: "3 months (300 hours)",
    slots: 2,
    industry: "E-commerce / Design",
    description: "Support design efforts to improve customer retention and checkout conversion rates via visual iterations.",
    responsibilities: [
      "Conduct user research surveys",
      "Create wireframes and interactive prototypes in Figma",
      "Maintain component libraries for consistent styles"
    ],
    requirements: [
      "Strong Figma/Adobe XD skills",
      "Portfolio demonstrating web/mobile design",
      "Knowledge of usability and accessibility guidelines"
    ]
  },
  {
    id: 6,
    company: "Trend Micro",
    title: "Cybersecurity Analyst Intern",
    location: "Chino Roces, Makati",
    duration: "5 months (500 hours)",
    slots: 1,
    industry: "Cybersecurity",
    description: "Assist threat analysis teams looking for active malware patterns and sandbox analysis logs.",
    responsibilities: [
      "Analyze malicious packet flags",
      "Document SIEM dashboards for active alerts",
      "Contribute items to threat intelligence databases"
    ],
    requirements: [
      "Basic malware knowledge or Python scripting",
      "Familiarity with Wireshark & Linux",
      "Strict confidentiality adherence"
    ]
  }
];

export const applicationRecords = [
  {
    id: 1,
    company: "GCash (Mynt)",
    position: "Mobile QA Engineering Intern",
    dateApplied: "2026-03-05",
    status: "Approved",
    coverLetter: "I have strong QA analytical skills and am very excited about FinTech stability improvements."
  },
  {
    id: 2,
    company: "Shopee Philippines",
    position: "UI/UX Design Intern",
    dateApplied: "2026-03-07",
    status: "Pending",
    coverLetter: "I've designed several mobile prototypes during my undergrad. Check my linked dev portfolio."
  },
  {
    id: 3,
    company: "Accenture Philippines",
    position: "Software Engineering Intern",
    dateApplied: "2026-03-10",
    status: "Rejected",
    coverLetter: "Full-stack developer focused on React & scaling Node architectures."
  },
  {
    id: 4,
    company: "SGV & Co.",
    position: "Technology Risk Intern",
    dateApplied: "2026-03-15",
    status: "Pending",
    coverLetter: "Interested in the security mapping of ERP systems and doing consulting risks."
  }
];

export const userNotifications = [
  { id: 1, type: "system", message: "Welcome to your OJT Dashboard! Update your profile to get started.", timestamp: "2 days ago", read: true },
  { id: 2, type: "application", message: "Your application at Shopee Philippines has been RECEIVED.", timestamp: "1 day ago", read: false },
  { id: 3, type: "application", message: "GCash (Mynt) has APPROVED your internship application! Check matching supervisor steps.", timestamp: "3 hours ago", read: false },
  { id: 4, type: "system", message: "System Maintenance scheduled on Sunday 10:00 PM.", timestamp: "5 hours ago", read: true },
  { id: 5, type: "application", message: "Accenture Philippines application was REJECTED.", timestamp: "1 day ago", read: true }
];

export const progressState = {
  company: "NexGen Software Solutions",
  supervisor: "Engr. Alex Mercer",
  startDate: "Mar 10, 2026",
  endDate: "Jun 10, 2026",
  hoursCompleted: 150,
  hoursTotal: 300,
  tasks: [
    { id: 1, title: "Develop responsive React-based dashboards", status: "Done" },
    { id: 2, title: "Integrate RESTful Backend API endpoints", status: "Done" },
    { id: 3, title: "Debug responsive design edge cases (mobile layout)", status: "In Progress" },
    { id: 4, title: "Deploy build to testing environments", status: "Not Started" }
  ],
  weeklyLogs: [
    { week: 1, hours: 40, activities: "Setup code repos, reviewed Figma mockup details.", supervisorSign: "Signed" },
    { week: 2, hours: 40, activities: "Built basic Layouts grids and Routes controllers.", supervisorSign: "Signed" },
    { week: 3, hours: 40, activities: "Implemented dynamic components connecting static endpoints.", supervisorSign: "Pending" }
  ]
};

export const gradesEvaluations = {
  overallGrade: "1.25",
  coordinatorRemarks: "Excellent response reporting and proactive participation in testing modules. Documentations are structured neatly.",
  evaluations: [
    { criteria: "Attendance & Punctuality", score: 95 },
    { criteria: "Technical Proficiency", score: 92 },
    { criteria: "Communication & Attitude", score: 96 },
    { criteria: "Task Delivery Speed", score: 90 },
    { criteria: "Initiative & Learning", score: 94 }
  ]
};
