/**
 * CSV parser to extract student details
 * Supports formats: 
 * 1. StudentID, FirstName, LastName, Email, Course
 * 2. StudentID, FullName, Email, Course
 * 3. Email, FirstName, LastName, StudentID (legacy)
 * 
 * @param {string} csvText - The content of the CSV file
 * @returns {Array} - Array of student objects { email, firstName, lastName, studentId, course }
 */
export const parseStudentCSV = (csvText) => {
  const lines = csvText.split(/\r?\n/);
  if (lines.length === 0) return [];

  const students = [];
  const header = lines[0].toLowerCase();
  
  // Default mapping for user's requested format: StudentID, FirstName, LastName, Email, Course
  let mapping = {
    id: 0,
    first: 1,
    last: 2,
    email: 3,
    course: 4,
    hasLastName: true
  };

  // If header exists, try to be smart and detect columns
  const isHeader = header.includes('email') || header.includes('id') || header.includes('name');
  let startIndex = isHeader ? 1 : 0;

  if (isHeader) {
    const cols = header.split(',').map(c => c.trim().toLowerCase());
    
    const idIdx = cols.findIndex(c => c.includes('id'));
    const emailIdx = cols.findIndex(c => c.includes('email'));
    const courseIdx = cols.findIndex(c => c.includes('course'));
    const firstIdx = cols.findIndex(c => c.includes('first') || c.includes('given'));
    const lastIdx = cols.findIndex(c => c.includes('last') || c.includes('family') || c.includes('surname'));
    const fullIdx = cols.findIndex(c => c.includes('name') && !c.includes('first') && !c.includes('last'));

    if (idIdx !== -1) mapping.id = idIdx;
    if (emailIdx !== -1) mapping.email = emailIdx;
    if (courseIdx !== -1) mapping.course = courseIdx;

    if (firstIdx !== -1 && lastIdx !== -1) {
      mapping.first = firstIdx;
      mapping.last = lastIdx;
      mapping.hasLastName = true;
    } else if (fullIdx !== -1) {
      mapping.first = fullIdx;
      mapping.hasLastName = false;
    }
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',').map(part => part.trim().replace(/^"|"$/g, ''));
    
    if (parts.length >= 2) {
      let studentId = mapping.id < parts.length ? parts[mapping.id] : '';
      let email = mapping.email < parts.length ? parts[mapping.email] : '';
      let course = mapping.course < parts.length ? parts[mapping.course] : 'BSIT';
      let firstName = '';
      let lastName = '';

      if (mapping.hasLastName) {
        firstName = parts[mapping.first] || '';
        lastName = parts[mapping.last] || '';
      } else {
        const nameParts = (parts[mapping.first] || '').split(' ');
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ') || 'Student';
      }

      // Final validation: if we couldn't find email in the mapping, try to find it by @
      if (!email || !email.includes('@')) {
        const foundEmail = parts.find(p => p.includes('@'));
        if (foundEmail) email = foundEmail;
      }

      if (email && email.includes('@')) {
        students.push({ 
          email, 
          firstName, 
          lastName, 
          studentId: studentId || `S-${Date.now()}-${i}`,
          course 
        });
      }
    }
  }
  
  return students;
};
