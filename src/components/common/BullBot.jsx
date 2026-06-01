import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Send, X, Plus, MessageSquare, Trash2, Clock, ExternalLink } from 'lucide-react';
import { claudeService } from '../../services/claudeService';
import { useAuth } from '../../context/AuthContext';

/* ─── helpers ─────────────────────────────────────────────── */

const GREETING = "Hi! I'm BullBot, your InternLink assistant. I can help you with documents, attendance, weekly reports, adviser workflows, and more. How can I help you?";

const stripMarkdown = text =>
  text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/gs, '$1')
    .replace(/\*(.+?)\*/gs, '$1')
    .replace(/__(.+?)__/gs, '$1')
    .replace(/_(.+?)_/gs, '$1')
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, m => m.replace(/`/g, ''))
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^-{2,}$/gm, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .trim();

const makeId = () => Math.random().toString(36).slice(2, 10);

const makeSession = () => ({
  id: makeId(),
  title: 'New Chat',
  messages: [{ role: 'assistant', content: GREETING }],
  updatedAt: Date.now(),
});

const storageKey = uid => `bullbot_v2_${uid}`;

const load = uid => {
  try { return JSON.parse(localStorage.getItem(storageKey(uid))); } catch { return null; }
};

const save = (uid, data) => {
  try { localStorage.setItem(storageKey(uid), JSON.stringify(data)); } catch {}
};

const formatTime = ts => {
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000 && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diff < 604800000) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/* ─── component ───────────────────────────────────────────── */

const BullBot = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userContext = {
    userId: user?.id,
    userRole: user?.role,
    userName: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'User',
  };
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('chat'); // 'chat' | 'history'
  const [sessions, setSessions] = useState([makeSession()]);
  const [activeId, setActiveId] = useState(sessions[0].id);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const initialized = useRef(false);

  // Load from localStorage once user is available
  useEffect(() => {
    if (!user?.id || initialized.current) return;
    initialized.current = true;
    const stored = load(user.id);
    if (stored?.sessions?.length) {
      setSessions(stored.sessions);
      setActiveId(stored.activeId || stored.sessions[0].id);
    }
  }, [user?.id]);

  // Persist on every sessions/activeId change
  useEffect(() => {
    if (!user?.id || !initialized.current) return;
    save(user.id, { sessions, activeId });
  }, [sessions, activeId, user?.id]);

  // Scroll to bottom when messages change or panel opens
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    return () => clearTimeout(t);
  }, [isOpen, sessions, activeId]);

  useEffect(() => {
    if (isOpen && view === 'chat') inputRef.current?.focus();
  }, [isOpen, view]);

  const activeSession = sessions.find(s => s.id === activeId) || sessions[0];
  const messages = activeSession?.messages || [];

  const updateMessages = useCallback((id, updater) => {
    setSessions(prev => prev.map(s =>
      s.id === id
        ? { ...s, messages: updater(s.messages), updatedAt: Date.now() }
        : s
    ));
  }, []);

  const setTitle = useCallback((id, firstUserMsg) => {
    const title = firstUserMsg.length > 40
      ? firstUserMsg.slice(0, 40) + '…'
      : firstUserMsg;
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title } : s));
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const sesId = activeId;
    const userMsg = { role: 'user', content: text };

    // Set title from first user message
    const isFirstUserMsg = messages.filter(m => m.role === 'user').length === 0;
    if (isFirstUserMsg) setTitle(sesId, text);

    updateMessages(sesId, prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMsg].map(({ role, content }) => ({ role, content }));
      const { content, links = [] } = await claudeService.chat(apiMessages, userContext);
      updateMessages(sesId, prev => [
        ...prev,
        { role: 'assistant', content: stripMarkdown(content), links },
      ]);
    } catch {
      updateMessages(sesId, prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const newChat = () => {
    const s = makeSession();
    setSessions(prev => [s, ...prev]);
    setActiveId(s.id);
    setView('chat');
  };

  const openSession = id => {
    setActiveId(id);
    setView('chat');
  };

  const confirmDelete = id => setDeleteTarget(id);

  const deleteSession = () => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== deleteTarget);
      if (next.length === 0) {
        const s = makeSession();
        setActiveId(s.id);
        setDeleteTarget(null);
        return [s];
      }
      if (activeId === deleteTarget) setActiveId(next[0].id);
      setDeleteTarget(null);
      return next;
    });
  };

  /* ─── render ─────────────────────────────────────────────── */

  return (
    <div style={s.wrapper}>
      {isOpen && (
        <div style={s.panel}>

          {/* ── HISTORY VIEW ── */}
          {view === 'history' && (
            <>
              <div style={s.header}>
                <div style={s.headerLeft}>
                  <Clock size={18} color="#fff" />
                  <span style={s.headerTitle}>Chat History</span>
                </div>
                <div style={s.headerActions}>
                  <button style={s.iconBtn} onClick={newChat} title="New chat">
                    <Plus size={18} />
                  </button>
                  <button style={s.iconBtn} onClick={() => setView('chat')} title="Back to chat">
                    <ChevronDown size={20} />
                  </button>
                </div>
              </div>

              <div style={s.historyList}>
                {sessions.length === 0 && (
                  <div style={s.emptyHistory}>No conversations yet.</div>
                )}
                {sessions.map(ses => (
                  <div
                    key={ses.id}
                    style={{
                      ...s.historyItem,
                      ...(ses.id === activeId ? s.historyItemActive : {}),
                    }}
                    onClick={() => openSession(ses.id)}
                  >
                    <MessageSquare size={14} style={{ flexShrink: 0, marginTop: 2, color: ses.id === activeId ? '#1E40AF' : '#94A3B8' }} />
                    <div style={s.historyMeta}>
                      <span style={s.historyTitle}>{ses.title}</span>
                      <span style={s.historyTime}>{formatTime(ses.updatedAt)}</span>
                    </div>
                    <button
                      style={s.deleteBtn}
                      onClick={e => { e.stopPropagation(); confirmDelete(ses.id); }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Delete confirm */}
              {deleteTarget && (
                <div style={s.confirmBar}>
                  <span style={s.confirmText}>Delete this conversation?</span>
                  <button style={s.confirmYes} onClick={deleteSession}>Delete</button>
                  <button style={s.confirmNo} onClick={() => setDeleteTarget(null)}>Cancel</button>
                </div>
              )}
            </>
          )}

          {/* ── CHAT VIEW ── */}
          {view === 'chat' && (
            <>
              <div style={s.header}>
                <div style={s.headerLeft}>
                  <img src="/internlink-ai.png" alt="BullBot" style={s.avatarImg} />
                  <div>
                    <div style={s.headerTitle}>BullBot</div>
                    <div style={s.headerSubtitle}>InternLink Assistant</div>
                  </div>
                </div>
                <div style={s.headerActions}>
                  <button style={s.iconBtn} onClick={newChat} title="New chat">
                    <Plus size={18} />
                  </button>
                  <button style={s.iconBtn} onClick={() => setView('history')} title="Chat history">
                    <Clock size={17} />
                  </button>
                  <button style={s.iconBtn} onClick={() => setIsOpen(false)} title="Minimize">
                    <ChevronDown size={20} />
                  </button>
                </div>
              </div>

              <div style={s.messages}>
                {messages.map((msg, i) => (
                  <div key={i} style={s.msgGroup}>
                    <div style={msg.role === 'user' ? s.bubbleUser : s.bubbleBot}>
                      {msg.content}
                    </div>
                    {msg.role === 'assistant' && msg.links?.length > 0 && (
                      <div style={s.linkRow}>
                        {msg.links.map((lnk, j) => (
                          <button
                            key={j}
                            style={s.linkBtn}
                            onClick={() => { navigate(lnk.path); setIsOpen(false); }}
                          >
                            <ExternalLink size={11} style={{ marginRight: 4, flexShrink: 0 }} />
                            {lnk.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div style={s.bubbleBot}>
                    <span style={s.dot} /><span style={s.dot} /><span style={s.dot} />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={s.inputArea}>
                <textarea
                  ref={inputRef}
                  style={s.textarea}
                  placeholder="Ask about InternLink..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  style={{ ...s.sendBtn, opacity: (!input.trim() || isLoading) ? 0.5 : 1 }}
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  title="Send"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}

        </div>
      )}

      {/* FAB */}
      <button
        style={s.fab}
        onClick={() => setIsOpen(o => !o)}
        title={isOpen ? 'Close BullBot' : 'Open BullBot'}
      >
        {isOpen
          ? <X size={24} color="#fff" />
          : <img src="/internlink-ai.png" alt="BullBot" style={s.fabIcon} />}
      </button>
    </div>
  );
};

/* ─── styles ─────────────────────────────────────────────── */

const s = {
  wrapper: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '12px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  panel: {
    width: '370px',
    height: '540px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 20px 48px rgba(0,0,0,0.18)',
    border: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#FFFFFF',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  avatarImg: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  fabIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: '15px',
  },
  headerSubtitle: {
    fontSize: '11px',
    opacity: 0.85,
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#FFFFFF',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
  },

  /* History view */
  historyList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  emptyHistory: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: '14px',
    marginTop: '40px',
  },
  historyItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    backgroundColor: 'transparent',
  },
  historyItemActive: {
    backgroundColor: '#EFF6FF',
  },
  historyMeta: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  historyTitle: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#0F172A',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  historyTime: {
    fontSize: '11px',
    color: '#94A3B8',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#CBD5E1',
    padding: '2px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    opacity: 0.6,
  },

  /* Confirm bar */
  confirmBar: {
    backgroundColor: '#FEF2F2',
    borderTop: '1px solid #FECACA',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  confirmText: {
    flex: 1,
    fontSize: '13px',
    color: '#991B1B',
  },
  confirmYes: {
    padding: '5px 14px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#EF4444',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  confirmNo: {
    padding: '5px 14px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#fff',
    color: '#475569',
    fontSize: '12px',
    cursor: 'pointer',
  },

  /* Chat view */
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  msgGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#1E40AF',
    color: '#FFFFFF',
    borderRadius: '16px 16px 4px 16px',
    padding: '10px 14px',
    maxWidth: '78%',
    fontSize: '14px',
    lineHeight: '1.6',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  },
  bubbleBot: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    color: '#0F172A',
    borderRadius: '16px 16px 16px 4px',
    padding: '10px 14px',
    maxWidth: '78%',
    fontSize: '14px',
    lineHeight: '1.6',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  },
  linkRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    paddingLeft: '2px',
  },
  linkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '20px',
    border: '1px solid #BFDBFE',
    backgroundColor: '#EFF6FF',
    color: '#1E40AF',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 0.15s',
  },
  dot: {
    display: 'inline-block',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#94A3B8',
    margin: '0 2px',
  },
  inputArea: {
    padding: '12px 14px',
    borderTop: '1px solid #E2E8F0',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  textarea: {
    flex: 1,
    border: '1px solid #CBD5E1',
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '14px',
    outline: 'none',
    resize: 'none',
    maxHeight: '100px',
    fontFamily: 'inherit',
    color: '#0F172A',
    lineHeight: '1.5',
    backgroundColor: '#F8FAFC',
  },
  sendBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    flexShrink: 0,
    transition: 'opacity 0.15s ease',
  },
  fab: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(30, 64, 175, 0.45)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
};

export default BullBot;
