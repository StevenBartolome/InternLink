import React, { useState } from 'react';
import { Check, X, AlertCircle, Calendar, Users, Briefcase } from 'lucide-react';
import StatusBadge from '../../../components/coordinator/StatusBadge';
import { mockEmployerListings } from '../../../data/coordinatorMockData';
import '../../../assets/css/coordinator/InternshipApprovalPage.css';

const InternshipApprovalPage = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [remarks, setRemarks] = useState({});
  const [listings, setListings] = useState(mockEmployerListings);

  const filteredListings = listings.filter(listing => listing.status === activeTab);

  const handleApprove = (id) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'Approved', remarks: 'Approved' } : l));
  };

  const handleFlag = (id) => {
    const remarkText = remarks[id] || 'Flagged for review';
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'Flagged', remarks: remarkText } : l));
  };

  const handleRemarkChange = (id, value) => {
    setRemarks(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="internship-approval-page">
      {/* Tabs */}
      <div className="approval-tabs">
        {['Pending', 'Approved', 'Flagged'].map((tab) => (
          <button 
            key={tab} 
            className={`tab-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} Listings
            <span className="tab-count">
              {listings.filter(l => l.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      <div className="listings-grid">
        {filteredListings.length === 0 ? (
          <div className="empty-state coordinator-card">
            <Briefcase size={48} className="empty-icon" />
            <p>No {activeTab.toLowerCase()} listings found.</p>
          </div>
        ) : (
          filteredListings.map((listing) => (
            <div key={listing.id} className="listing-card coordinator-card">
              <div className="listing-header">
                <div>
                  <h4 className="position-title">{listing.position}</h4>
                  <p className="company-name">{listing.companyName}</p>
                </div>
                <StatusBadge status={listing.status} />
              </div>

              <div className="listing-details">
                <div className="detail-item">
                  <Briefcase size={16} />
                  <span>{listing.department}</span>
                </div>
                <div className="detail-item">
                  <Users size={16} />
                  <span>{listing.slots} Slots</span>
                </div>
                <div className="detail-item">
                  <Calendar size={16} />
                  <span>{listing.duration}</span>
                </div>
                <div className="detail-item">
                  <AlertCircle size={16} />
                  <span>Submitted: {listing.dateSubmitted}</span>
                </div>
              </div>

              {listing.status === 'Pending' ? (
                <div className="listing-actions">
                  <div className="remarks-input-wrapper">
                    <input 
                      type="text" 
                      placeholder="Add remarks or reason for flag..." 
                      value={remarks[listing.id] || ''}
                      onChange={(e) => handleRemarkChange(listing.id, e.target.value)}
                    />
                  </div>
                  <div className="action-buttons">
                    <button className="coordinator-btn btn-success btn-sm" onClick={() => handleApprove(listing.id)}>
                      <Check size={16} /> Approve
                    </button>
                    <button className="coordinator-btn btn-danger btn-sm" onClick={() => handleFlag(listing.id)}>
                      <X size={16} /> Flag/Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="listing-footer">
                  <p className="remarks-text">
                    <strong>Remarks:</strong> {listing.remarks || 'No remarks provided.'}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InternshipApprovalPage;
