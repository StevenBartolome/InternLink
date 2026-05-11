/**
 * Simple CSV parser to extract email and name from a file string
 * @param {string} csvText - The content of the CSV file
 * @returns {Array} - Array of student objects { email, firstName, lastName, studentId }
 */
export const parseStudentCSV = (csvText) => {
  const lines = csvText.split(/\r?\n/);
  const students = [];
  
  // Skip header if it exists (check if first line contains 'email' or 'name')
  let startIndex = 0;
  if (lines[0].toLowerCase().includes('email') || lines[0].toLowerCase().includes('name')) {
    startIndex = 1;
  }
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split by comma, handling potential quotes
    const parts = line.split(',').map(part => part.trim().replace(/^"|"$/g, ''));
    
    if (parts.length >= 2) {
      // Expected format: email, name, studentId (optional)
      // or email, firstName, lastName, studentId (optional)
      const email = parts[0];
      let firstName = '';
      let lastName = '';
      let studentId = '';
      
      if (parts.length === 2) {
        // email, fullName
        const nameParts = parts[1].split(' ');
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ') || 'Student';
      } else if (parts.length >= 3) {
        // email, firstName, lastName, studentId?
        firstName = parts[1];
        lastName = parts[2];
        studentId = parts[3] || '';
      }
      
      if (email && email.includes('@')) {
        students.push({ email, firstName, lastName, studentId });
      }
    }
  }
  
  return students;
};
