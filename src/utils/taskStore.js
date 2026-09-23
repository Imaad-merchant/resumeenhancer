const TASKS_KEY = "internship-tracker-tasks";
const INIT_KEY = "internship-tracker-initialized-months";
const VERSIONS_KEY = "internship-tracker-month-versions";

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

function getMonthVersions() {
  try {
    const data = localStorage.getItem(VERSIONS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function markMonthInitialized(key, version) {
  const months = getInitializedMonths();
  if (!months.includes(key)) {
    months.push(key);
    localStorage.setItem(INIT_KEY, JSON.stringify(months));
  }
  const versions = getMonthVersions();
  versions[key] = version;
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
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

export function initializeMonth(tasks, year, month, defaults, realEvents, templateVersion = 1) {
  const key = `${year}-${month}`;
  // Months initialized before versioning existed count as version 1
  const done = getMonthVersions()[key] ?? (getInitializedMonths().includes(key) ? 1 : 0);
  if (done >= templateVersion) return tasks;

  // Don't backfill new templates into past months
  const now = new Date();
  if (done > 0 && (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth()))) {
    markMonthInitialized(key, templateVersion);
    return tasks;
  }

  const templates = defaults.filter((t) => (t.since ?? 1) > done);
  const updated = { ...tasks };
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const weekOfMonth = Math.ceil(day / 7);
    const dateStr = formatDate(year, month, day);

    if (!updated[dateStr]) updated[dateStr] = [];

    // Add recurring tasks matching this week
    const weekTasks = templates.filter((t) => t.weekOfMonth === Math.min(weekOfMonth, 4));

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
  if (realEvents && done === 0) {
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
  markMonthInitialized(key, templateVersion);
  return updated;
}

export function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
