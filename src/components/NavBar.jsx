import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="header-nav">
      <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        Resume
      </NavLink>
      <NavLink to="/tracker" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="18" rx="2" />
          <path d="M8 3v3M16 3v3M2 9h20" />
        </svg>
        Internships
      </NavLink>
      <NavLink to="/calendar" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        Calendar
      </NavLink>
    </nav>
  );
}
