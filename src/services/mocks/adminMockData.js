// src/data/adminMockData.js

export const adminProfile = {
  name: "Juan dela Cruz",
  email: "admin@gmail.com",
  role: "Admin",
  systemName: "OJT Management System",
  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100"
};

export const dashboardStats = {
  totalUsers: 245,
  pendingVerifications: 12,
  activeInternships: 48,
  systemAlerts: 4,
  roleDistribution: {
    students: 150,
    employers: 45,
    supervisors: 30,
    coordinators: 15,
    admins: 5
  }
};

export const usersList = [
  { id: 1, name: "Maria Clara", email: "maria.clara@student.up.edu.ph", role: "Student", dateRegistered: "2026-03-01", status: "Active" },
  { id: 2, name: "Crisostomo Ibarra", email: "ibarra@employer.sanmiguel.com", role: "Employer", dateRegistered: "2026-02-28", status: "Active" },
  { id: 3, name: "Elias Mercado", email: "elias.mercado@supervisor.sm.com", role: "Supervisor", dateRegistered: "2026-03-05", status: "Active" },
  { id: 4, name: "Sisa Lopez", email: "sisa.lopez@coordinator.pup.edu.ph", role: "Coordinator", dateRegistered: "2026-02-15", status: "Active" },
  { id: 5, name: "Pedro Penduko", email: "pedro@student.ust.edu.ph", role: "Student", dateRegistered: "2026-03-10", status: "Pending" },
  { id: 6, name: "Juan Tamad", email: "juan.tamad@student.dlsu.edu.ph", role: "Student", dateRegistered: "2026-03-12", status: "Suspended" },
  { id: 7, name: "Basilio Santos", email: "basilio@employer.globe.com.ph", role: "Employer", dateRegistered: "2026-03-02", status: "Active" },
  { id: 8, name: "Crispin Santos", email: "crispin@supervisor.globe.com.ph", role: "Supervisor", dateRegistered: "2026-03-02", status: "Active" },
  { id: 9, name: "Padre Damaso", email: "damaso@coordinator.ateneo.edu", role: "Coordinator", dateRegistered: "2026-01-20", status: "Active" },
  { id: 10, name: "Doña Victorina", email: "victorina@employer.ayala.com", role: "Employer", dateRegistered: "2026-02-22", status: "Active" },
  { id: 11, name: "Simoun Ibarra", email: "simoun@student.up.edu.ph", role: "Student", dateRegistered: "2026-03-14", status: "Active" },
  { id: 12, name: "Juli de las Alas", email: "juli@student.ust.edu.ph", role: "Student", dateRegistered: "2026-03-15", status: "Pending" },
  { id: 13, name: "Pilosopo Tasyo", email: "tasyo@coordinator.feu.edu.ph", role: "Coordinator", dateRegistered: "2026-02-01", status: "Active" },
  { id: 14, name: "Kapitan Tiago", email: "tiago@employer.jollibee.com", role: "Employer", dateRegistered: "2026-03-08", status: "Active" },
  { id: 15, name: "Salome Cruz", email: "salome@student.pup.edu.ph", role: "Student", dateRegistered: "2026-03-17", status: "Active" },
  { id: 16, name: "Isagani Rizal", email: "isagani@student.mapua.edu.ph", role: "Student", dateRegistered: "2026-03-18", status: "Active" },
  { id: 17, name: "Paulita Gomez", email: "paulita@student.dlsu.edu.ph", role: "Student", dateRegistered: "2026-03-19", status: "Pending" },
  { id: 18, name: "Don Custodio", email: "custodio@supervisor.jollibee.com", role: "Supervisor", dateRegistered: "2026-03-09", status: "Active" },
  { id: 19, name: "Ben Zayb", email: "benzayb@coordinator.nu.edu.ph", role: "Coordinator", dateRegistered: "2026-02-10", status: "Suspended" },
  { id: 20, name: "Cabesang Tales", email: "tales@employer.meralco.com.ph", role: "Employer", dateRegistered: "2026-03-20", status: "Pending" }
];

