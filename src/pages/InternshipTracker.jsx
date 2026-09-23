import { useState, useMemo, useEffect, useCallback } from "react";
import { loadInternships, updateInternship, persistInternships, daysUntil, parseDate } from "../utils/internshipData";
import { pullFromSheet, pushToSheet } from "../utils/sheetSync";
import { CLASS_YEAR, FOCUS_AREAS, TARGET_ROLES, TARGET_INDUSTRIES, INTERN_FUNCTIONS, ROLE_SEARCH_BANK } from "../utils/careerProfile";

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not Started", color: "var(--text-dim)" },
  { value: "researching", label: "Researching", color: "#f59e0b" },
  { value: "applying", label: "Applying", color: "#3b82f6" },
  { value: "applied", label: "Applied", color: "#a855f7" },
  { value: "interviewing", label: "Interviewing", color: "#ec4899" },
  { value: "offer", label: "Offer!", color: "#22c55e" },
  { value: "rejected", label: "Rejected", color: "#ef4444" },
];

const DONE_STATUSES = ["applied", "interviewing", "offer", "rejected"];

const KIND_FILTERS = [
  { value: "all", label: "All" },
  { value: "opening", label: "Open 2027 roles" },
  { value: "target", label: "Target companies" },
];

const LOCATION_FILTERS = {
  "All Locations": null,
  Atlanta: /atlanta|alpharetta|peachtree|\bGA\b|georgia/i,
  Texas: /texas|\bTX\b|dallas|houston|austin|plano|westlake|addison|dfw|round rock/i,
  "New York": /nyc|new york|\bNY\b/i,
  Chicago: /chicago|\bIL\b|bolingbrook/i,
  "National / Multiple": /national|multiple|u\.s\.|united states|global|remote/i,
};

const EMPTY_EDIT = { appliedOn: "", followUp: "", contact: "", nextAction: "", notes: "" };

const TIER_ORDER = { "Tier 1": 0, "Tier 2": 1, Explore: 2 };

