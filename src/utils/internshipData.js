import { INTERNSHIPS } from "./internshipList.js";

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

const TIER_RANK = { "Tier 1": 0, "Tier 2": 1, Explore: 2 };

function isWeekend(date) {
  return date.getDay() === 0 || date.getDay() === 6;
}

/**
 * Calendar "apply" tasks for openings, scheduled from the plan start date.
 * Dated postings: ~5 days before the deadline (never before it opens or the plan start),
 * nudged off weekends. Undated postings (rolling / "check if open") are queued Tier 1 first
 * and spread PER_DAY per weekday starting two days after the plan start.
 */
const PER_DAY = 3;

export function buildApplicationEvents(startStr) {
  const start = parseDate(startStr);
  const events = [];
  const queue = [];
  for (const i of INTERNSHIPS) {
    if (i.kind !== "opening" || i.postingStatus === "Closed") continue;
    if (i.deadline && parseDate(i.deadline) < start) continue;
    const floor = new Date(Math.max(start, i.opensOn ? parseDate(i.opensOn) : start));

    if (!i.deadline) {
      const upcoming = i.postingStatus === "Upcoming" || i.postingStatus === "Window Published";
      if (upcoming && /opens?\s+(in\s+)?october/i.test(i.dateNotes) && floor.getMonth() < 9) {
        floor.setMonth(9, 1);
        floor.setFullYear(start.getFullYear());
      }
      queue.push({ i, floor, title: upcoming ? `Check if open: ${i.company} — ${i.role}` : `Apply: ${i.company} — ${i.role} (no deadline listed)` });
      continue;
    }

    let date = parseDate(i.deadline);
    date.setDate(date.getDate() - 5);
    if (date < floor) date = new Date(floor);
    // Weekend → previous Friday if allowed, else next Monday
    if (isWeekend(date)) {
      const dow = date.getDay();
      const fri = new Date(date);
      fri.setDate(date.getDate() - (dow === 6 ? 1 : 2));
      if (fri >= floor) date = fri;
      else date.setDate(date.getDate() + (dow === 6 ? 2 : 1));
    }
    events.push({ key: `apply-${i.id}`, date: toDateStr(date), title: `Apply: ${i.company} — ${i.role} (due ${fmt(i.deadline)})`, category: "Applications", color: "#dc2626" });
  }

  queue.sort((a, b) => (TIER_RANK[a.i.tier] ?? 3) - (TIER_RANK[b.i.tier] ?? 3) || a.i.id - b.i.id);
  const slots = {};
  const cursor = new Date(start);
  cursor.setDate(cursor.getDate() + 2);
  for (const { i, floor, title } of queue) {
    let date = new Date(Math.max(cursor, floor));
    while (isWeekend(date) || (slots[toDateStr(date)] || 0) >= PER_DAY) date.setDate(date.getDate() + 1);
    const key = toDateStr(date);
    slots[key] = (slots[key] || 0) + 1;
    events.push({ key: `apply-${i.id}`, date: key, title, category: "Applications", color: "#dc2626" });
  }
  return events;
}
