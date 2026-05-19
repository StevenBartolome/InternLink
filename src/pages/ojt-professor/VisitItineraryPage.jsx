// src/pages/ojt-professor/VisitItineraryPage.jsx
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Map, Plus, Calendar, Building2, MapPin, FileText, CheckCircle, Clock } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { mockVisitItinerary } from '../../services/mocks/ojtProfessorMockData';
import Toast from '../../components/common/Toast';

export default function VisitItineraryPage() {
  const { showToast } = useOutletContext() || {};
  const [visits, setVisits] = useState(mockVisitItinerary);
  const [showForm, setShowForm] = useState(false);
  const [editingNotes, setEditingNotes] = useState({});
  const [localToast, setLocalToast] = useState(null);
  const [newVisit, setNewVisit] = useState({ date: '', location: '', notes: '' });

  const notify = (msg, type) => {
    if (showToast) showToast(msg, type);
    else setLocalToast({ message: msg, type });
  };

  const handleAddVisit = (e) => {
    e.preventDefault();
    const visit = { id: `v${Date.now()}`, ...newVisit, students: [], status: 'SCHEDULED' };
    setVisits(prev => [...prev, visit]);
    setNewVisit({ date: '', location: '', notes: '' });
    setShowForm(false);
    notify('Visit scheduled!', 'success');
  };

  const handleSaveNotes = (id) => {
    setVisits(prev => prev.map(v => v.id !== id ? v : { ...v, notes: editingNotes[id] ?? v.notes }));
    setEditingNotes(prev => { const n = { ...prev }; delete n[id]; return n; });
    notify('Visit notes saved.', 'success');
  };

  const handleComplete = (id) => {
    setVisits(prev => prev.map(v => v.id !== id ? v : { ...v, status: 'COMPLETED' }));
    notify('Visit marked as completed!', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {localToast && <Toast message={localToast.message} type={localToast.type} onClose={() => setLocalToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain }}>Visit Itinerary</h1>
          <p style={{ margin: '4px 0 0', color: theme.colors.textMuted, fontSize: '0.875rem' }}>Plan and log company visits, group students by location, and record observations.</p>
        </div>
        <button onClick={() => setShowForm(p => !p)} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}>
          <Plus size={16} /> Schedule Visit
        </button>
      </div>

      {showForm && (
        <div style={{ ...commonStyles.dashboardCard, padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontWeight: 700, color: theme.colors.textMain }}>New Company Visit</h3>
          <form onSubmit={handleAddVisit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: theme.colors.textMuted, marginBottom: '4px' }}>Date</label>
                <input type="date" required style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }} value={newVisit.date} onChange={e => setNewVisit(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div style={{ flex: 2, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: theme.colors.textMuted, marginBottom: '4px' }}>Location</label>
                <input type="text" required placeholder="e.g. BGC, Taguig City" style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }} value={newVisit.location} onChange={e => setNewVisit(p => ({ ...p, location: e.target.value }))} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: theme.colors.textMuted, marginBottom: '4px' }}>Notes</label>
              <textarea placeholder="Pre-visit notes or reminders..." style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box', minHeight: '70px', resize: 'vertical' }}
                value={newVisit.notes} onChange={e => setNewVisit(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}>Cancel</button>
              <button type="submit" style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}>Schedule</button>
            </div>
          </form>
        </div>
      )}

      {visits.map(visit => (
        <div key={visit.id} style={{ ...commonStyles.dashboardCard, padding: '24px', border: visit.status === 'COMPLETED' ? '1px solid #bbf7d0' : `1px solid ${theme.colors.border}`, backgroundColor: visit.status === 'COMPLETED' ? '#f0fdf4' : '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <Calendar size={18} color={theme.colors.primary} />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: theme.colors.textMain }}>{visit.date}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                  backgroundColor: visit.status === 'COMPLETED' ? '#dcfce7' : '#dbeafe',
                  color: visit.status === 'COMPLETED' ? '#15803d' : '#1d4ed8' }}>
                  {visit.status === 'COMPLETED' ? <CheckCircle size={12} /> : <Clock size={12} />}
                  {visit.status}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: theme.colors.textMuted, fontSize: '0.875rem' }}>
                <MapPin size={15} /> {visit.location}
              </div>
            </div>
            {visit.status !== 'COMPLETED' && (
              <button onClick={() => handleComplete(visit.id)} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, backgroundColor: '#16a34a', fontSize: '0.85rem' }}>
                <CheckCircle size={15} /> Mark Completed
              </button>
            )}
          </div>

          {visit.students.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Students at this location</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {visit.students.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 12px', backgroundColor: theme.colors.bgSecondary, borderRadius: '8px' }}>
                    <Building2 size={15} color={theme.colors.primary} />
                    <span style={{ fontWeight: 600, color: theme.colors.textMain, fontSize: '0.875rem' }}>{s.name}</span>
                    <span style={{ color: theme.colors.textMuted, fontSize: '0.8rem' }}>@ {s.company}</span>
                    <span style={{ color: theme.colors.textMuted, fontSize: '0.75rem', marginLeft: 'auto' }}>{s.address}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={13} /> Notes / Observations
            </div>
            {editingNotes[visit.id] !== undefined ? (
              <div>
                <textarea value={editingNotes[visit.id]} onChange={e => setEditingNotes(p => ({ ...p, [visit.id]: e.target.value }))}
                  style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical', marginBottom: '8px' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setEditingNotes(p => { const n = { ...p }; delete n[visit.id]; return n; })} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, fontSize: '0.82rem' }}>Cancel</button>
                  <button onClick={() => handleSaveNotes(visit.id)} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, fontSize: '0.82rem' }}>Save Notes</button>
                </div>
              </div>
            ) : (
              <div onClick={() => setEditingNotes(p => ({ ...p, [visit.id]: visit.notes }))}
                style={{ padding: '10px 12px', backgroundColor: theme.colors.bgSecondary, borderRadius: '8px', fontSize: '0.875rem', color: visit.notes ? theme.colors.textMain : theme.colors.textMuted, cursor: 'pointer', minHeight: '40px' }}>
                {visit.notes || 'Click to add notes or observations...'}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