export const verificationsList = [
  { id: 1, name: "San Miguel Corporation", organization: "SMC Logistics", email: "hr@sanmiguel.com", role: "Employer", dateSubmitted: "2026-03-19", status: "Pending", document: "sec_cert.pdf" },
  { id: 2, name: "PUP Coordinator Team", organization: "Polytechnic University of the Philippines", email: "coordinator@pup.edu.ph", role: "Coordinator", dateSubmitted: "2026-03-18", status: "Pending", document: "moa_pup.pdf" },
  { id: 3, name: "Ayala Land Inc.", organization: "Ayala Property Mgmt", email: "careers@ayala.com", role: "Employer", dateSubmitted: "2026-03-17", status: "Pending", document: "bir_2303.pdf" },
  { id: 4, name: "Globe Telecom", organization: "Globe Corporate", email: "verify@globe.com.ph", role: "Employer", dateSubmitted: "2026-03-15", status: "Approved", document: "sec_cert.pdf", actionDate: "2026-03-16" },
  { id: 5, name: "UST Architecture Dept", organization: "University of Santo Tomas", email: "arch@ust.edu.ph", role: "Coordinator", dateSubmitted: "2026-03-14", status: "Rejected", document: "moa_ust.pdf", actionDate: "2026-03-15", remarks: "Missing official signature." }
];

export const internshipListings = [
  { id: 1, company: "San Miguel Corp", title: "Software Engineer Intern", department: "IT Dept", slots: 5, postedDate: "2026-03-01", status: "Active", industry: "Manufacturing" },
  { id: 2, company: "Globe Telecom", title: "Data Analyst Intern", department: "Network Ops", slots: 3, postedDate: "2026-03-02", status: "Active", industry: "Telecom" },
  { id: 3, company: "Ayala Land", title: "Civil Engineer Intern", department: "Construction", slots: 8, postedDate: "2026-02-28", status: "Flagged", industry: "Real Estate", remarks: "Safety standards verification needed." },
  { id: 4, company: "Jollibee Foods", title: "Marketing Intern", department: "Brand Marketing", slots: 4, postedDate: "2026-03-05", status: "Pending", industry: "F&B" },
  { id: 5, company: "Meralco", title: "Electrical Engineer Intern", department: "Power Grid", slots: 6, postedDate: "2026-02-25", status: "Closed", industry: "Utilities" },
  { id: 6, company: "SGV & Co.", title: "Accounting Intern", department: "Audit", slots: 10, postedDate: "2026-03-08", status: "Active", industry: "Finance" },
  { id: 7, company: "BDO Unibank", title: "Bank Teller Intern", department: "Branch Ops", slots: 12, postedDate: "2026-03-09", status: "Active", industry: "Banking" },
  { id: 8, company: "Accenture PH", title: "Cloud Associate Intern", department: "Technology", slots: 15, postedDate: "2026-03-10", status: "Active", industry: "IT Consulting" },
  { id: 9, company: "Shopee Philippines", title: "UX/UI Designer Intern", department: "Product Team", slots: 2, postedDate: "2026-03-11", status: "Pending", industry: "E-Commerce" },
  { id: 10, company: "Grab PH", title: "Operations Coordinator Intern", department: "Logistics", slots: 4, postedDate: "2026-03-12", status: "Flagged", industry: "Logistics", remarks: "Work hours exceed student limits." }
];

export const matchingSettings = {
  weights: { skills: 40, location: 20, course: 30, availability: 10 },
  threshold: 60,
  maxMatches: 3,
  autoAccept: false,
  notifyCoordinator: true,
  lastRun: "2026-03-20 14:30:00",
  lastRunMatches: 24
};

