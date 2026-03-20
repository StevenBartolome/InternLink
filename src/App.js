import React, { useState } from 'react';
import './App.css';
import LandingPage from './screens/LandingPage/LandingPage';
import Login from './screens/Login/Login';
import Register from './screens/Register/Register';
import StudentDashboard from './screens/StudentDashboard/StudentDashboard';

function App() {
  const [view, setView] = useState('landing');


  return (
    <div className="App">
      {view === 'landing' && <LandingPage onNavigate={setView} />}
      {view === 'login' && <Login onNavigate={setView} />}
      {view === 'register' && <Register onNavigate={setView} />}
      {view === 'studentDashboard' && <StudentDashboard onNavigate={setView} />}
    </div>
  );
}


export default App;

