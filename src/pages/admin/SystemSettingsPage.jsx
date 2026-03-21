// src/pages/admin/SystemSettingsPage.jsx
import React, { useState } from 'react';
import { Settings, Clock, Shield, AlertOctagon, Save, Check } from 'lucide-react';
import { systemSettings } from '../../data/adminMockData';
import '../../assets/css/admin/SystemSettingsPage.css';

const SystemSettingsPage = () => {
  const [ay, setAy] = useState(systemSettings.academicYear);
  const [sem, setSem] = useState(systemSettings.semester);
  const [hours, setHours] = useState(systemSettings.hoursRequired);
  const [permissions, setPermissions] = useState(systemSettings.permissions);
  const [maintenance, setMaintenance] = useState(systemSettings.maintenanceMode);

  const [isSaved, setIsSaved] = useState(false);

  const handleHourChange = (course, value) => {
    setHours({ ...hours, [course]: parseInt(value) });
  };

  const handlePermissionToggle = (roleIndex, permissionKey) => {
    setPermissions(permissions.map((p, index) => {
      if (index === roleIndex) {
        return { ...p, [permissionKey]: !p[permissionKey] };
      }
      return p;
    }));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); // Reset success state
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Academic Year Setttings */}
        <div className="settings-block">
          <div className="block-header">
            <Settings size={20} className="block-icon" />
            <h3>Academic Cycle</h3>
          </div>
          <div className="block-content">
            <div className="form-group-row">
              <div className="form-group">
                <label>Current Academic Year</label>
                <input type="text" value={ay} onChange={e => setAy(e.target.value)} placeholder="e.g. 2026-2027" />
              </div>
              <div className="form-group">
                <label>Active Semester</label>
                <select value={sem} onChange={e => setSem(e.target.value)}>
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="Summer">Summer Term</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* OJT Hours Requirements */}
        <div className="settings-block">
          <div className="block-header">
            <Clock size={20} className="block-icon" />
            <h3>OJT Hourly Requirements</h3>
          </div>
          <div className="block-content">
            <div className="hours-grid">
              {Object.entries(hours).map(([course, hrs]) => (
                <div key={course} className="hour-item">
                  <label>{course}</label>
                  <div className="hour-input-wrapper">
                    <input type="number" value={hrs} onChange={e => handleHourChange(course, e.target.value)} />
                    <span className="unit">hrs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Roles & Permissions */}
        <div className="settings-block">
          <div className="block-header">
            <Shield size={20} className="block-icon" />
            <h3>Roles & Permissions</h3>
          </div>
          <div className="block-content table-responsive">
            <table className="permissions-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Can Post Listings</th>
                  <th>Can Approve Apps</th>
                  <th>Can Evaluate</th>
                  <th>Can Gen Reports</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm, index) => (
                  <tr key={index}>
                    <td className="role-name-cell">{perm.role}</td>
                    <td>
                      <input type="checkbox" checked={perm.postListings} onChange={() => handlePermissionToggle(index, 'postListings')} />
                    </td>
                    <td>
                      <input type="checkbox" checked={perm.approveApps} onChange={() => handlePermissionToggle(index, 'approveApps')} />
                    </td>
                    <td>
                      <input type="checkbox" checked={perm.evaluate} onChange={() => handlePermissionToggle(index, 'evaluate')} />
                    </td>
                    <td>
                      <input type="checkbox" checked={perm.reports} onChange={() => handlePermissionToggle(index, 'reports')} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="settings-block maintenance-mode">
          <div className="block-header">
            <AlertOctagon size={20} className="block-icon danger-icon" />
            <h3>Maintenance Mode</h3>
          </div>
          <div className="block-content">
            <div className="maintenance-toggle">
              <div className="toggle-info">
                <p className="toggle-title">Enable Maintenance Mode</p>
                <p className="toggle-sub">Disables system access for non-admin users. A warning banner will display on login attempts.</p>
              </div>
              <label className="switch">
                <input type="checkbox" checked={maintenance} onChange={e => setMaintenance(e.target.checked)} />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Save Footer */}
        <div className="settings-footer">
          <button className={`save-all-btn ${isSaved ? 'success' : ''}`} onClick={handleSave}>
            {isSaved ? (
              <>
                <Check size={18} /> Settings Saved
              </>
            ) : (
              <>
                <Save size={18} /> Save All Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
