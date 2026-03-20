import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Power, RefreshCw } from 'lucide-react';
import { internshipListings } from '../../../data/employerMockData';
import StatusBadge from '../../../components/StatusBadge/StatusBadge';
import '../../../assets/css/employer/ManageListingsPage.css';

const ManageListingsPage = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState(internshipListings);

  const toggleStatus = (id) => {
    setListings(listings.map(listing => {
      if (listing.id === id) {
        return {
          ...listing,
          status: listing.status === 'Active' ? 'Inactive' : 'Active'
        };
      }
      return listing;
    }));
  };

  const handleEdit = (listing) => {
    navigate('/employer/post', { state: { listing } });
  };

  return (
    <div className="listings-container">
      <div className="listings-header">
        <div>
          <h1>Manage Internship Listings</h1>
          <p className="subtitle">View and manage your posted internship positions.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/employer/post')}>
          <Plus size={18} /> Post New Internship
        </button>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="listings-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Department</th>
                <th>Slots</th>
                <th>Date Posted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(listing => (
                <tr key={listing.id}>
                  <td>
                    <span className="font-semibold">{listing.jobTitle}</span>
                    <div className="sub-text">{listing.location}</div>
                  </td>
                  <td>{listing.department}</td>
                  <td>{listing.slotsAvailable}</td>
                  <td>{listing.datePosted}</td>
                  <td><StatusBadge status={listing.status} /></td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon" 
                        title="Edit"
                        onClick={() => handleEdit(listing)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className={`btn-icon ${listing.status === 'Active' ? 'text-danger' : 'text-success'}`} 
                        title={listing.status === 'Active' ? 'Deactivate' : 'Activate'}
                        onClick={() => toggleStatus(listing.id)}
                        disabled={listing.status === 'Pending Approval'}
                      >
                        <Power size={16} />
                      </button>
                      <button className="btn-icon" title="Repost">
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageListingsPage;
