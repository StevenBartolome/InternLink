// src/pages/ojt-professor/VisitItineraryPage.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Map, Plus, Calendar, Building2, MapPin, FileText, CheckCircle, Clock, 
  Sparkles, Compass, Search, Navigation, ChevronRight, AlertTriangle, Info, Trash2, Save, X
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { supabase } from '../../services/supabaseClient';
import Toast from '../../components/common/Toast';

export default function VisitItineraryPage() {
  const { showToast } = useOutletContext() || {};
  const [visits, setVisits] = useState([]);
  const [deployedStudents, setDeployedStudents] = useState([]);
  const [locationClusters, setLocationClusters] = useState({});
  const [loading, setLoading] = useState(true);
  const [localToast, setLocalToast] = useState(null);
  const [isDbMode, setIsDbMode] = useState(true);
  const [dbError, setDbError] = useState(null);

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [newVisit, setNewVisit] = useState({ date: '', location: '', notes: '' });
  const [editingNotes, setEditingNotes] = useState({});
  const [wizardAssignments, setWizardAssignments] = useState({});

  const notify = (msg, type = 'success') => {
    if (showToast) showToast(msg, type);
    else setLocalToast({ message: msg, type });
  };

  // 1. Fetch deployed students & group by geographical location
  const fetchStudentsAndClusters = async () => {
    try {
      const { data, error } = await supabase
        .from('student_internships')
        .select('*, companies(*), users:users!student_internships_student_id_fkey(*)')
        .eq('is_deployed', true);

      if (error) throw error;

      const studentsList = (data || []).map(item => ({
        id: item.student_id,
        name: item.users ? `${item.users.first_name} ${item.users.last_name}` : 'Unknown Student',
        company: item.companies ? item.companies.name : 'Unknown Company',
        address: item.companies ? item.companies.address : 'Address not set',
        lat: item.companies ? item.companies.latitude : null,
        lng: item.companies ? item.companies.longitude : null,
      }));

      setDeployedStudents(studentsList);

      // Group dynamically by Location (extract city/province from address)
      const clusters = {};
      studentsList.forEach(student => {
        const address = student.address || '';
        let clusterName = 'Others';
        
        if (address && address !== 'Address not set') {
          const parts = address.split(',').map(p => p.trim());
          if (parts.length >= 2) {
            // Check if the last part is country
            const last = parts[parts.length - 1];
            const secondLast = parts[parts.length - 2];
            if (last.toLowerCase() === 'philippines' || last.toLowerCase() === 'ph') {
              clusterName = secondLast;
            } else {
              clusterName = last;
            }
          } else {
            clusterName = parts[0] || 'Others';
          }
        }
        
        if (!clusters[clusterName]) {
          clusters[clusterName] = [];
        }
        clusters[clusterName].push(student);
      });

      setLocationClusters(clusters);
    } catch (err) {
      console.error('Error fetching students & clusters:', err);
      notify('Failed to load active student placements.', 'error');
    }
  };

  // 2. Load Visits from Database with Local Fallback
  const loadVisits = async () => {
    try {
      setLoading(true);
      setDbError(null);
      const { data, error } = await supabase
        .from('visit_itineraries')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        const errMsg = error.message || '';
        const errCode = error.code || '';
        
        if (errCode === '42501' || errMsg.toLowerCase().includes('permission denied')) {
          console.warn('visit_itineraries permission denied:', errMsg);
          setDbError('PERMISSION_DENIED');
          setIsDbMode(false);
          const local = localStorage.getItem('visit_itineraries');
          setVisits(local ? JSON.parse(local) : []);
        } else if (errCode === 'PGRST205' || errMsg.toLowerCase().includes('relation "visit_itineraries" does not exist')) {
          console.warn('visit_itineraries table not found. Falling back to local storage.');
          setDbError('NOT_FOUND');
          setIsDbMode(false);
          const local = localStorage.getItem('visit_itineraries');
          setVisits(local ? JSON.parse(local) : []);
        } else {
          throw error;
        }
      } else {
        setIsDbMode(true);
        setVisits(data || []);
      }
    } catch (err) {
      console.error('Failed to load itineraries from DB:', err);
      const errMsg = err?.message || (typeof err === 'string' ? err : '');
      const errCode = err?.code || '';
      
      if (errCode === '42501' || errMsg.toLowerCase().includes('permission denied') || errMsg.toLowerCase().includes('42501')) {
        setDbError('PERMISSION_DENIED');
      } else {
        setDbError('UNKNOWN');
      }
      setIsDbMode(false);
      const local = localStorage.getItem('visit_itineraries');
      setVisits(local ? JSON.parse(local) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndClusters();
    loadVisits();
  }, []);

  // Save / persist single visit helper (DB or Local)
  const saveVisit = async (visit) => {
    if (isDbMode) {
      try {
        const { data, error } = await supabase
          .from('visit_itineraries')
          .insert([visit])
          .select()
          .single();
        if (error) throw error;
        setVisits(prev => [...prev, data]);
      } catch (err) {
        console.error('Failed to save visit to DB:', err);
        notify('Failed to save to database. Saving locally instead.', 'warning');
        persistVisitLocally(visit);
      }
    } else {
      persistVisitLocally(visit);
    }
  };

  const persistVisitLocally = (visit) => {
    const updated = [...visits, visit];
    setVisits(updated);
    localStorage.setItem('visit_itineraries', JSON.stringify(updated));
  };

  // 3. Add Custom Manual Visit
  const handleAddVisit = async (e) => {
    e.preventDefault();
    if (!newVisit.date || !newVisit.location) {
      notify('Date and Location are required', 'warning');
      return;
    }

    // Lookup any deployed students at this location automatically
    const matchedStudents = deployedStudents.filter(s => 
      s.address.toLowerCase().includes(newVisit.location.toLowerCase()) ||
      newVisit.location.toLowerCase().includes(s.address.toLowerCase())
    );

    const visitPayload = {
      date: newVisit.date,
      location: newVisit.location,
      notes: newVisit.notes,
      students: matchedStudents,
      status: 'SCHEDULED'
    };

    await saveVisit(visitPayload);
    setNewVisit({ date: '', location: '', notes: '' });
    setShowForm(false);
    notify('📍 Visit scheduled successfully!');
  };

  // 4. Smart Auto-Generator (Group by geographical location)
  const handleGenerateItinerary = async () => {
    const clustersToSchedule = Object.keys(locationClusters).filter(loc => wizardAssignments[loc]);
    if (clustersToSchedule.length === 0) {
      notify('Please assign at least one visit date.', 'warning');
      return;
    }

    let count = 0;
    const pendingVisits = [];

    clustersToSchedule.forEach(loc => {
      const date = wizardAssignments[loc];
      const matchedStudents = locationClusters[loc];
      
      const visitPayload = {
        date: date,
        location: loc,
        notes: `Smart travel group visit for ${loc} cluster.`,
        students: matchedStudents,
        status: 'SCHEDULED'
      };
      pendingVisits.push(visitPayload);
      count++;
    });

    if (isDbMode) {
      try {
        const { data, error } = await supabase
          .from('visit_itineraries')
          .insert(pendingVisits)
          .select();
        if (error) throw error;
        setVisits(prev => [...prev, ...data]);
      } catch (err) {
        console.error('Failed to batch save to DB:', err);
        notify('Failed to save to database. Saving locally.', 'warning');
        const updated = [...visits, ...pendingVisits];
        setVisits(updated);
        localStorage.setItem('visit_itineraries', JSON.stringify(updated));
      }
    } else {
      const updated = [...visits, ...pendingVisits];
      setVisits(updated);
      localStorage.setItem('visit_itineraries', JSON.stringify(updated));
    }

    setWizardAssignments({});
    setShowWizard(false);
    notify(`✨ Optimized Travel Plan generated! Scheduled ${count} grouped visits.`);
  };

  // 5. Complete / Notes observations CRUD
  const handleComplete = async (id) => {
    const matched = visits.find(v => v.id === id);
    if (!matched) return;

    if (isDbMode) {
      try {
        const { error } = await supabase
          .from('visit_itineraries')
          .update({ status: 'COMPLETED' })
          .eq('id', id);
        if (error) throw error;
        setVisits(prev => prev.map(v => v.id !== id ? v : { ...v, status: 'COMPLETED' }));
        notify('✅ Visit marked as completed!');
      } catch (err) {
        console.error('Failed to update visit status in DB:', err);
        updateVisitLocally(id, { status: 'COMPLETED' });
      }
    } else {
      updateVisitLocally(id, { status: 'COMPLETED' });
      notify('✅ Visit marked as completed locally!');
    }
  };

  const handleSaveNotes = async (id) => {
    const notesValue = editingNotes[id];
    if (isDbMode) {
      try {
        const { error } = await supabase
          .from('visit_itineraries')
          .update({ notes: notesValue })
          .eq('id', id);
        if (error) throw error;
        setVisits(prev => prev.map(v => v.id !== id ? v : { ...v, notes: notesValue }));
        setEditingNotes(prev => { const n = { ...prev }; delete n[id]; return n; });
        notify('📝 Notes saved successfully!');
      } catch (err) {
        console.error('Failed to update visit notes in DB:', err);
        updateVisitLocally(id, { notes: notesValue });
        setEditingNotes(prev => { const n = { ...prev }; delete n[id]; return n; });
      }
    } else {
      updateVisitLocally(id, { notes: notesValue });
      setEditingNotes(prev => { const n = { ...prev }; delete n[id]; return n; });
      notify('📝 Notes saved locally!');
    }
  };

  const handleDeleteVisit = async (id) => {
    if (isDbMode) {
      try {
        const { error } = await supabase
          .from('visit_itineraries')
          .delete()
          .eq('id', id);
        if (error) throw error;
        setVisits(prev => prev.filter(v => v.id !== id));
        notify('🗑️ Visit deleted successfully!');
      } catch (err) {
        console.error('Failed to delete from DB:', err);
        deleteVisitLocally(id);
      }
    } else {
      deleteVisitLocally(id);
      notify('🗑️ Visit deleted locally!');
    }
  };

  const updateVisitLocally = (id, fields) => {
    const updated = visits.map(v => v.id !== id ? v : { ...v, ...fields });
    setVisits(updated);
    localStorage.setItem('visit_itineraries', JSON.stringify(updated));
  };

  const deleteVisitLocally = (id) => {
    const updated = visits.filter(v => v.id !== id);
    setVisits(updated);
    localStorage.setItem('visit_itineraries', JSON.stringify(updated));
  };

  // Google Maps Directions link handler
  const handleGetDirections = (lat, lng) => {
    if (!lat || !lng) {
      notify('Student company has no GPS coordinates set.', 'warning');
      return;
    }
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  // Calculation metrics
  const totalVisits = visits.length;
  const completedVisits = visits.filter(v => v.status === 'COMPLETED').length;
  const scheduledVisits = totalVisits - completedVisits;

  // Filtered visits calculation
  const filteredVisits = visits.filter(v => {
    const matchesSearch = v.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.students && v.students.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.company.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Inter', sans-serif" },
    metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
    metricCard: { ...commonStyles.dashboardCard, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' },
    metricIcon: (color) => ({
      width: '48px', height: '48px', borderRadius: '12px',
      backgroundColor: `${color}12`, color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }),
    splitLayout: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' },
    fullLayout: { display: 'flex', flexDirection: 'column', gap: '24px' },
    wizardSection: {
      ...commonStyles.dashboardCard, padding: '24px', 
      border: '1.5px solid #dbeafe', background: 'linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)',
    },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '12px' },
    th: { textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: theme.colors.textMuted, borderBottom: `1.5px solid ${theme.colors.border}`, fontWeight: 700 },
    td: { padding: '16px', fontSize: '13.5px', color: theme.colors.textMain, borderBottom: `1px solid ${theme.colors.border}` },
    gpsBadge: {
      display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', 
      borderRadius: '8px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer',
      backgroundColor: '#EFF6FF', color: '#1E40AF', transition: 'all 0.2s'
    },
    gpsBadgeEmpty: {
      display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', 
      borderRadius: '8px', fontSize: '11px', fontWeight: 600, backgroundColor: '#F1F5F9', color: '#64748B'
    },
    warningAlert: {
      display: 'flex', gap: '12px', padding: '14px 18px', borderRadius: '12px',
      backgroundColor: '#FEF3C7', borderLeft: '4px solid #D97706', color: '#92400E', fontSize: '13px'
    },
    successAlert: {
      display: 'flex', gap: '12px', padding: '14px 18px', borderRadius: '12px',
      backgroundColor: '#ECFDF5', borderLeft: '4px solid #10B981', color: '#065F46', fontSize: '13px'
    }
  };

  return (
    <div style={styles.container}>
      {localToast && <Toast message={localToast.message} type={localToast.type} onClose={() => setLocalToast(null)} />}

      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: theme.colors.textMain }}>Visit Itinerary Plan</h1>
          <p style={{ margin: '4px 0 0', color: theme.colors.textMuted, fontSize: '0.875rem' }}>
            Smart travel organizer: group deployed students by HTE coordinates, auto-generate plans, and get real-time direction pins.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowWizard(p => !p)} 
            style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, border: '1.5px solid #1E40AF', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
          >
            <Sparkles size={16} /> Smart Travel Optimizer
          </button>
          <button 
            onClick={() => setShowForm(p => !p)} 
            style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Schedule Visit
          </button>
        </div>
      </div>

      {/* RLS/Database Mode indicator callout */}
      {!isDbMode ? (
        dbError === 'PERMISSION_DENIED' ? (
          <div style={{ ...styles.warningAlert, backgroundColor: '#FEF2F2', borderLeft: '4px solid #EF4444', color: '#991B1B' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#EF4444' }} />
            <div>
              <strong>Database Privilege Denied:</strong> The table <code>visit_itineraries</code> exists in Supabase, but your authenticated connection role has no privileges to read/write to it.
              <div style={{ marginTop: '8px', fontWeight: 650 }}>
                💡 Quick Fix: Paste and run the following command in your Supabase Dashboard SQL Editor to grant full table privileges:
              </div>
              <pre style={{ margin: '8px 0 0 0', padding: '10px', backgroundColor: '#FEE2E2', borderRadius: '8px', overflowX: 'auto', fontFamily: 'monospace', fontSize: '12px', color: '#991B1B' }}>
                GRANT ALL ON TABLE public.visit_itineraries TO postgres, anon, authenticated, service_role;
              </pre>
            </div>
          </div>
        ) : (
          <div style={styles.warningAlert}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Local Storage Sandbox Active:</strong> The table <code>visit_itineraries</code> does not exist in Supabase yet. 
              All scheduled plans will be saved locally. Run the SQL migration <code>13_visit_itineraries.sql</code> in the Supabase Dashboard SQL Editor to activate full cloud database functionality!
            </div>
          </div>
        )
      ) : (
        <div style={styles.successAlert}>
          <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Connected to Supabase Database:</strong> Successfully storing and synchronizing grouped visits in real-time on the cloud.
          </div>
        </div>
      )}

      {/* Metrics overview */}
      <div style={styles.metricsRow}>
        <div style={styles.metricCard}>
          <div style={styles.metricIcon('#1E40AF')}><Map size={22} /></div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: theme.colors.textMain }}>{scheduledVisits}</div>
            <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>Scheduled Visits</div>
          </div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricIcon('#10B981')}><CheckCircle size={22} /></div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: theme.colors.textMain }}>{completedVisits}</div>
            <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>Completed Visits</div>
          </div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricIcon('#6366F1')}><Building2 size={22} /></div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: theme.colors.textMain }}>{deployedStudents.length}</div>
            <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>Active Deployed Students</div>
          </div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricIcon('#F59E0B')}><MapPin size={22} /></div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: theme.colors.textMain }}>{Object.keys(locationClusters).length}</div>
            <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>Geographical Location Clusters</div>
          </div>
        </div>
      </div>

      {/* SMART TRAVEL WIZARD PANELS */}
      {showWizard && (
        <div style={styles.wizardSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} /> Grouped Location Travel Optimizer
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#4B5563' }}>
                Group your active students by placement coordinates, select visit dates, and generate schedules automatically!
              </p>
            </div>
            <button 
              onClick={() => setShowWizard(false)} 
              style={{ background: '#EFF6FF', border: 'none', color: '#1E40AF', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={15} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Geographical Cluster Location</th>
                  <th style={styles.th}>Students Placed</th>
                  <th style={styles.th}>Placements HTE Companies</th>
                  <th style={styles.th}>Select Visit Date</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(locationClusters).map(loc => {
                  const students = locationClusters[loc];
                  return (
                    <tr key={loc}>
                      <td style={{ ...styles.td, fontWeight: 700 }}>{loc}</td>
                      <td style={styles.td}>
                        <span style={{ padding: '3px 8px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#1E40AF', fontWeight: 700, fontSize: '12px' }}>
                          {students.length} Student{students.length > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {students.map(s => s.company).filter((value, index, self) => self.indexOf(value) === index).join(', ')}
                      </td>
                      <td style={styles.td}>
                        <input 
                          type="date" 
                          style={{ ...commonStyles.input, padding: '6px 12px', fontSize: '13px' }} 
                          value={wizardAssignments[loc] || ''}
                          onChange={e => setWizardAssignments(prev => ({ ...prev, [loc]: e.target.value }))}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button onClick={() => setShowWizard(false)} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}>Cancel</button>
            <button onClick={handleGenerateItinerary} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, fontWeight: 700 }}>
              Auto-Generate Plan
            </button>
          </div>
        </div>
      )}

      {/* MANUAL VISIT SCHEDULER FORM */}
      {showForm && (
        <div style={{ ...commonStyles.dashboardCard, padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontWeight: 800, color: theme.colors.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} style={{ color: theme.colors.primary }} /> Schedule Custom Company Visit
          </h3>
          <form onSubmit={handleAddVisit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '6px' }}>Date</label>
                <input type="date" required style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }} value={newVisit.date} onChange={e => setNewVisit(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div style={{ flex: 2, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '6px' }}>Location (City / Province / Landmark)</label>
                <input type="text" required placeholder="e.g. Bulacan / BGC, Taguig" style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }} value={newVisit.location} onChange={e => setNewVisit(p => ({ ...p, location: e.target.value }))} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '6px' }}>Pre-visit Notes / Objectives</label>
              <textarea placeholder="e.g. Check student attendance reports and inspect physical work environment..." style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box', minHeight: '70px', resize: 'vertical' }}
                value={newVisit.notes} onChange={e => setNewVisit(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}>Cancel</button>
              <button type="submit" style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}>Schedule Plan</button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER AND SEARCH BAR */}
      <div style={{ ...commonStyles.dashboardCard, padding: '16px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search scheduled locations, students, or HTEs..." 
            style={{ ...commonStyles.input, width: '100%', paddingLeft: '40px', boxSizing: 'border-box' }} 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          {['ALL', 'SCHEDULED', 'COMPLETED'].map(status => (
            <button 
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                ...commonStyles.dashboardBtn,
                padding: '8px 16px',
                fontSize: '12.5px',
                fontWeight: 700,
                backgroundColor: filterStatus === status ? '#1E40AF' : '#F8FAFC',
                color: filterStatus === status ? '#FFFFFF' : '#475569',
                border: filterStatus === status ? '1px solid transparent' : '1px solid #E2E8F0'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* SCHEDULED VISIT ITINERARY CARDS */}
      <div style={styles.fullLayout}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: theme.colors.textMuted }}>
            <Compass size={40} className="animate-spin" style={{ margin: '0 auto 12px', color: '#1E40AF' }} />
            <div>Loading travel itineraries...</div>
          </div>
        ) : filteredVisits.length === 0 ? (
          <div style={{ ...commonStyles.dashboardCard, padding: '48px', textAlign: 'center', color: theme.colors.textMuted }}>
            <Compass size={48} style={{ margin: '0 auto 16px', color: '#94A3B8' }} />
            <h3 style={{ margin: '0 0 8px 0', fontWeight: 800, color: theme.colors.textMain }}>No Visit Itineraries Found</h3>
            <p style={{ margin: 0, fontSize: '13.5px' }}>
              Search has returned empty results. Start by scheduling a visit or using the Travel Optimizer wizard!
            </p>
          </div>
        ) : (
          filteredVisits.map(visit => (
            <div 
              key={visit.id} 
              style={{ 
                ...commonStyles.dashboardCard, 
                padding: '24px', 
                border: visit.status === 'COMPLETED' ? '1.5px solid #bbf7d0' : `1.5px solid ${theme.colors.border}`, 
                backgroundColor: visit.status === 'COMPLETED' ? '#f0fdf4' : '#fff',
                transition: 'all 0.2s',
              }}
              className="hover:shadow-md"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <Calendar size={18} color="#1E40AF" />
                    <span style={{ fontWeight: 850, fontSize: '1.05rem', color: theme.colors.textMain }}>
                      {new Date(visit.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                      backgroundColor: visit.status === 'COMPLETED' ? '#dcfce7' : '#EFF6FF',
                      color: visit.status === 'COMPLETED' ? '#15803d' : '#1E40AF' 
                    }}>
                      {visit.status === 'COMPLETED' ? <CheckCircle size={11} /> : <Clock size={11} />}
                      {visit.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: theme.colors.textMuted, fontSize: '0.9rem' }}>
                    <MapPin size={15} /> {visit.location}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {visit.status !== 'COMPLETED' && (
                    <button 
                      onClick={() => handleComplete(visit.id)} 
                      style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, backgroundColor: '#16a34a', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', boxShadow: 'none' }}
                    >
                      <CheckCircle size={14} /> Mark Completed
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteVisit(visit.id)} 
                    style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, border: '1px solid #ef4444', color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>

              {/* Matched grouped students section */}
              {visit.students && visit.students.length > 0 ? (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: theme.colors.textMuted, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Students Placed at this Location Cluster
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {visit.students.map((student, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E40AF', fontWeight: 700, fontSize: '11px' }}>
                            {student.name.charAt(0)}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, color: theme.colors.textMain, fontSize: '13.5px' }}>{student.name}</span>
                            <span style={{ color: theme.colors.textMuted, fontSize: '11px' }}>@ {student.company}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: theme.colors.textMuted, fontSize: '11px', borderTop: '1px dashed #E2E8F0', paddingTop: '8px' }}>
                          <MapPin size={11} style={{ flexShrink: 0 }} /> 
                          <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{student.address}</span>
                          {student.lat && student.lng ? (
                            <button 
                              onClick={() => handleGetDirections(student.lat, student.lng)}
                              style={styles.gpsBadge}
                              title="Open GPS Location Map Directions"
                            >
                              <Navigation size={11} /> GPS Map
                            </button>
                          ) : (
                            <span style={styles.gpsBadgeEmpty} title="GPS Pin Location Not Set by Student">
                              No GPS
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '14px 18px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px', fontSize: '13px', color: theme.colors.textMuted, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={16} />
                  No specific database student placements matched this custom location query yet.
                </div>
              )}

              {/* Pre-visit Notes / Coordinator Observation logging */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: theme.colors.textMuted, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <FileText size={13} /> Adviser Notes & Observations
                </div>
                {editingNotes[visit.id] !== undefined ? (
                  <div>
                    <textarea 
                      value={editingNotes[visit.id]} 
                      onChange={e => setEditingNotes(p => ({ ...p, [visit.id]: e.target.value }))}
                      style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical', marginBottom: '8px', fontSize: '13.5px' }} 
                      placeholder="e.g. Visited company, checked training reports, supervisor commented highly on professional skills..."
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => setEditingNotes(p => { const n = { ...p }; delete n[visit.id]; return n; })} 
                        style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, fontSize: '12px', padding: '6px 14px' }}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleSaveNotes(visit.id)} 
                        style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Save size={12} /> Save Observations
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setEditingNotes(p => ({ ...p, [visit.id]: visit.notes || '' }))}
                    style={{ padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13.5px', color: visit.notes ? theme.colors.textMain : theme.colors.textMuted, cursor: 'pointer', minHeight: '42px', transition: 'all 0.2s' }}
                    className="hover:bg-slate-50"
                  >
                    {visit.notes || '📝 Click here to add pre-visit notes, training comments, or coordinator site visit observations...'}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
