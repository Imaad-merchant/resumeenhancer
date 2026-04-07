import { useState, useMemo } from "react";
import { loadInternships, saveInternships, updateInternshipStatus, updateInternshipNotes } from "../utils/internshipData";

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not Started", color: "var(--text-dim)" },
  { value: "researching", label: "Researching", color: "#f59e0b" },
  { value: "applying", label: "Applying", color: "#3b82f6" },
  { value: "applied", label: "Applied", color: "#a855f7" },
  { value: "interviewing", label: "Interviewing", color: "#ec4899" },
  { value: "offer", label: "Offer!", color: "#22c55e" },
  { value: "rejected", label: "Rejected", color: "#ef4444" },
];

const CATEGORY_FILTERS = ["All", "Beauty & Wellness", "Airlines", "Fintech", "Brands"];
const LOCATION_FILTERS = ["All Locations", "Atlanta, GA", "New York, NY", "San Francisco, CA", "Dallas, TX", "Chicago, IL", "Remote"];

export default function InternshipTracker() {
  const [internships, setInternships] = useState(loadInternships());
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [editingNotes, setEditingNotes] = useState("");

  const filtered = useMemo(() => {
    return internships.filter((i) => {
      if (categoryFilter !== "All" && i.category !== categoryFilter) return false;
      if (locationFilter !== "All Locations" && !i.location.includes(locationFilter.replace(", GA", "").replace(", NY", "").replace(", CA", "").replace(", TX", "").replace(", IL", ""))) return false;
      if (statusFilter !== "All" && i.status !== statusFilter) return false;
      if (searchQuery && !i.company.toLowerCase().includes(searchQuery.toLowerCase()) && !i.role.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [internships, categoryFilter, locationFilter, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = internships.length;
    const applied = internships.filter((i) => ["applied", "interviewing", "offer"].includes(i.status)).length;
    const interviewing = internships.filter((i) => i.status === "interviewing").length;
    const offers = internships.filter((i) => i.status === "offer").length;
    return { total, applied, interviewing, offers };
  }, [internships]);

  const handleStatusChange = (id, status) => {
    const updated = updateInternshipStatus(internships, id, status);
    setInternships([...updated]);
  };

  const handleNotesChange = (id) => {
    const updated = updateInternshipNotes(internships, id, editingNotes);
    setInternships([...updated]);
    setExpandedId(null);
  };

  const handleExpand = (id, currentNotes) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setEditingNotes(currentNotes || "");
    }
  };

  const getStatusInfo = (status) => STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

  return (
    <main className="tracker-page">
      {/* Stats bar */}
      <div className="tracker-stats">
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card stat-blue">
          <span className="stat-number">{stats.applied}</span>
          <span className="stat-label">Applied</span>
        </div>
        <div className="stat-card stat-pink">
          <span className="stat-number">{stats.interviewing}</span>
          <span className="stat-label">Interviewing</span>
        </div>
        <div className="stat-card stat-green">
          <span className="stat-number">{stats.offers}</span>
          <span className="stat-label">Offers</span>
        </div>
      </div>

      {/* Filters */}
      <div className="tracker-filters">
        <input
          className="raw-input tracker-search"
          placeholder="Search company or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="filter-pills">
          {CATEGORY_FILTERS.map((cat) => (
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
          <select
            className="section-select"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            {LOCATION_FILTERS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <select
            className="section-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
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
            return (
              <div key={intern.id} className={`tracker-card ${isExpanded ? "expanded" : ""}`}>
                <div className="tracker-card-main" onClick={() => handleExpand(intern.id, intern.notes)}>
                  <div className="tracker-card-left">
                    <div className="tracker-company">{intern.company}</div>
                    <div className="tracker-role">{intern.role}</div>
                    <div className="tracker-meta">
                      <span className="tracker-location">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {intern.location}
                      </span>
                      <span className="tracker-category-tag">{intern.category}</span>
                      <span className="tracker-deadline">
                        Due: {new Date(intern.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
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
                    <textarea
                      className="raw-input tracker-notes"
                      placeholder="Add notes about this internship..."
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      rows={3}
                    />
                    <div className="tracker-card-actions">
                      <button className="btn btn-save" onClick={() => handleNotesChange(intern.id)}>
                        Save Notes
                      </button>
                      {intern.url && (
                        <a className="btn" href={intern.url} target="_blank" rel="noopener noreferrer">
                          Apply Link
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
