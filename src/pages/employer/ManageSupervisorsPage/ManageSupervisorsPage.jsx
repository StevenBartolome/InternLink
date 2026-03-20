// src/pages/employer/ManageSupervisorsPage/ManageSupervisorsPage.jsx
import React, { useState } from 'react';
import { Users, UserPlus, Mail, Building, ShieldCheck, Plus, X } from 'lucide-react';
import { supervisors as initialSupervisors } from '../../../data/employerMockData';
import '../../../assets/css/employer/ManageSupervisorsPage.css';

const ManageSupervisorsPage = () => {
  const [supervisorsList, setSupervisorsList] = useState(initialSupervisors);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSupervisor, setNewSupervisor] = useState({
    name: '',
    email: '',
    department: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSupervisor(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      const createdSupervisor = {
        id: supervisorsList.length + 1,
        ...newSupervisor
      };

      // Add to local state list
      setSupervisorsList([...supervisorsList, createdSupervisor]);
      
      // Update Mock structure Safely
      initialSupervisors.push(createdSupervisor);

      setIsSaving(false);
      setIsModalOpen(false);
      setNewSupervisor({ name: '', email: '', department: '' });
      alert('Supervisor registered successfully!');
    }, 1000);
  };

  return (
    <div className="manage-sups-container">
      <div className="page-header flex-between">
        <div>
          <h1 className="title">Manage Supervisors</h1>
          <p className="subtitle">View and register supervisors to monitor your interns.</p>
        </div>
        <button className="btn-add-sup" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={18} /> Register Supervisor
        </button>
      </div>

      <div className="card-supervisor list-card-full">
        <div className="table-responsive">
          <table className="sups-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {supervisorsList.map(sup => (
                <tr key={sup.id}>
                  <td>
                    <div className="sup-name-cell">
                      <div className="sup-avatar-mini">{sup.name.charAt(0)}</div>
                      <span>{sup.name}</span>
                    </div>
                  </td>
                  <td>{sup.email || 'N/A'}</td>
                  <td>
                    <span className="dept-tag">{sup.department}</span>
                  </td>
                  <td>
                    <span className="status-badge active-badge">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Modal for Registration */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register New Supervisor</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleRegister} className="register-form">
              <div className="form-group">
                <label><Users size={16} /> Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={newSupervisor.name} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Juan Perez"
                  required 
                />
              </div>

              <div className="form-group">
                <label><Mail size={16} /> Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={newSupervisor.email} 
                  onChange={handleInputChange} 
                  placeholder="name@company.com"
                  required 
                />
              </div>

              <div className="form-group">
                <label><Building size={16} /> Department</label>
                <input 
                  type="text" 
                  name="department" 
                  value={newSupervisor.department} 
                  onChange={handleInputChange} 
                  placeholder="e.g. IT, HR, Marketing"
                  required 
                />
              </div>

              <div className="form-group">
                <label><ShieldCheck size={16} /> Role</label>
                <input type="text" value="Supervisor" disabled className="readonly-input" />
              </div>

              <div className="form-actions-modal">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-custom" disabled={isSaving}>
                  {isSaving ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSupervisorsPage;
