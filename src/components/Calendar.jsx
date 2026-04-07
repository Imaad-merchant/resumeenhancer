import { formatDate } from "../utils/taskStore";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Calendar({ year, month, selectedDate, onSelectDate, tasks, onPrevMonth, onNextMonth }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const cells = [];

  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, current: false, dateStr: null });
  }

  // Current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(year, month, day);
    cells.push({ day, current: true, dateStr });
  }

  // Next month padding
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, current: false, dateStr: null });
  }

  const goToToday = () => {
    onSelectDate(todayStr);
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="btn btn-icon cal-nav" onClick={onPrevMonth}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="calendar-title">
          <h2>{MONTHS[month]} {year}</h2>
          <button className="btn cal-today-btn" onClick={goToToday}>Today</button>
        </div>
        <button className="btn btn-icon cal-nav" onClick={onNextMonth}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="calendar-grid">
        {DAYS.map((d) => (
          <div key={d} className="calendar-day-header">{d}</div>
        ))}
        {cells.map((cell, idx) => {
          const isToday = cell.dateStr === todayStr;
          const isSelected = cell.dateStr === selectedDate;
          const dayTasks = cell.dateStr ? tasks[cell.dateStr] || [] : [];
          const completedCount = dayTasks.filter((t) => t.completed).length;
          const uniqueColors = [...new Set(dayTasks.map((t) => t.color))].slice(0, 4);

          return (
            <div
              key={idx}
              className={`calendar-day ${cell.current ? "" : "dim"} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
              onClick={() => cell.current && cell.dateStr && onSelectDate(cell.dateStr)}
            >
              <span className="day-number">{cell.day}</span>
              {dayTasks.length > 0 && (
                <div className="task-dots">
                  {uniqueColors.map((c, i) => (
                    <span key={i} className="task-dot" style={{ background: c }} />
                  ))}
                </div>
              )}
              {dayTasks.length > 0 && completedCount === dayTasks.length && (
                <span className="day-check">&#10003;</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