function formatDay(str) {
  return parseDate(str).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function deadlineInfo(intern) {
  if (intern.kind !== "opening") return { label: "No verified posting yet", tone: "muted" };
  if (intern.postingStatus === "Closed") return { label: "Posting closed", tone: "closed" };
  if (intern.eligibility === "no") return { label: "Likely not eligible (see Dates)", tone: "closed" };
  if (!intern.deadline) {
    if (intern.deadlineType === "Ongoing") return { label: "Rolling — apply anytime", tone: "ok" };
    if (intern.postingStatus === "Upcoming" || intern.postingStatus === "Window Published") return { label: "Opening soon — watch", tone: "watch" };
    return { label: "Open — no deadline listed", tone: "ok" };
  }
  const days = daysUntil(intern.deadline);
  if (days < 0) return { label: `Closed ${formatDay(intern.deadline)}`, tone: "closed" };
  const when = days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
  const opens = intern.opensOn && daysUntil(intern.opensOn) > 0 ? ` · opens ${formatDay(intern.opensOn)}` : "";
  return { label: `Due ${formatDay(intern.deadline)} (${when})${opens}`, tone: days <= 7 ? "urgent" : days <= 14 ? "soon" : "ok" };
}

function sortKey(i) {
  if (i.kind === "opening") {
    const days = i.deadline ? daysUntil(i.deadline) : 9999;
    return [0, days < 0 || i.postingStatus === "Closed" || i.eligibility === "no" ? 99999 : days, TIER_ORDER[i.tier] ?? 3, i.company];
  }
  return [1, 0, TIER_ORDER[i.tier] ?? 3, i.company];
}

function compare(a, b) {
  const ka = sortKey(a);
  const kb = sortKey(b);
  for (let n = 0; n < ka.length; n++) {
    if (ka[n] < kb[n]) return -1;
    if (ka[n] > kb[n]) return 1;
  }
  return 0;
}

export default function InternshipTracker() {
  const [internships, setInternships] = useState(loadInternships);
  const [kindFilter, setKindFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [editing, setEditing] = useState(EMPTY_EDIT);
  const [sync, setSync] = useState({ state: "loading", msg: "" });
  const [focusOpen, setFocusOpen] = useState(false);

  const categories = useMemo(() => ["All", ...[...new Set(internships.map((i) => i.category))].sort()], [internships]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const locRe = LOCATION_FILTERS[locationFilter];
    return internships
      .filter((i) => {
        if (kindFilter !== "all" && i.kind !== kindFilter) return false;
        if (categoryFilter !== "All" && i.category !== categoryFilter) return false;
        if (locRe && !locRe.test(i.location)) return false;
        if (statusFilter !== "All" && i.status !== statusFilter) return false;
        if (q && ![i.company, i.role, i.keywords, i.function, i.industry].some((f) => f?.toLowerCase().includes(q))) return false;
        return true;
      })
      .sort(compare);
  }, [internships, kindFilter, categoryFilter, locationFilter, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const openings = internships.filter((i) => i.kind === "opening");
    const live = openings.filter((i) => i.postingStatus !== "Closed" && i.eligibility !== "no" && (!i.deadline || daysUntil(i.deadline) >= 0));
    const dueSoon = live.filter((i) => i.deadline && daysUntil(i.deadline) <= 7 && !DONE_STATUSES.includes(i.status)).length;
    const applied = internships.filter((i) => ["applied", "interviewing", "offer"].includes(i.status)).length;
    const interviewing = internships.filter((i) => i.status === "interviewing").length;
    return { live: live.length, dueSoon, applied, interviewing };
  }, [internships]);

  const refreshFromSheet = useCallback(async () => {
    setSync((s) => ({ ...s, state: "loading" }));
    try {
      const merged = await pullFromSheet(loadInternships());
      persistInternships(merged);
      setInternships(merged);
      setSync({ state: "ok", msg: `Synced ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` });
    } catch (err) {
      setSync({ state: err.notConfigured ? "off" : "error", msg: err.notConfigured ? "Google Sheet sync not set up" : err.message });
    }
  }, []);

  useEffect(() => {
    refreshFromSheet();
  }, [refreshFromSheet]);

  // Local update first, then write-through to the sheet
  const saveFields = async (id, patch) => {
    const updated = updateInternship(internships, id, patch);
    setInternships(updated);
    if (sync.state === "off") return;
    const intern = updated.find((i) => i.id === id);
    try {
      const res = await pushToSheet(intern, patch);
      if (res?.row) setInternships((list) => list.map((i) => (i.id === id ? { ...i, sheetRow: res.row } : i)));
      setSync({ state: "ok", msg: `Saved to sheet ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` });
    } catch (err) {
      setSync({ state: err.notConfigured ? "off" : "error", msg: `Not saved to sheet: ${err.message}` });
    }
  };

  const handleStatusChange = (id, status) => saveFields(id, { status });

  const handleSaveDetails = (id) => {
    saveFields(id, editing);
    setExpandedId(null);
  };

  const handleExpand = (intern) => {
    if (expandedId === intern.id) {
      setExpandedId(null);
    } else {
      setExpandedId(intern.id);
      setEditing(Object.fromEntries(Object.keys(EMPTY_EDIT).map((k) => [k, intern[k] || ""])));
    }
  };

  const setEdit = (k) => (e) => setEditing((ed) => ({ ...ed, [k]: e.target.value }));

  const searchFor = (term) => {
    setSearchQuery(term);
    setKindFilter("all");
    setCategoryFilter("All");
  };

  const getStatusInfo = (status) => STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

  return (
    <main className="tracker-page">
      <div className={`sync-bar sync-${sync.state}`}>
        <span className="sync-dot" />
        <span>{sync.state === "loading" ? "Syncing with Google Sheet…" : sync.msg}</span>
        {sync.state !== "loading" && sync.state !== "off" && (
          <button className="sync-refresh" onClick={refreshFromSheet}>Refresh from sheet</button>
        )}
      </div>

      {/* Stats bar */}
      <div className="tracker-stats">
        <button className="stat-card stat-clickable" onClick={() => setKindFilter("opening")}>
          <span className="stat-number">{stats.live}</span>
          <span className="stat-label">Open Roles</span>
        </button>
        <button className="stat-card stat-red stat-clickable" onClick={() => setKindFilter("opening")}>
          <span className="stat-number">{stats.dueSoon}</span>
          <span className="stat-label">Due in 7 Days</span>
        </button>
        <div className="stat-card stat-blue">
          <span className="stat-number">{stats.applied}</span>
          <span className="stat-label">Applied</span>
        </div>
        <div className="stat-card stat-pink">
          <span className="stat-number">{stats.interviewing}</span>
          <span className="stat-label">Interviewing</span>
        </div>
      </div>

      {/* My Focus */}
      <section className="focus-panel">
        <button className="focus-toggle" onClick={() => setFocusOpen((o) => !o)}>
          My Focus <span className="focus-caret">{focusOpen ? "−" : "+"}</span>
        </button>
        {focusOpen && (
          <div className="focus-body">
            <div className="focus-row">
              <span className="focus-label">Intern in</span>
              <div className="focus-chips">
                {INTERN_FUNCTIONS.map((f) => (
                  <button key={f} className="focus-chip focus-chip-link" title={`Search for "${f}"`} onClick={() => searchFor(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="focus-row">
              <span className="focus-label">Class</span>
              <div className="focus-chips">
                <span className="focus-chip">{CLASS_YEAR}</span>
              </div>
            </div>
            <div className="focus-row">
              <span className="focus-label">Roles</span>
              <div className="focus-chips">
                {TARGET_ROLES.map((r) => <span key={r} className="focus-chip">{r}</span>)}
              </div>
            </div>
            <div className="focus-row">
              <span className="focus-label">Industries</span>
              <div className="focus-chips">
                {TARGET_INDUSTRIES.map((c) => <span key={c} className="focus-chip">{c}</span>)}
              </div>
            </div>
            <div className="focus-areas">
              {FOCUS_AREAS.map((a) => (
                <div key={a.name} className="focus-area">
                  <div className="focus-area-name">{a.name}</div>
                  {a.topics.length > 0 && <div className="focus-area-topics">{a.topics.join(" · ")}</div>}
                </div>
              ))}
            </div>
            <div className="focus-search-bank">
              <div className="focus-label">Search these on Handshake &amp; careers pages</div>
              <div className="search-bank-grid">
                {ROLE_SEARCH_BANK.map((r) => (
                  <div key={r.family} className="search-bank-item" title={`Also try: ${r.also.join(", ")}`}>
                    <span className={`search-bank-dot priority-${r.priority.split(" ")[0].toLowerCase()}`} />
                    <span className="search-bank-term">{r.search}</span>
                    <span className="search-bank-also">{r.also.join(" · ")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Filters */}
      <div className="tracker-filters">
        <div className="filter-row">
          <input
            className="raw-input tracker-search"
            placeholder="Search company, role, or keyword (e.g. procurement)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="kind-toggle">
            {KIND_FILTERS.map((k) => (
              <button
                key={k.value}
                className={`filter-pill ${kindFilter === k.value ? "active" : ""}`}
                onClick={() => setKindFilter(k.value)}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-pill ${categoryFilter === cat ? "active" : ""}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="filter-row">
          <select className="section-select" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
            {Object.keys(LOCATION_FILTERS).map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <select className="section-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <span className="tracker-count">{filtered.length} shown</span>
        </div>
      </div>

      {/* Internship list */}
      <div className="tracker-list">
        {filtered.length === 0 ? (
          <div className="tracker-empty">
            <p>No internships match your filters</p>
          </div>
        ) : (
          filtered.map((intern) => {
            const statusInfo = getStatusInfo(intern.status);
            const isExpanded = expandedId === intern.id;
            const due = deadlineInfo(intern);
            return (
              <div key={intern.id} className={`tracker-card ${isExpanded ? "expanded" : ""} ${intern.kind === "target" ? "tracker-card-target" : ""}`}>
                <div className="tracker-card-main" onClick={() => handleExpand(intern)}>
                  <div className="tracker-card-left">
                    <div className="tracker-company">
                      {intern.company}
                      {intern.isNew && <span className="tier-tag tier-new">New</span>}
                      {intern.tier && <span className={`tier-tag tier-${intern.tier.replace(/\s/g, "").toLowerCase()}`}>{intern.tier}</span>}
                    </div>
                    <div className="tracker-role">
                      {intern.kind === "target" ? `${intern.role} · search: ${intern.keywords}` : intern.role}
                    </div>
                    <div className="tracker-meta">
                      <span className="tracker-location">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {intern.location}
                      </span>
                      <span className="tracker-category-tag">{intern.category}</span>
                      <span className={`tracker-deadline due-${due.tone}`}>{due.label}</span>
                      {intern.followUp && (
                        <span className={`tracker-followup ${daysUntil(intern.followUp) <= 0 ? "due" : ""}`}>Follow up {formatDay(intern.followUp)}</span>
                      )}
                    </div>
                  </div>
                  <div className="tracker-card-right">
                    <select
                      className="status-select"
                      value={intern.status}
                      onChange={(e) => { e.stopPropagation(); handleStatusChange(intern.id, e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: statusInfo.color, borderColor: statusInfo.color + "60" }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {isExpanded && (
                  <div className="tracker-card-expanded">
                    <dl className="tracker-details">
                      {intern.fit && (<><dt>Why it fits</dt><dd>{intern.fit}</dd></>)}
                      {intern.kind === "opening" && intern.keywords && (<><dt>Keywords</dt><dd>{intern.keywords}</dd></>)}
                      {intern.dateNotes && (<><dt>Dates</dt><dd>{intern.dateNotes}{intern.verifiedOn && ` (verified ${formatDay(intern.verifiedOn)})`}</dd></>)}
                    </dl>
                    <div className="tracker-edit-grid">
                      <label>Applied on<input type="date" className="raw-input" value={editing.appliedOn} onChange={setEdit("appliedOn")} /></label>
                      <label>Follow-up<input type="date" className="raw-input" value={editing.followUp} onChange={setEdit("followUp")} /></label>
                      <label>Contact / referral<input className="raw-input" value={editing.contact} onChange={setEdit("contact")} placeholder="Name, how you know them" /></label>
                      <label>Next action<input className="raw-input" value={editing.nextAction} onChange={setEdit("nextAction")} placeholder="e.g. Email recruiter" /></label>
                    </div>
                    <textarea
                      className="raw-input tracker-notes"
                      placeholder="Notes"
                      value={editing.notes}
                      onChange={setEdit("notes")}
                      rows={3}
                    />
                    <div className="tracker-card-actions">
                      <button className="btn btn-save" onClick={() => handleSaveDetails(intern.id)}>
                        {sync.state === "off" ? "Save" : "Save (syncs to sheet)"}
                      </button>
                      {intern.url ? (
                        <a className="btn" href={intern.url} target="_blank" rel="noopener noreferrer">
                          {intern.kind === "opening" ? "Apply Link" : "Careers Link"}
                        </a>
                      ) : (
                        <a
                          className="btn"
                          href={`https://www.google.com/search?q=${encodeURIComponent(`${intern.company} summer 2027 internship ${intern.role}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Search Careers
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
