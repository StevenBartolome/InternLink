// src/pages/supervisor/TaskManagementPage.jsx
import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Search, Filter, Calendar, ClipboardList } from 'lucide-react';
import { internsData } from '../../services/mocks/supervisorMockData';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const TaskManagementPage = () => {
  const isMobile = useMediaQuery('(max-width: 992px)');
  const [selectedInternId, setSelectedInternId] = useState(internsData[0].id);
  const [activeTab, setActiveTab] = useState('All');
  const [tasks, setTasks] = useState(internsData.find(i => i.id === internsData[0].id).tasks);
  const [newTask, setNewTask] = useState({ name: '', description: '', dueDate: '' });

  const selectedIntern = internsData.find(i => i.id === parseInt(selectedInternId));

  const handleInternChange = (e) => {
    const id = e.target.value;
    setSelectedInternId(id);
    const intern = internsData.find(i => i.id === parseInt(id));
    setTasks(intern ? intern.tasks : []);
  };

  const handlesAddTask = (e) => {
    e.preventDefault();
    if (!newTask.name || !newTask.dueDate) return;

    const id = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    const taskToAdd = {
      id,
      name: newTask.name,
      description: newTask.description,
      dueDate: newTask.dueDate,
      status: 'Not Started'
    };

    setTasks([...tasks, taskToAdd]);
    setNewTask({ name: '', description: '', dueDate: '' });
    alert('Task assigned successfully!');
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'All') return true;
    return task.status === activeTab;
  });

  const tabs = ['All', 'Not Started', 'In Progress', 'Done'];

  const styles = {
    container: {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
      padding: '24px',
    },
    selectorRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    label: {
      fontSize: '14px',
      fontWeight: 700,
      color: theme.colors.textMain,
    },
    select: {
      padding: '10px 16px',
      borderRadius: '12px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '14px',
      fontWeight: 600,
      color: theme.colors.textMain,
      backgroundColor: theme.colors.bgSecondary,
      cursor: 'pointer',
      flex: 1,
      maxWidth: '400px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1.5fr',
      gap: '24px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: '0 0 20px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    input: {
      padding: '12px 16px',
      borderRadius: '12px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '14px',
      backgroundColor: theme.colors.bgSecondary,
    },
    textarea: {
      padding: '12px 16px',
      borderRadius: '12px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '14px',
      backgroundColor: theme.colors.bgSecondary,
      resize: 'vertical',
    },
    submitBtn: {
      ...commonStyles.buttonPrimary,
      padding: '14px',
      borderRadius: '14px',
      fontSize: '14px',
      fontWeight: 700,
      marginTop: '8px',
    },
    tabsBar: {
      display: 'flex',
      gap: '8px',
      marginBottom: '20px',
      overflowX: 'auto',
      paddingBottom: '4px',
    },
    tabItem: (isActive) => ({
      padding: '8px 16px',
      borderRadius: '10px',
      fontSize: '13px',
      fontWeight: 700,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      backgroundColor: isActive ? theme.colors.primary : 'transparent',
      color: isActive ? theme.colors.white : theme.colors.textMuted,
      border: `1px solid ${isActive ? theme.colors.primary : theme.colors.border}`,
      transition: 'all 0.2s',
    }),
    taskList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    taskItem: {
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: '20px',
      padding: '20px',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      gap: '16px',
      border: `1px solid ${theme.colors.border}`,
    },
    taskContent: {
      flex: 1,
    },
    taskTitleRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '8px',
    },
    taskTitle: {
      fontSize: '16px',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: 0,
    },
    dueBadge: {
      fontSize: '12px',
      fontWeight: 700,
      color: theme.colors.primary,
      backgroundColor: '#eff6ff',
      padding: '4px 10px',
      borderRadius: '8px',
    },
    taskDesc: {
      fontSize: '14px',
      color: theme.colors.textMuted,
      margin: 0,
      lineHeight: 1.5,
    },
    taskActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    statusSelect: {
      padding: '8px 12px',
      borderRadius: '10px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '13px',
      fontWeight: 600,
      backgroundColor: theme.colors.white,
      cursor: 'pointer',
    },
    deleteBtn: {
      padding: '8px',
      borderRadius: '10px',
      border: 'none',
      backgroundColor: '#fee2e2',
      color: theme.colors.danger,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px 24px',
      color: theme.colors.textMuted,
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Selector Card */}
      <div style={styles.card}>
        <div style={styles.selectorRow}>
          <label style={styles.label}>Assigned Intern:</label>
          <select 
            value={selectedInternId} 
            onChange={handleInternChange}
            style={styles.select}
          >
            {internsData.map(intern => (
              <option key={intern.id} value={intern.id}>{intern.name} ({intern.school})</option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Left: Add Task */}
        <div>
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}><Plus size={20} /> Assign New Task</h3>
            <form onSubmit={handlesAddTask} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Task Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Database Schema Design"
                  value={newTask.name} 
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  style={styles.input}
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea 
                  placeholder="Include details that need action..."
                  value={newTask.description} 
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows="3"
                  style={styles.textarea}
                ></textarea>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Due Date</label>
                <input 
                  type="date" 
                  value={newTask.dueDate} 
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  style={styles.input}
                  required 
                />
              </div>
              <button type="submit" style={styles.submitBtn}>Assign Task</button>
            </form>
          </div>
        </div>

        {/* Right: Task List */}
        <div>
          <div style={styles.card}>
            <div style={styles.tabsBar}>
              {tabs.map(tab => (
                <button 
                  key={tab} 
                  style={styles.tabItem(activeTab === tab)}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={styles.taskList}>
              {filteredTasks.length === 0 ? (
                <div style={styles.emptyState}>
                  <ClipboardList size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                  <p>No tasks found for this status.</p>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div key={task.id} style={styles.taskItem}>
                    <div style={styles.taskContent}>
                      <div style={styles.taskTitleRow}>
                        <h4 style={styles.taskTitle}>{task.name}</h4>
                        <span style={styles.dueBadge}>Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <p style={styles.taskDesc}>{task.description}</p>
                    </div>

                    <div style={styles.taskActions}>
                      <select 
                        value={task.status} 
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        style={styles.statusSelect}
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>

                      <button 
                        style={styles.deleteBtn}
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManagementPage;
