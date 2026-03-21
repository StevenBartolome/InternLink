// src/pages/admin/AuditLogsPage.jsx
import React, { useState } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { auditLogs } from '../../data/adminMockData';
import '../../assets/css/admin/AuditLogsPage.css';

const AuditLogsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const roles = ['All', 'Admin', 'Coordinator', 'Employer', 'Supervisor'];
  const types = ['All', 'Create', 'Update', 'Delete', 'Login', 'System'];

  // Filter Logic
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.affectedRecord.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All' || log.role === selectedRole;
    const matchesType = selectedType === 'All' || log.type === selectedType;
    return matchesSearch && matchesRole && matchesType;
  });

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredLogs.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="audit-logs-page">
      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-group">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by user or action..." 
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        <div className="select-group">
          <div className="select-wrapper">
            <Filter size={16} className="select-icon" />
            <select value={selectedRole} onChange={e => { setSelectedRole(e.target.value); setCurrentPage(1); }}>
              {roles.map(r => <option key={r} value={r}>{r} Role</option>)}
            </select>
          </div>

          <div className="select-wrapper">
            <Filter size={16} className="select-icon" />
            <select value={selectedType} onChange={e => { setSelectedType(e.target.value); setCurrentPage(1); }}>
              {types.map(t => <option key={t} value={t}>{t} Type</option>)}
            </select>
          </div>

          <button className="export-btn">
            <Download size={18} /> Export Logs
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="table-responsive">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User Name</th>
              <th>Role</th>
              <th>Action</th>
              <th>Affected Record</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map(log => (
              <tr key={log.id}>
                <td className="timestamp-cell">{log.timestamp}</td>
                <td className="user-cell">{log.user}</td>
                <td>
                  <span className={`role-badge ${log.role.toLowerCase()}`}>{log.role}</span>
                </td>
                <td>
                  <span className={`action-badge ${log.type.toLowerCase()}`}>{log.action}</span>
                </td>
                <td className="record-cell">{log.affectedRecord}</td>
                <td className="ip-cell">{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Container */}
      {filteredLogs.length > rowsPerPage && (
        <div className="pagination-container">
          <span className="pagination-info">
            Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredLogs.length)} of {filteredLogs.length} entries
          </span>
          <div className="pagination-controls">
            <button className="page-btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="page-indicator">Page <strong>{currentPage}</strong> of {totalPages}</span>
            <button className="page-btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
