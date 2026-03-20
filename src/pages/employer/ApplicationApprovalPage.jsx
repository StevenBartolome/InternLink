import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { applicants } from '../../data/employerMockData';
import '../../assets/css/employer/ApplicationApprovalPage.css';

const ApplicationApprovalPage = () => {
  const [pendingApps, setPendingApps] = useState(
    applicants.filter(app => app.status === 'Pending')
  );
  const [remarks, setRemarks] = useState({});
  const [activeRejectId, setActiveRejectId] = useState(null);

  const handleApprove = (id) => {
    setPendingApps(pendingApps.filter(app => app.id !== id));
    // In a real app, update status in backend
  };

  const handleReject = (id) => {
    setPendingApps(pendingApps.filter(app => app.id !== id));
    setActiveRejectId(null);
  };

  const handleRemarkChange = (id, value) => {
    setRemarks(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="approval-container">
      <div className="approval-header">
        <h1>Application Approvals</h1>
        <p className="subtitle">Review and decide on pending applications ({pendingApps.length}).</p>
      </div>

      <div className="approval-list">
        {pendingApps.length > 0 ? (
          pendingApps.map(app => (
            <div key={app.id} className="approval-card">
              <div className="app-info">
                <div className="avatar-mini">
                  {app.studentName.charAt(0)}
                </div>
                <div>
                  <h4>{app.studentName}</h4>
                  <p className="sub-text">{app.position}</p>
                  <p className="date-text">Applied on: {app.dateApplied}</p>
                </div>
              </div>

              <div className="app-actions">
                {activeRejectId === app.id ? (
                  <div className="reject-remarks-box">
                    <input 
                      type="text" 
                      placeholder="Add rejection remarks (optional)" 
                      value={remarks[app.id] || ''} 
                      onChange={(e) => handleRemarkChange(app.id, e.target.value)}
                    />
                    <div className="action-buttons">
                      <button className="btn-confirm-reject" onClick={() => handleReject(app.id)}>Reject</button>
                      <button className="btn-cancel" onClick={() => setActiveRejectId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button className="btn-approve" onClick={() => handleApprove(app.id)}>
                      <Check size={18} /> Approve
                    </button>
                    <button className="btn-reject" onClick={() => setActiveRejectId(app.id)}>
                      <X size={18} /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No pending applications at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationApprovalPage;
