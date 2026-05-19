import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListChecks,
  Pencil,
  Check,
  X,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Plus,
  Send,
  Trash2,
  Clock
} from 'lucide-react';
import { studentDesign } from '../../../styles/StudentDesign';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../services/supabaseClient';
import Toast from '../../../components/common/Toast';
import PageLoader from '../../../components/common/PageLoader';

const Activities = () => {
  const { user } = useAuth();
  const [groups, setGroups]       = useState([]);   // [{ log_date, activities: [] }]
  const [loading, setLoading]     = useState(true);
  const [hasShiftToday, setHasShiftToday] = useState(false);
  const [expandedDate, setExpandedDate] = useState(null);
  const [toast, setToast]         = useState(null);

  // New entry form
  const [newEntry, setNewEntry]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText]   = useState('');
  const [savingId, setSavingId]   = useState(null);

  // Delete state
  const [deletingId, setDeletingId] = useState(null);

  const internshipId = user?.internship_id;
  const isDeployed   = user?.is_deployed;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Check if there is any shift today (any status)
      const todayCheck = new Date().toLocaleDateString('en-CA');
      const { data: todayShifts } = await supabase
        .from('attendance_logs')
        .select('id')
        .eq('internship_id', internshipId)
        .eq('log_date', todayCheck)
        .limit(1);
      setHasShiftToday(!!(todayShifts && todayShifts.length > 0));

      // Fetch all daily activities, newest first
      const { data: acts, error: actsErr } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('internship_id', internshipId)
        .order('created_at', { ascending: true });

      if (actsErr) throw actsErr;

      // Group purely by log_date — one card per day
      const byDate = {};
      (acts || []).forEach(a => {
        if (!byDate[a.log_date]) byDate[a.log_date] = [];
        byDate[a.log_date].push(a);
      });

      const grouped = Object.entries(byDate)
        .map(([date, activities]) => ({ log_date: date, activities }))
        .sort((a, b) => b.log_date.localeCompare(a.log_date));

      setGroups(grouped);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setToast({ message: 'Failed to load activities.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [internshipId]);

  useEffect(() => {
    if (!internshipId) return;
    if (isDeployed) fetchData();
    else setLoading(false);
  }, [internshipId, isDeployed, fetchData]);

  const todayStr = new Date().toLocaleDateString('en-CA');

  // ── Add new activity entry ──────────────────────────────────────────
  const handleAdd = async () => {
    if (!newEntry.trim() || !internshipId) return;
    if (!hasShiftToday) {
      setToast({ message: 'No shift today — clock in first on the Attendance page.', type: 'warning' });
      return;
    }
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('daily_activities')
        .insert({
          internship_id: internshipId,
          log_date:      todayStr,
          description:   newEntry.trim()
        });

      if (error) throw error;
      setNewEntry('');
      setExpandedDate(todayStr);
      setToast({ message: '✅ Activity logged for today!', type: 'success' });
      await fetchData();
    } catch (err) {
      setToast({ message: 'Failed to log activity: ' + err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────
  const handleSave = async (id) => {
    try {
      setSavingId(id);
      const { error } = await supabase
        .from('daily_activities')
        .update({ description: editText.trim(), updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setEditingId(null);
      setToast({ message: '✅ Activity updated.', type: 'success' });
      await fetchData();
    } catch (err) {
      setToast({ message: 'Failed to save: ' + err.message, type: 'error' });
    } finally {
      setSavingId(null);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('daily_activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setToast({ message: 'Activity deleted.', type: 'success' });
      await fetchData();
    } catch (err) {
      setToast({ message: 'Failed to delete: ' + err.message, type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────
  const fmtDate = (d) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const fmtTime = (iso) =>
    iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';

  const fmtHours = (h) => {
    const hrs  = Math.floor(h || 0);
    const mins = Math.round(((h || 0) - hrs) * 60);
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  const fmtTimestamp = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // ── Guard states ─────────────────────────────────────────────────────
  if (!isDeployed) {
    return (
      <div style={{ ...studentDesign.card, textAlign: 'center', padding: '60px 20px', margin: '40px auto', maxWidth: '600px' }}>
        <AlertTriangle size={48} color={studentDesign.colors.warning} style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: studentDesign.colors.textMain }}>Activities Locked</h3>
        <p style={{ color: studentDesign.colors.textMuted, maxWidth: '440px', margin: '8px auto 0', fontSize: '14px', lineHeight: 1.5 }}>
          You must be approved for deployment (Stage 2) to view and log your daily activities.
        </p>
      </div>
    );
  }

  if (loading) return <PageLoader message="Loading your daily activities..." />;

  const totalEntries = groups.reduce((s, g) => s + g.activities.length, 0);
  const totalDays    = groups.filter(g => g.activities.length > 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: studentDesign.colors.textMain, letterSpacing: '-0.5px' }}>
            Daily Activities
          </h1>
          <p style={{ margin: '4px 0 0', color: studentDesign.colors.textMuted, fontSize: '14px' }}>
            Log and manage your tasks and accomplishments for each shift.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ ...studentDesign.card, padding: '10px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px' }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: studentDesign.colors.primary }}>{totalEntries}</span>
            <span style={{ fontSize: '12px', color: studentDesign.colors.textMuted }}>Total entries</span>
          </div>
          <div style={{ ...studentDesign.card, padding: '10px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px' }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: studentDesign.colors.success }}>{totalDays}</span>
            <span style={{ fontSize: '12px', color: studentDesign.colors.textMuted }}>Days tracked</span>
          </div>
        </div>
      </div>

      {/* ── Log Entry Form ── */}
      <div style={{
        ...studentDesign.card,
        padding: '24px',
        background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)',
        border: `1.5px solid ${hasShiftToday ? studentDesign.colors.primary + '30' : '#E2E8F0'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
            backgroundColor: hasShiftToday ? `${studentDesign.colors.primary}15` : '#F1F5F9',
            color: hasShiftToday ? studentDesign.colors.primary : studentDesign.colors.textMuted,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Plus size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: studentDesign.colors.textMain }}>
              Log Today's Activity
            </div>
            <div style={{ fontSize: '12px', color: studentDesign.colors.textMuted }}>
              {hasShiftToday
                ? `Adding entry to ${fmtDate(todayStr)}`
                : 'No active shift today — clock in first on the Attendance page'}
            </div>
          </div>
        </div>

        <textarea
          disabled={!hasShiftToday}
          placeholder={hasShiftToday
            ? 'Describe a task, accomplishment, or skill you worked on today...'
            : 'Clock in on the Attendance page first.'}
          value={newEntry}
          onChange={e => setNewEntry(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAdd(); }}
          rows={3}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: '10px',
            border: `1.5px solid ${hasShiftToday ? studentDesign.colors.primary + '40' : '#E2E8F0'}`,
            fontSize: '14px', lineHeight: 1.6, resize: 'vertical', outline: 'none',
            boxSizing: 'border-box', backgroundColor: hasShiftToday ? '#fff' : '#F8FAFC',
            color: studentDesign.colors.textMain, fontFamily: 'inherit',
            cursor: hasShiftToday ? 'text' : 'not-allowed', opacity: hasShiftToday ? 1 : 0.6
          }}
        />
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: studentDesign.colors.textMuted }}>
            Tip: Press <kbd style={{ padding: '1px 5px', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '11px' }}>Ctrl + Enter</kbd> to submit quickly.
          </span>
          <button
            disabled={!hasShiftToday || !newEntry.trim() || submitting}
            onClick={handleAdd}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '9px 20px', borderRadius: '10px', border: 'none',
              backgroundColor: hasShiftToday && newEntry.trim() ? studentDesign.colors.primary : '#E2E8F0',
              color: hasShiftToday && newEntry.trim() ? '#fff' : studentDesign.colors.textMuted,
              fontWeight: 700, fontSize: '13px',
              cursor: hasShiftToday && newEntry.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            {submitting ? <Loader2 size={14} /> : <Send size={14} />}
            Save Entry
          </button>
        </div>
      </div>

      {/* ── Activity Groups ── */}
      {groups.length === 0 ? (
        <div style={{ ...studentDesign.card, textAlign: 'center', padding: '60px 20px' }}>
          <ListChecks size={48} style={{ margin: '0 auto 16px', opacity: 0.12, color: studentDesign.colors.textMuted }} />
          <p style={{ fontWeight: 600, color: studentDesign.colors.textMuted }}>No activity entries yet.</p>
          <p style={{ fontSize: '13px', color: studentDesign.colors.textMuted, marginTop: '4px' }}>
            Clock in on the Attendance page, then log your first activity above.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {groups.map(group => {
            const isToday    = group.log_date === todayStr;
            const isOpen     = expandedDate === group.log_date;
            const entryCount = group.activities.length;

            return (
              <motion.div
                key={group.log_date}
                layout
                style={{
                  ...studentDesign.card,
                  padding: 0, overflow: 'hidden',
                  border: isToday
                    ? `1.5px solid ${studentDesign.colors.primary}40`
                    : `1px solid ${studentDesign.colors.border}`,
                }}
              >
                {/* ── Group header ── */}
                <div
                  onClick={() => setExpandedDate(isOpen ? null : group.log_date)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '16px 20px', cursor: 'pointer',
                    backgroundColor: isToday ? '#F0F9FF' : '#fff',
                    transition: 'background-color 0.15s'
                  }}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                    backgroundColor: `${studentDesign.colors.primary}12`,
                    color: studentDesign.colors.primary,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Calendar size={20} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: studentDesign.colors.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {fmtDate(group.log_date)}
                      {isToday && (
                        <span style={{
                          fontSize: '11px', fontWeight: 700, padding: '2px 8px',
                          borderRadius: '8px', backgroundColor: `${studentDesign.colors.primary}15`,
                          color: studentDesign.colors.primary
                        }}>Today</span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: studentDesign.colors.textMuted, marginTop: '2px' }}>
                      {entryCount === 0
                        ? 'No entries yet'
                        : `${entryCount} ${entryCount === 1 ? 'activity' : 'activities'} logged`}
                    </div>
                  </div>

                  {/* Entry count badge */}
                  <span style={{
                    fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '10px',
                    backgroundColor: entryCount > 0 ? `${studentDesign.colors.primary}12` : '#F1F5F9',
                    color: entryCount > 0 ? studentDesign.colors.primary : studentDesign.colors.textMuted,
                    border: `1px solid ${entryCount > 0 ? studentDesign.colors.primary + '30' : '#E2E8F0'}`,
                    flexShrink: 0
                  }}>
                    {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
                  </span>

                  <div style={{ color: studentDesign.colors.textMuted, flexShrink: 0 }}>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* ── Activity entries ── */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ borderTop: `1px solid ${studentDesign.colors.border}`, padding: '12px 20px 16px' }}>
                        {group.activities.length === 0 ? (
                          <p style={{ fontSize: '13px', color: studentDesign.colors.textMuted, fontStyle: 'italic', margin: '8px 0' }}>
                            No activity entries for this shift yet. Use the form above to add one.
                          </p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '4px' }}>
                            {group.activities.map((act, idx) => {
                              const isEditing = editingId === act.id;
                              const isSaving  = savingId  === act.id;
                              const isDeleting = deletingId === act.id;

                              return (
                                <div key={act.id} style={{
                                  padding: '12px 14px',
                                  borderRadius: '10px',
                                  backgroundColor: isEditing ? '#EFF6FF' : '#F8FAFC',
                                  border: `1px solid ${isEditing ? studentDesign.colors.primary + '50' : studentDesign.colors.border}`,
                                  transition: 'all 0.15s'
                                }}>
                                  {isEditing ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      <textarea
                                        autoFocus
                                        value={editText}
                                        onChange={e => setEditText(e.target.value)}
                                        rows={3}
                                        style={{
                                          width: '100%', padding: '10px 12px', borderRadius: '8px', resize: 'vertical',
                                          border: `1.5px solid ${studentDesign.colors.primary}`,
                                          fontSize: '14px', lineHeight: 1.6, outline: 'none',
                                          boxSizing: 'border-box', fontFamily: 'inherit',
                                          backgroundColor: '#fff', color: studentDesign.colors.textMain
                                        }}
                                      />
                                      <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                          disabled={isSaving}
                                          onClick={() => handleSave(act.id)}
                                          style={{
                                            display: 'flex', alignItems: 'center', gap: '5px',
                                            padding: '7px 16px', borderRadius: '7px', border: 'none',
                                            backgroundColor: studentDesign.colors.primary, color: '#fff',
                                            fontWeight: 700, fontSize: '12px', cursor: 'pointer'
                                          }}
                                        >
                                          {isSaving ? <Loader2 size={13} /> : <Check size={13} />} Save
                                        </button>
                                        <button
                                          onClick={() => setEditingId(null)}
                                          style={{
                                            display: 'flex', alignItems: 'center', gap: '5px',
                                            padding: '7px 14px', borderRadius: '7px',
                                            border: `1px solid ${studentDesign.colors.border}`,
                                            backgroundColor: '#fff', color: studentDesign.colors.textMuted,
                                            fontWeight: 600, fontSize: '12px', cursor: 'pointer'
                                          }}
                                        >
                                          <X size={13} /> Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                      {/* Entry number */}
                                      <span style={{
                                        fontSize: '11px', fontWeight: 800, color: '#fff',
                                        backgroundColor: studentDesign.colors.primary,
                                        borderRadius: '6px', padding: '2px 7px',
                                        flexShrink: 0, marginTop: '2px'
                                      }}>{idx + 1}</span>

                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.65, color: studentDesign.colors.textMain, whiteSpace: 'pre-wrap' }}>
                                          {act.description}
                                        </p>
                                        <div style={{ marginTop: '6px', fontSize: '11px', color: studentDesign.colors.textMuted }}>
                                          Logged at {fmtTimestamp(act.created_at)}
                                          {act.updated_at !== act.created_at && ' · edited'}
                                        </div>
                                      </div>

                                      {/* Actions */}
                                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                        <button
                                          onClick={() => { setEditingId(act.id); setEditText(act.description); }}
                                          title="Edit"
                                          style={{
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            padding: '5px 10px', borderRadius: '7px',
                                            border: `1px solid ${studentDesign.colors.border}`,
                                            backgroundColor: '#fff', color: studentDesign.colors.textMuted,
                                            fontWeight: 600, fontSize: '12px', cursor: 'pointer',
                                            transition: 'all 0.15s'
                                          }}
                                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EFF6FF'; e.currentTarget.style.color = studentDesign.colors.primary; e.currentTarget.style.borderColor = studentDesign.colors.primary; }}
                                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = studentDesign.colors.textMuted; e.currentTarget.style.borderColor = studentDesign.colors.border; }}
                                        >
                                          <Pencil size={12} /> Edit
                                        </button>
                                        <button
                                          disabled={isDeleting}
                                          onClick={() => handleDelete(act.id)}
                                          title="Delete"
                                          style={{
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            padding: '5px 10px', borderRadius: '7px',
                                            border: '1px solid #FCA5A5',
                                            backgroundColor: '#fff', color: '#EF4444',
                                            fontWeight: 600, fontSize: '12px', cursor: 'pointer',
                                            transition: 'all 0.15s'
                                          }}
                                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEF2F2'; }}
                                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; }}
                                        >
                                          {isDeleting ? <Loader2 size={12} /> : <Trash2 size={12} />} Delete
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
};

export default Activities;
