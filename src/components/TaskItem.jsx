export default function TaskItem({ task, onToggle, onRemove }) {
  return (
    <div className={`task-item ${task.completed ? "completed" : ""}`}>
      <button
        className="task-checkbox"
        onClick={() => onToggle(task.id)}
        style={{ borderColor: task.color, background: task.completed ? task.color : "transparent" }}
      >
        {task.completed && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </button>
      <div className="task-content">
        <span className={`task-title ${task.completed ? "done" : ""}`}>{task.title}</span>
        <span className="task-category-pill" style={{ color: task.color, borderColor: task.color + "40" }}>
          {task.category}
        </span>
      </div>
      <button className="btn-icon btn-remove task-delete" onClick={() => onRemove(task.id)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
