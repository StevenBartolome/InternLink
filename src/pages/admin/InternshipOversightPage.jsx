// src/pages/admin/InternshipOversightPage.jsx
import React, { useState } from 'react';
import { Search, Filter, Eye, Flag, ShieldAlert, CheckCircle, XCircle, Info } from 'lucide-react';
import { internshipListings } from '../../data/adminMockData';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import '../../assets/css/admin/InternshipOversightPage.css';

const InternshipOversightPage = () => {
  const [listings, setListings] = useState(internshipListings);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedListing, setSelectedListing] = useState(null);
  
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [remarks, setRemarks] = useState('');

  const industries = ['All', ...new Set(listings.map(l => l.industry))];
  const statuses = ['All', 'Active', 'Pending', 'Flagged', 'Closed'];

  // Summary Counts
  const total = listings.length;
  const active = listings.filter(l => l.status === 'Active').length;
  const pending = listings.filter(l => l.status === 'Pending').length;
  const flagged = listings.filter(l => l.status === 'Flagged').length;

  // Filter Logic
  const filteredListings = listings.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         l.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || l.status === selectedStatus;
    const matchesIndustry = selectedIndustry === 'All' || l.industry === selectedIndustry;
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const handleStatusChange = (id, newStatus, reason = '') => {
    setListings(listings.map(l => 
      l.id === id ? { ...l, status: newStatus, remarks: reason || l.remarks } : l
    ));
    if (selectedListing && selectedListing.id === id) {
      setSelectedListing({ ...selectedListing, status: newStatus, remarks: reason || selectedListing.remarks });
    }
    setIsFlagModalOpen(false);
    setRemarks('');
  };

  const triggerFlagModal = () => {
    if (!selectedListing) return;
    setIsFlagModalOpen(true);
  };

  return (
    <div className="oversight-page">
      {/* Summary Bar */}
      <div className="oversight-summary-bar">
        <div className="summary-item total">
          <span className="summary-label">Total Listings</span>
          <span className="summary-value">{total}</span>
        </div>
        <div className="summary-item active">
          <span className="summary-label">Active</span>
          <span className="summary-value">{active}</span>
        </div>
        <div className="summary-item pending">
          <span className="summary-label">Pending Approval</span>
          <span className="summary-value">{pending}</span>
        </div>
        <div className="summary-item flagged">
          <span className="summary-label">Flagged</span>
          <span className="summary-value">{flagged}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by company or title..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="select-group">
          <div className="select-wrapper">
            <Filter size={16} className="select-icon" />
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
              {statuses.map(status => <option key={status} value={status}>{status} Status</option>)}
            </select>
          </div>

          <div className="select-wrapper">
            <Filter size={16} className="select-icon" />
            <select value={selectedIndustry} onChange={e => setSelectedIndustry(e.target.value)}>
              {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="oversight-content-wrapper">
        {/* Table/List View */}
        <div className="listings-container">
          <div className="table-responsive">
            <table className="listings-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Position Title</th>
                  <th>Department</th>
                  <th>Slots</th>
                  <th>Posted Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map(l => (
                  <tr 
                    key={l.id} 
                    className={selectedListing && selectedListing.id === l.id ? 'selected-row' : ''}
                    onClick={() => setSelectedListing(l)}
                  >
                    <td className="company-name">{l.company}</td>
                    <td>{l.title}</td>
                    <td>{l.department}</td>
                    <td>{l.slots}</td>
                    <td>{l.postedDate}</td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                    <td>
                      <button className="view-details-btn" onClick={() => setSelectedListing(l)}>
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Details Panel */}
        <div className="details-panel">
          {selectedListing ? (
            <div className="panel-content">
              <div className="panel-header">
                <StatusBadge status={selectedListing.status} />
                <h3>{selectedListing.title}</h3>
                <p className="company-sub">{selectedListing.company} • {selectedListing.department}</p>
              </div>

              <div className="panel-section">
                <label>Target Industry</label>
                <p>{selectedListing.industry}</p>
              </div>

              <div className="panel-section">
                <label>Slots Available</label>
                <p>{selectedListing.slots} slot(s)</p>
              </div>

              <div className="panel-section">
                <label>Posted Date</label>
                <p>{selectedListing.postedDate}</p>
              </div>

              {selectedListing.remarks && (
                <div className="panel-section remarks-box">
                  <label>Admin System Flags</label>
                  <p className="danger-text">{selectedListing.remarks}</p>
                </div>
              )}

              <div className="panel-actions">
                {selectedListing.status === 'Pending' && (
                  <button className="panel-btn approve" onClick={() => handleStatusChange(selectedListing.id, 'Active')}>
                    <CheckCircle size={18} /> Approve
                  </button>
                )}
                
                {selectedListing.status !== 'Flagged' && selectedListing.status !== 'Closed' && (
                  <button className="panel-btn flag" onClick={triggerFlagModal}>
                    <Flag size={18} /> Flag Listing
                  </button>
                )}

                {selectedListing.status === 'Active' && (
                  <button className="panel-btn close-listing" onClick={() => handleStatusChange(selectedListing.id, 'Closed')}>
                    <XCircle size={18} /> Close Listing
                  </button>
                )}

                {(selectedListing.status === 'Closed' || selectedListing.status === 'Flagged') && (
                  <button className="panel-btn restore" onClick={() => handleStatusChange(selectedListing.id, 'Active')}>
                    <ShieldAlert size={18} /> Restore / Reactivate
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="panel-placeholder">
              <Info size={40} className="placeholder-icon" />
              <p>Select an internship listing from the table to view details or manage status.</p>
            </div>
          )}
        </div>
      </div>

      {/* Flag Modal */}
      {isFlagModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content custom-form-modal">
            <button className="modal-close-btn" onClick={() => setIsFlagModalOpen(false)}><Eye size={20} style={{ transform: 'rotate(45deg)' }} /></button>
            <h3>Flag Internship Listing</h3>
            <p className="modal-sub">Specify the reason for flagging <strong>{selectedListing?.title}</strong> by {selectedListing?.company}.</p>
            <div className="form-group" style={{ width: '100%', marginTop: '1rem' }}>
              <label>Remarks / Issue</label>
              <textarea 
                rows="4" 
                placeholder="e.g. Invalid salary terms, excessive hours..." 
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                style={{ resize: 'none', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
              />
            </div>
            <button className="submit-form-btn danger-btn" onClick={() => handleStatusChange(selectedListing.id, 'Flagged', remarks)} style={{ width: '100%', marginTop: '1rem', backgroundColor: 'var(--danger, #dc2626)' }}>
              Confirm Flag
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipOversightPage;
