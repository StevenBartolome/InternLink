// src/pages/supervisor/TaskManagementPage/TaskManagementPage.jsx
import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Search, Filter } from 'lucide-react';
import { internsData } from '../../../data/supervisorMockData';
import StatusBadge from '../../../components/supervisor/StatusBadge';
import '../../../assets/css/supervisor/TaskManagementPage.css';

const TaskManagementPage = () => {
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

  return (
    <div className="supervisor-page-container">
      {/* Top Selector Container */}
      <div className="card-supervisor selector-card">
        <div className="selector-group">
          <label htmlFor="intern-select-task">Assigned Intern:</label>
          <select 
            id="intern-select-task" 
            value={selectedInternId} 
            onChange={handleInternChange}
            className="styled-select"
          >
            {internsData.map(intern => (
              <option key={intern.id} value={intern.id}>{intern.name} ({intern.school})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="task-mgnt-grid">
        {/* Left Form: Add Task */}
        <div className="task-mgnt-left">
          <div className="card-supervisor add-task-card">
            <h3 className="section-title"><Plus size={18} /> Assign New Task</h3>
            <form onSubmit={handlesAddTask} className="add-task-form">
              <div className="form-group">
                <label>Task Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Database Schema Design"
                  value={newTask.name} 
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  placeholder="Include details that need action..."
                  value={newTask.description} 
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input 
                  type="date" 
                  value={newTask.dueDate} 
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  required 
                />
              </div>
              <button type="submit" className="action-btn-styled">Assign Task</button>
            </form>
          </div>
        </div>

        {/* Right: Task List */}
        <div className="task-mgnt-right">
          <div className="card-supervisor task-list-card">
            <div className="task-header-controls">
              <div className="tabs-bar">
                {tabs.map(tab => (
                  <button 
                    key={tab} 
                    className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="task-list-container">
              {filteredTasks.length === 0 ? (
                <div className="empty-state">
                  <CheckCircle2 size={48} color="var(--text-secondary)" opacity={0.5} />
                  <p>No tasks found for this filter.</p>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div key={task.id} className="task-item-large">
                    <div className="task-item-main">
                      <div className="task-title-row">
                        <h4>{task.name}</h4>
                        <span className="due-badge">Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <p className="task-desc-text">{task.description}</p>
                    </div>

                    <div className="task-item-actions">
                      <select 
                        value={task.status} 
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="status-dropdown"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>

                      <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>
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
