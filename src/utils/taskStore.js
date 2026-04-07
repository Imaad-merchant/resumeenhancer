const TASKS_KEY = "internship-tracker-tasks";
const INIT_KEY = "internship-tracker-initialized-months";

export function loadTasks() {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function getInitializedMonths() {
  try {
    const data = localStorage.getItem(INIT_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function markMonthInitialized(key) {
  const months = getInitializedMonths();
  if (!months.includes(key)) {
    months.push(key);
    localStorage.setItem(INIT_KEY, JSON.stringify(months));
  }
}

export function toggleTask(tasks, date, taskId) {
  const updated = { ...tasks };
  if (updated[date]) {
    updated[date] = updated[date].map((t) =>
      t.id === taskId
        ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
        : t
    );
  }
  saveTasks(updated);
  return updated;
}

export function addCustomTask(tasks, date, title, category, color) {
  const updated = { ...tasks };
  if (!updated[date]) updated[date] = [];
  updated[date].push({
    id: "custom-" + Date.now(),
    templateId: null,
    title,
    category,
    color,
    completed: false,
    completedAt: null,
  });
  saveTasks(updated);
  return updated;
}

export function removeTask(tasks, date, taskId) {
  const updated = { ...tasks };
  if (updated[date]) {
    updated[date] = updated[date].filter((t) => t.id !== taskId);
    if (updated[date].length === 0) delete updated[date];
  }
  saveTasks(updated);
  return updated;
}

export function initializeMonth(tasks, year, month, defaults, realEvents) {
  const key = `${year}-${month}`;
  const initialized = getInitializedMonths();
  if (initialized.includes(key)) return tasks;

  const updated = { ...tasks };
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const weekOfMonth = Math.ceil(day / 7);
    const dateStr = formatDate(year, month, day);

    if (!updated[dateStr]) updated[dateStr] = [];

    // Add recurring tasks matching this week
    const weekTasks = defaults.filter((t) => t.weekOfMonth === Math.min(weekOfMonth, 4));

    // Spread tasks across days of the week (Mon-Fri)
    const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const tasksForDay = weekTasks.filter((_, i) => i % 5 === dayOfWeek - 1);
      for (const t of tasksForDay) {
        if (!updated[dateStr].some((existing) => existing.templateId === t.id)) {
          updated[dateStr].push({
            id: `${t.id}-${dateStr}`,
            templateId: t.id,
            title: t.title,
            category: t.category,
            color: t.color,
            completed: false,
            completedAt: null,
          });
        }
      }
    }
  }

  // Add real fixed-date events (from terry.uga.edu, career.uga.edu, etc.)
  if (realEvents) {
    const monthStr = String(month + 1).padStart(2, "0");
    const prefix = `${year}-${monthStr}`;
    for (const evt of realEvents) {
      if (!evt.date.startsWith(prefix)) continue;
      if (!updated[evt.date]) updated[evt.date] = [];
      if (!updated[evt.date].some((t) => t.title === evt.title)) {
        updated[evt.date].push({
          id: `event-${evt.date}-${Math.random().toString(36).slice(2, 8)}`,
          templateId: null,
          title: evt.title,
          category: evt.category,
          color: evt.color,
          completed: false,
          completedAt: null,
        });
      }
    }
  }

  saveTasks(updated);
  markMonthInitialized(key);
  return updated;
}

export function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
