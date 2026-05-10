// src/context/AuthContext.js
// Simple mock authentication context for role-based routing.
// In production this would integrate with Supabase auth.

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Mock user presets for demo/development
const MOCK_USERS = {
  'admin@internlink.edu': { role: 'admin', name: 'System Admin', id: 'admin-001' },
  'ojthead@internlink.edu': { role: 'ojt-head', name: 'Dr. Maria Clara Santos', id: 'head-001', course: 'BSIT', assignedCourse: 'BSIT', isFirstLogin: false },
  'student@internlink.edu': { role: 'student', name: 'Maria Gabriela Santos', id: 'stud-001', studentId: '2023-00042', course: 'BSIT', currentStage: 'PRE_INTERNSHIP' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    try {
      const saved = localStorage.getItem('internlink_user');
      if (saved) setUser(JSON.parse(saved));
    } catch (_) {}
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock auth — in production, replace with supabase.auth.signIn
    const mockUser = MOCK_USERS[email.toLowerCase()];
    if (mockUser && password.length >= 6) {
      const userData = { ...mockUser, email };
      setUser(userData);
      localStorage.setItem('internlink_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, error: 'Invalid email or password.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('internlink_user');
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('internlink_user', JSON.stringify(updated));
  };

  // Called after student registers via COR
  const registerStudent = (studentData) => {
    const userData = {
      role: 'student',
      name: studentData.studentName,
      email: studentData.email,
      id: `stud-${Date.now()}`,
      studentId: studentData.studentId,
      course: studentData.courseCode,
      yearLevel: studentData.yearLevel,
      currentStage: 'PRE_INTERNSHIP',
      registeredAt: new Date().toISOString(),
    };
    setUser(userData);
    localStorage.setItem('internlink_user', JSON.stringify(userData));
    return userData;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, registerStudent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
