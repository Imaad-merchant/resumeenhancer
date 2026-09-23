// Two-way sync with the Google Sheet tracker via /api/tracker.
const PASS_KEY = "tracker-passcode";

export const STATUS_LABELS = {
  not_started: "Not Started",
  researching: "Researching",
  applying: "Applying",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
};
const LABEL_TO_STATUS = Object.fromEntries(Object.entries(STATUS_LABELS).map(([k, v]) => [v.toLowerCase(), k]));

// app field → sheet header (status is translated separately)
const COLUMNS = { appliedOn: "Applied On", contact: "Contact / Referral", followUp: "Follow-Up", nextAction: "Next Action", notes: "Notes" };

function getPasscode() {
  try {
    return localStorage.getItem(PASS_KEY) || "";
  } catch {
    return "";
  }
}

async function call(method, body, retried = false) {
  const res = await fetch("/api/tracker", {
    method,
    headers: { "Content-Type": "application/json", "x-tracker-passcode": getPasscode() },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    // non-JSON (e.g. 404 when /api isn't served)
  }
  if (res.status === 401 && data.needPasscode && !retried) {
    const code = window.prompt("Enter your tracker passcode to sync with Google Sheets:");
    if (code) {
      try {
        localStorage.setItem(PASS_KEY, code);
      } catch {
        // ignore
      }
      return call(method, body, true);
    }
  }
  if (!res.ok) {
    const err = new Error(data.error || `Sheet sync failed (${res.status})`);
    err.notConfigured = res.status === 503 || res.status === 404;
    throw err;
  }
  return data;
}

const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "");

function roleMatches(sheetRole, appRole) {
  if (!sheetRole) return false;
  if (norm(sheetRole) === norm(appRole)) return true;
  if (sheetRole.endsWith("...")) return norm(appRole).startsWith(norm(sheetRole.slice(0, -3)));
  return false;
}

/** Fetches the sheet and merges it into the internship list. Sheet values win. */
export async function pullFromSheet(internships) {
  const { rows } = await call("GET");
  const byId = new Map(internships.map((i) => [String(i.id), i]));
  const used = new Set();
  const merged = new Map(internships.map((i) => [i.id, { ...i }]));
  const extras = [];

  for (const r of rows) {
    let match = r["App ID"] && byId.get(String(r["App ID"]));
    if (!match && r.Link) match = internships.find((i) => !used.has(i.id) && i.url && i.url === r.Link);
    if (!match) match = internships.find((i) => !used.has(i.id) && norm(i.company) === norm(r.Company) && roleMatches(r.Role, i.role));

    const fromSheet = {
      sheetRow: r.row,
      status: LABEL_TO_STATUS[(r["My Status"] || "").toLowerCase()] || "not_started",
      ...Object.fromEntries(Object.entries(COLUMNS).map(([k, h]) => [k, r[h] || ""])),
    };

    if (match && !used.has(match.id)) {
      used.add(match.id);
      const cur = merged.get(match.id);
      Object.assign(cur, fromSheet);
      if (isDate(r.Deadline)) cur.deadline = r.Deadline;
    } else if (!match) {
      // Row added directly in the sheet
      extras.push({
        id: r["App ID"] || `row-${r.row}`,
        kind: r.Type === "Target" ? "target" : "opening",
        company: r.Company,
        role: r.Role || "",
        function: "",
        location: r.Location || "",
        opensOn: null,
        deadline: isDate(r.Deadline) ? r.Deadline : null,
        deadlineType: "",
        postingStatus: r.Posting || "Open",
        category: r.Industry || "Other",
        industry: r.Industry || "",
        tier: r.Tier || "",
        fit: "Added in your Google Sheet",
        keywords: "",
        url: r.Link || "",
        dateNotes: "",
        fromSheet: true,
        ...fromSheet,
      });
    }
  }
  return [...merged.values(), ...extras];
}

/** Writes one internship's tracking fields to the sheet. */
export async function pushToSheet(intern, patch) {
  const fields = {};
  for (const [k, v] of Object.entries(patch)) {
    if (k === "status") fields.status = STATUS_LABELS[v] || v;
    else if (k in COLUMNS) fields[k] = v ?? "";
  }
  if (!Object.keys(fields).length) return null;
  return call("POST", { id: intern.id, row: intern.sheetRow, company: intern.company, role: intern.role, link: intern.url, fields });
}
