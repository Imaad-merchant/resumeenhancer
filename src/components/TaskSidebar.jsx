import { useState } from "react";
import TaskItem from "./TaskItem";
import { CATEGORIES } from "../utils/defaultTasks";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function TaskSidebar({ date, tasks, onToggle, onAddTask, onRemoveTask }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState(Object.values(CATEGORIES)[0].name);

  if (!date) {
    return (
      <div className="task-sidebar">
        <div className="task-sidebar-empty">
          <p>Select a day to see tasks</p>
        </div>
      </div>
    );
  }

  const [y, m, d] = date.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayName = DAY_NAMES[dateObj.getDay()];
  const monthName = MONTH_NAMES[m - 1];

  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  // Group by category
  const grouped = {};
  for (const t of tasks) {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  }

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const cat = Object.values(CATEGORIES).find((c) => c.name === newCategory);
    onAddTask(date, newTitle.trim(), newCategory, cat?.color || "#888");
    setNewTitle("");
    setShowAdd(false);
  };

  return (
    <div className="task-sidebar">
      <div className="task-sidebar-header">
        <h3>{dayName}, {monthName} {d}</h3>
        {total > 0 && (
          <div className="task-progress">
            <span className="task-progress-text">{completed}/{total} done</span>
            <div className="task-progress-bar">
              <div className="task-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="task-list">
        {total === 0 ? (
          <div className="task-sidebar-empty">
            <p>No tasks for this day</p>
            <p className="muted">Click + to add one</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, categoryTasks]) => (
            <div key={category} className="task-group">
              <div className="task-group-header">
                <span className="task-group-dot" style={{ background: categoryTasks[0]?.color }} />
                <span className="task-group-name">{category}</span>
                <span className="task-group-count">{categoryTasks.filter((t) => t.completed).length}/{categoryTasks.length}</span>
              </div>
              {categoryTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onRemove={onRemoveTask}
                />
              ))}
            </div>
          ))
        )}
      </div>

      <div className="task-add-section">
        {showAdd ? (
          <div className="task-add-form">
            <input
              className="raw-input"
              placeholder="Task description..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
            />
            <select
              className="section-select"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            >
              {Object.values(CATEGORIES).map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <div className="task-add-actions">
              <button className="btn btn-save" onClick={handleAdd}>Add</button>
              <button className="btn btn-discard" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="btn task-add-btn" onClick={() => setShowAdd(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Task
          </button>
        )}
      </div>
    </div>
  );
}
