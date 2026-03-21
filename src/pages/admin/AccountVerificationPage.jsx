// src/pages/admin/AccountVerificationPage.jsx
import React, { useState } from 'react';
import { Check, X, FileText, AlertCircle, Info } from 'lucide-react';
import { verificationsList } from '../../data/adminMockData';
import '../../assets/css/admin/AccountVerificationPage.css';

const AccountVerificationPage = () => {
  const [verifications, setVerifications] = useState(verificationsList);
  const [activeTab, setActiveTab] = useState('Pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const filteredRequests = verifications.filter(req => req.status === activeTab);

  const handleApprove = (id) => {
    setVerifications(verifications.map(req => 
      req.id === id ? { ...req, status: 'Approved', actionDate: new Date().toISOString().split('T')[0] } : req
    ));
    if (selectedRequest && selectedRequest.id === id) setSelectedRequest(null);
  };

  const handleRejectTrigger = (request) => {
    setSelectedRequest(request);
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    setVerifications(verifications.map(req => 
      req.id === selectedRequest.id ? { 
        ...req, 
        status: 'Rejected', 
        remarks: remarks || 'Documents do not meet criteria.', 
        actionDate: new Date().toISOString().split('T')[0] 
      } : req
    ));
    setIsRejectModalOpen(false);
    setRemarks('');
    setSelectedRequest(null);
  };

  return (
    <div className="verification-page">
      {/* Tabs */}
      <div className="verification-tabs">
        {['Pending', 'Approved', 'Rejected'].map(tab => (
          <button 
            key={tab} 
            className={`tab-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab); setSelectedRequest(null); }}
          >
            {tab}
            <span className="tab-count">
              {verifications.filter(req => req.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      <div className="verification-content-wrapper">
        {/* List Section */}
        <div className="requests-list-container">
          {filteredRequests.length === 0 ? (
            <div className="empty-state">
              <Info size={40} className="empty-icon" />
              <p>No {activeTab.toLowerCase()} requests found.</p>
            </div>
          ) : (
            <div className="requests-cards">
              {filteredRequests.map(req => (
                <div 
                  key={req.id} 
                  className={`request-card ${selectedRequest && selectedRequest.id === req.id ? 'selected' : ''}`}
                  onClick={() => setSelectedRequest(req)}
                >
                  <div className="card-header">
                    <span className={`role-tag ${req.role.toLowerCase()}`}>{req.role}</span>
                    <span className="card-date">{req.dateSubmitted}</span>
                  </div>
                  <h4 className="req-name">{req.name}</h4>
                  <p className="req-org">{req.organization}</p>
                  <p className="req-email">{req.email}</p>
                  
                  {activeTab === 'Pending' && (
                    <div className="card-actions" onClick={e => e.stopPropagation()}>
                      <button className="card-btn approve" onClick={() => handleApprove(req.id)}>
                        <Check size={16} /> Approve
                      </button>
                      <button className="card-btn reject" onClick={() => handleRejectTrigger(req)}>
                        <X size={16} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="request-details-panel">
          {selectedRequest ? (
            <div className="details-panel-content">
              <h3>Verification Details</h3>
              <div className="detail-item">
                <label>User/Entity</label>
                <p className="detail-value text-bold">{selectedRequest.name}</p>
              </div>
              <div className="detail-item">
                <label>Organization / School</label>
                <p className="detail-value">{selectedRequest.organization}</p>
              </div>
              <div className="detail-item">
                <label>Email Address</label>
                <p className="detail-value">{selectedRequest.email}</p>
              </div>
              <div className="detail-item">
                <label>Date Submitted</label>
                <p className="detail-value">{selectedRequest.dateSubmitted}</p>
              </div>

              {selectedRequest.actionDate && (
                <div className="detail-item">
                  <label>Action Date</label>
                  <p className="detail-value">{selectedRequest.actionDate}</p>
                </div>
              )}

              {selectedRequest.remarks && (
                <div className="detail-item remarks-box">
                  <label>Remarks</label>
                  <p className="detail-value danger-text">{selectedRequest.remarks}</p>
                </div>
              )}

              <div className="detail-item docs-section">
                <label>Submitted Documents</label>
                <div className="doc-link">
                  <FileText size={20} className="doc-icon" />
                  <div className="doc-info">
                    <span className="doc-name">{selectedRequest.document}</span>
                    <span className="doc-size">PDF • 1.2 MB</span>
                  </div>
                  <button className="view-doc-btn">View</button>
                </div>
              </div>

              {selectedRequest.status === 'Pending' && (
                <div className="details-footer-actions">
                  <button className="detail-btn approve" onClick={() => handleApprove(selectedRequest.id)}>
                    <Check size={18} /> Approve Account
                  </button>
                  <button className="detail-btn reject" onClick={() => handleRejectTrigger(selectedRequest)}>
                    <X size={18} /> Reject Account
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="details-panel-placeholder">
              <AlertCircle size={48} className="placeholder-icon" />
              <p>Select a request from the list to view full details and documents.</p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Remarks Modal */}
      {isRejectModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content custom-form-modal">
            <button className="modal-close-btn" onClick={() => setIsRejectModalOpen(false)}><X size={20} /></button>
            <h3>Reject Verification</h3>
            <p className="modal-sub">Provide a reason for rejecting <strong>{selectedRequest?.name}</strong>.</p>
            <div className="form-group" style={{ width: '100%', marginTop: '1rem' }}>
              <label>Remarks / Reason</label>
              <textarea 
                rows="4" 
                placeholder="e.g. Missing signature, invalid document layout..." 
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                style={{ resize: 'none', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
              />
            </div>
            <button className="submit-form-btn danger-btn" onClick={handleConfirmReject} style={{ width: '100%', marginTop: '1rem', backgroundColor: 'var(--danger, #dc2626)' }}>
              Confirm Rejection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountVerificationPage;
