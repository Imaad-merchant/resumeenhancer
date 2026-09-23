import { INTERNSHIPS } from "./internshipList";

export { INTERNSHIPS };

// Only the user's own fields are persisted, keyed by id, so the list itself can be refreshed.
const STATE_KEY = "internship-tracker-state-v2";

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STATE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveState(internships) {
  const state = {};
  for (const i of internships) {
    if (i.status !== "not_started" || i.notes) state[i.id] = { status: i.status, notes: i.notes };
  }
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — changes last for this session only
  }
}

export function loadInternships() {
  const state = loadState();
  return INTERNSHIPS.map((i) => ({ ...i, ...state[i.id] }));
}

export function updateInternshipStatus(internships, id, status) {
  const updated = internships.map((i) => (i.id === id ? { ...i, status } : i));
  saveState(updated);
  return updated;
}

export function updateInternshipNotes(internships, id, notes) {
  const updated = internships.map((i) => (i.id === id ? { ...i, notes } : i));
  saveState(updated);
  return updated;
}

export function parseDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function daysUntil(dateStr, from = new Date()) {
  if (!dateStr) return null;
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((parseDate(dateStr) - today) / 86400000);
}

const fmt = (str) => parseDate(str).toLocaleDateString("en-US", { month: "numeric", day: "numeric" });

/**
 * Calendar "apply" tasks for verified openings, scheduled from the plan start date:
 * ~5 days before the deadline (never before it opens or before the plan start),
 * nudged off weekends. Rolling/undated postings go in the first week.
 */
export function buildApplicationEvents(startStr) {
  const start = parseDate(startStr);
  const events = [];
  for (const i of INTERNSHIPS) {
    if (i.kind !== "opening") continue;
    if (i.deadline && parseDate(i.deadline) < start) continue;

    const floor = new Date(Math.max(start, i.opensOn ? parseDate(i.opensOn) : start));
    let date;
    let title;
    if (i.deadline) {
      date = parseDate(i.deadline);
      date.setDate(date.getDate() - 5);
      if (date < floor) date = new Date(floor);
      title = `Apply: ${i.company} — ${i.role} (due ${fmt(i.deadline)})`;
    } else if (i.postingStatus === "Upcoming" || i.postingStatus === "Window Published") {
      date = new Date(floor);
      if (/opens?\s+(in\s+)?october/i.test(i.dateNotes) && date.getMonth() < 9) date = new Date(date.getFullYear(), 9, 1);
      title = `Check if open: ${i.company} — ${i.role}`;
    } else {
      date = new Date(floor);
      date.setDate(date.getDate() + 2);
      title = `Apply: ${i.company} — ${i.role} (rolling)`;
    }
    // Weekend → previous Friday if allowed, else next Monday
    const dow = date.getDay();
    if (dow === 0 || dow === 6) {
      const fri = new Date(date);
      fri.setDate(date.getDate() - (dow === 6 ? 1 : 2));
      if (fri >= floor) date = fri;
      else date.setDate(date.getDate() + (dow === 6 ? 2 : 1));
    }
    events.push({ date: toDateStr(date), title, category: "Applications", color: "#dc2626" });
  }
  return events;
}