export const matchResults = [
  { id: 1, student: "Maria Clara", company: "San Miguel Corp", position: "Software Engineer Intern", score: 85 },
  { id: 2, student: "Salome Cruz", company: "Globe Telecom", position: "Data Analyst Intern", score: 78 },
  { id: 3, student: "Isagani Rizal", company: "Accenture PH", position: "Cloud Associate Intern", score: 92 },
  { id: 4, student: "Pedro Penduko", company: "SGV & Co.", position: "Accounting Intern", score: 65 },
  { id: 5, student: "Juan Tamad", company: "BDO Unibank", position: "Bank Teller Intern", score: 72 }
];

export const reportsData = {
  academicTerm: "1st Sem 2026–2027",
  totalEnrolled: 180,
  totalPlaced: 145,
  totalCompleted: 60,
  avgFinalGrade: "1.25",
  placementRate: 80.5,
  completionRate: 33.3,
  courseBreakdown: [
    { course: "BSIT", enrolled: 80, placed: 70 },
    { course: "BSCS", enrolled: 40, placed: 35 },
    { course: "BSBA", enrolled: 40, placed: 30 },
    { course: "BSCPE", enrolled: 20, placed: 10 }
  ],
  gradeDistribution: {
    excellent: { count: 40, pct: 66.6 },
    satisfactory: { count: 15, pct: 25.0 },
    needsImprovement: { count: 4, pct: 6.6 },
    failed: { count: 1, pct: 1.6 }
  },
  topEmployers: [
    { company: "Accenture", interns: 25, score: 4.8, rate: 95 },
    { company: "San Miguel", interns: 15, score: 4.7, rate: 100 },
    { company: "Globe", interns: 12, score: 4.5, rate: 90 }
  ]
};

export const auditLogs = [
  ...Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    timestamp: new Date(Date.now() - i * 3600000).toISOString().replace('T', ' ').substring(0, 19),
    user: ["Juan dela Cruz", "Padre Damaso", "Kapitan Tiago", "Sisa Lopez"][i % 4],
    role: ["Admin", "Coordinator", "Employer", "Coordinator"][i % 4],
    action: ["Approved listing", "Suspended account", "Triggered matching", "Updated user details", "Generated system report"][i % 5],
    affectedRecord: `Record #${100 + i}`,
    ipAddress: `192.168.1.${10 + i}`,
    type: ["Update", "Create", "Delete", "System", "Login"][i % 5]
  }))
];

export const systemSettings = {
  academicYear: "2026–2027",
  semester: "1st Semester",
  hoursRequired: { BSIT: 486, BSCS: 486, BSBA: 400, BSCPE: 486 },
  permissions: [
    { role: "Student", postListings: false, approveApps: false, evaluate: false, reports: false, manageUsers: false },
    { role: "Employer", postListings: true, approveApps: true, evaluate: false, reports: false, manageUsers: false },
    { role: "Supervisor", postListings: false, approveApps: false, evaluate: true, reports: false, manageUsers: false },
    { role: "Coordinator", postListings: false, approveApps: true, evaluate: true, reports: true, manageUsers: false }
  ],
  maintenanceMode: false
};

export const notificationsList = [
  { id: 1, icon: "user", message: "New employer registered: Mercury Drug Corp", timestamp: "5 mins ago", read: false, type: "system" },
  { id: 2, icon: "briefcase", message: "Listing flagged by automatic filter: Grab PH", timestamp: "1 hour ago", read: false, type: "system" },
  { id: 3, icon: "check", message: "Matching Engine complete. 24 matches generated.", timestamp: "2 hours ago", read: true, type: "system" },
  { id: 4, icon: "alert-triangle", message: "System maintenance scheduled for tonight.", timestamp: "1 day ago", read: true, type: "announcement" }
];

export const sentAnnouncements = [
  { id: 1, title: "Welcome to OJT 2026", target: "All", dateSent: "2026-03-01", sentBy: "Juan dela Cruz" },
  { id: 2, title: "Deadline for Listing Submission", target: "Employers", dateSent: "2026-03-10", sentBy: "Juan dela Cruz" }
];
