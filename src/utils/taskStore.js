// v2 keys: the plan restarted on 2026-09-23 with weeks anchored to a start date
const TASKS_KEY = "internship-tracker-tasks-v2";
const INIT_KEY = "internship-tracker-initialized-months-v2";
const START_KEY = "internship-tracker-plan-start";

function read(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable — state lasts for this session only
  }
}

function todayStr() {
  const d = new Date();
  return formatDate(d.getFullYear(), d.getMonth(), d.getDate());
}

export function loadTasks() {
  return read(TASKS_KEY, {});
}

export function saveTasks(tasks) {
  write(TASKS_KEY, tasks);
}

/** The day the plan started; set to today the first time it's read. */
export function getPlanStart() {
  let start = read(START_KEY, null);
  if (!start) {
    start = todayStr();
    write(START_KEY, start);
  }
  return start;
}

/** Wipes all calendar tasks and restarts the 4-week plan from today. */
export function resetPlan() {
  write(TASKS_KEY, {});
  write(INIT_KEY, []);
  write(START_KEY, todayStr());
  return {};
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

/**
 * Fills a month with recurring template tasks and fixed-date events, starting at planStart.
 * Plan week = floor(days since start / 7) % 4 + 1; each week's templates are spread Mon–Fri.
 */
export function initializeMonth(tasks, year, month, defaults, fixedEvents, planStart) {
  const key = `${year}-${month}`;
  const initialized = read(INIT_KEY, []);
  if (initialized.includes(key)) return tasks;

  const [sy, sm, sd] = planStart.split("-").map(Number);
  const start = new Date(sy, sm - 1, sd);
  const updated = { ...tasks };
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (date < start) continue;
    const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const daysSinceStart = Math.round((date - start) / 86400000);
    const planWeek = (Math.floor(daysSinceStart / 7) % 4) + 1;
    const weekTasks = defaults.filter((t) => t.weekOfMonth === planWeek);
    const tasksForDay = weekTasks.filter((_, i) => i % 5 === dayOfWeek - 1);

    const dateStr = formatDate(year, month, day);
    for (const t of tasksForDay) {
      if (!updated[dateStr]) updated[dateStr] = [];
      if (updated[dateStr].some((existing) => existing.templateId === t.id)) continue;
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

  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  for (const evt of fixedEvents || []) {
    if (!evt.date.startsWith(prefix) || evt.date < planStart) continue;
    if (!updated[evt.date]) updated[evt.date] = [];
    if (updated[evt.date].some((t) => t.title === evt.title)) continue;
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

  saveTasks(updated);
  write(INIT_KEY, [...initialized, key]);
  return updated;
}

export function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
