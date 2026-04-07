import { useState, useEffect, useCallback } from "react";
import Calendar from "../components/Calendar";
import TaskSidebar from "../components/TaskSidebar";
import EventScanner from "../components/EventScanner";
import { loadTasks, saveTasks, toggleTask, addCustomTask, removeTask, initializeMonth, formatDate } from "../utils/taskStore";
import { DEFAULT_TASKS, REAL_EVENTS } from "../utils/defaultTasks";

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(
    formatDate(today.getFullYear(), today.getMonth(), today.getDate())
  );
  const [tasks, setTasks] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    let t = loadTasks();
    t = initializeMonth(t, currentYear, currentMonth, DEFAULT_TASKS, REAL_EVENTS);
    setTasks(t);
  }, [currentYear, currentMonth]);

  const showNotif = useCallback((msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSelectDate = (dateStr) => {
    setSelectedDate(dateStr);
    const [y, m] = dateStr.split("-").map(Number);
    if (y !== currentYear || m - 1 !== currentMonth) {
      setCurrentYear(y);
      setCurrentMonth(m - 1);
    }
  };

  const handleToggle = useCallback((taskId) => {
    setTasks((prev) => toggleTask(prev, selectedDate, taskId));
  }, [selectedDate]);

  const handleAddTask = useCallback((date, title, category, color) => {
    setTasks((prev) => addCustomTask(prev, date, title, category, color));
  }, []);

  const handleRemoveTask = useCallback((taskId) => {
    setTasks((prev) => removeTask(prev, selectedDate, taskId));
  }, [selectedDate]);

  const handleEventsFound = useCallback((events) => {
    setTasks((prev) => {
      const updated = { ...prev };
      let addedCount = 0;

      for (const evt of events) {
        if (!evt.date) continue;
        const dateStr = evt.date;
        if (!updated[dateStr]) updated[dateStr] = [];

        // Don't add duplicates
        if (updated[dateStr].some((t) => t.title === evt.title)) continue;

        const colorMap = {
          high: "#22c55e",
          medium: "#f59e0b",
          low: "#888",
        };

        updated[dateStr].push({
          id: `event-${Date.now()}-${addedCount}`,
          templateId: null,
          title: `${evt.title}${evt.time ? " | " + evt.time : ""}${evt.location ? " | " + evt.location : ""}`,
          category: evt.category || "Terry Event",
          color: evt.company ? "#ec4899" : colorMap[evt.relevance] || "#888",
          completed: false,
          completedAt: null,
        });
        addedCount++;
      }

      saveTasks(updated);
      return updated;
    });

    showNotif(`Added ${events.length} events to your calendar`);
  }, [showNotif]);

  const selectedTasks = tasks[selectedDate] || [];

  return (
    <>
      {notification && (
        <div className={`toast toast-${notification.type}`}>
          {notification.msg}
        </div>
      )}
      <main className="panels calendar-page">
        <div className="calendar-panel">
          <Calendar
            year={currentYear}
            month={currentMonth}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            tasks={tasks}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
          <EventScanner onEventsFound={handleEventsFound} />
        </div>
        <div className="sidebar-panel">
          <TaskSidebar
            date={selectedDate}
            tasks={selectedTasks}
            onToggle={handleToggle}
            onAddTask={handleAddTask}
            onRemoveTask={handleRemoveTask}
          />
        </div>
      </main>
    </>
  );
}
