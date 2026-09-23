// v2 keys: the plan restarted on 2026-09-23 with weeks anchored to a start date
const TASKS_KEY = "internship-tracker-tasks-v2";
const INIT_KEY = "internship-tracker-initialized-months-v2";
const START_KEY = "internship-tracker-plan-start";
const SEEN_KEY = "internship-tracker-seen-events-v2";

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
  write(SEEN_KEY, []);
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
 * Fills a month with recurring template tasks, starting at planStart.
 * Plan week = floor(days since start / 7) % 4 + 1; each week's templates are spread Mon–Fri.
 */
export function initializeMonth(tasks, year, month, defaults, planStart) {
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

  saveTasks(updated);
  write(INIT_KEY, [...initialized, key]);
  return updated;
}

/**
 * Keeps fixed-date events (application deadlines etc.) in sync across all months.
 * Each event has a stable `key`; a key+title pair is only ever added once, so tasks the
 * user deletes don't come back. When an event's title/date changes (deadline moved) or it
 * disappears (posting closed), its old unchecked task is removed. Checked-off tasks are kept.
 */
export function syncFixedEvents(tasks, events, planStart) {
  const seen = new Set(read(SEEN_KEY, []));
  const current = new Map(events.filter((e) => e.date >= planStart).map((e) => [e.key, e]));
  const updated = {};
  let changed = false;

  for (const [date, list] of Object.entries(tasks)) {
    const kept = list.filter((t) => {
      if (!t.eventKey || t.completed) return true;
      const evt = current.get(t.eventKey);
      const stale = !evt || evt.title !== t.title || evt.date !== date;
      if (stale) changed = true;
      return !stale;
    });
    if (kept.length) updated[date] = kept;
  }

  for (const evt of current.values()) {
    const id = `${evt.key}|${evt.title}`;
    if (seen.has(id)) continue;
    seen.add(id);
    changed = true;
    if (!updated[evt.date]) updated[evt.date] = [];
    if (updated[evt.date].some((t) => t.eventKey === evt.key)) continue;
    updated[evt.date] = [...updated[evt.date], {
      id: `event-${evt.key}-${evt.date}`,
      templateId: null,
      eventKey: evt.key,
      title: evt.title,
      category: evt.category,
      color: evt.color,
      completed: false,
      completedAt: null,
    }];
  }

  if (!changed) return tasks;
  write(SEEN_KEY, [...seen]);
  saveTasks(updated);
  return updated;
}

export function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
