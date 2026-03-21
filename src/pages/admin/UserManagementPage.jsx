// src/pages/admin/UserManagementPage.jsx
import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, ShieldAlert, Plus, Check, X } from 'lucide-react';
import { usersList } from '../../data/adminMockData';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import '../../assets/css/admin/UserManagementPage.css';

const UserManagementPage = () => {
  const [users, setUsers] = useState(usersList);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Modal States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // New User State
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Student', status: 'Active' });

  const roles = ['All', 'Student', 'Employer', 'Supervisor', 'Coordinator'];

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Action Handlers
  const handleSelectUser = (id) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const openConfirm = (type, user) => {
    setCurrentUser(user);
    if (type === 'delete') {
      setConfirmConfig({
        title: "Delete User",
        message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
        type: "danger",
        confirmText: "Delete",
        onConfirm: () => handleDelete(user.id)
      });
    } else if (type === 'suspend') {
      const isSuspended = user.status === 'Suspended';
      setConfirmConfig({
        title: isSuspended ? "Reactivate User" : "Suspend User",
        message: `Are you sure you want to ${isSuspended ? 'reactivate' : 'suspend'} ${user.name}?`,
        type: isSuspended ? "warning" : "danger",
        confirmText: isSuspended ? "Reactivate" : "Suspend",
        onConfirm: () => handleToggleSuspend(user.id)
      });
    }
    setIsConfirmOpen(true);
  };

  const handleDelete = (id) => {
    setUsers(users.filter(u => u.id !== id));
    setIsConfirmOpen(false);
    setSelectedUsers(prev => prev.filter(uid => uid !== id));
  };

  const handleToggleSuspend = (id) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'Suspended' ? 'Active' : 'Suspended' };
      }
      return u;
    }));
    setIsConfirmOpen(false);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    const id = users.length + 1;
    setUsers([...users, { id, ...newUser, dateRegistered: new Date().toISOString().split('T')[0] }]);
    setIsAddModalOpen(false);
    setNewUser({ name: '', email: '', role: 'Student', status: 'Active' });
  };

  const handleEditUser = (e) => {
    e.preventDefault();
    setUsers(users.map(u => u.id === currentUser.id ? currentUser : u));
    setIsEditModalOpen(false);
  };

  return (
    <div className="user-management-page">
      {/* Top Controls */}
      <div className="page-header-actions">
        <div className="search-filter-group">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="tabs-container">
            {roles.map(role => (
              <button 
                key={role} 
                className={`tab-btn ${selectedRole === role ? 'active' : ''}`}
                onClick={() => setSelectedRole(role)}
              >
                {role}s
              </button>
            ))}
          </div>
        </div>

        <button className="add-user-btn" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> Add User
        </button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className="bulk-actions-bar">
          <span>{selectedUsers.length} users selected</span>
          <div className="bulk-btns">
            <button className="bulk-btn suspend">Suspend Selected</button>
            <button className="bulk-btn delete">Delete Selected</button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="table-responsive">
        <table className="users-table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll}
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Date Registered</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className={selectedUsers.includes(user.id) ? 'selected-row' : ''}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </td>
                <td className="user-name-cell">{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.dateRegistered}</td>
                <td>
                  <StatusBadge status={user.status} />
                </td>
                <td>
                  <div className="table-actions">
                    <button className="action-icon-btn edit" onClick={() => { setCurrentUser(user); setIsEditModalOpen(true); }} title="Edit"><Edit size={16} /></button>
                    <button className="action-icon-btn suspend" onClick={() => openConfirm('suspend', user)} title={user.status === 'Suspended' ? 'Reactivate' : 'Suspend'}><ShieldAlert size={16} /></button>
                    <button className="action-icon-btn delete" onClick={() => openConfirm('delete', user)} title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Action Modal */}
      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText={confirmConfig.confirmText}
      />

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content custom-form-modal">
            <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
            <h3>Add New User</h3>
            <form onSubmit={handleAddUser} className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input type="text" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  <option value="Student">Student</option>
                  <option value="Employer">Employer</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Coordinator">Coordinator</option>
                </select>
              </div>
              <button type="submit" className="submit-form-btn">Create User</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && currentUser && (
        <div className="modal-overlay">
          <div className="modal-content custom-form-modal">
            <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
            <h3>Edit User</h3>
            <form onSubmit={handleEditUser} className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input type="text" required value={currentUser.name} onChange={e => setCurrentUser({...currentUser, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" required value={currentUser.email} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={currentUser.role} onChange={e => setCurrentUser({...currentUser, role: e.target.value})}>
                  <option value="Student">Student</option>
                  <option value="Employer">Employer</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Coordinator">Coordinator</option>
                </select>
              </div>
              <button type="submit" className="submit-form-btn">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
