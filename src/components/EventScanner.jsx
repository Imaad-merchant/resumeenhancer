import { useState } from "react";
import Anthropic from "@anthropic-ai/sdk";
import { INTERNSHIPS } from "../utils/internshipData";

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

const PROFILE = `Supply chain management major at UGA Terry College of Business.
Certificate in legal studies and financial technology. Sophomore, first-gen, from Texas.
Interests: vendor management, business development, strategy, operations.
Target industries: beauty/wellness, airlines, fintech, luxury brands.`;

export default function EventScanner({ onEventsFound }) {
  const [pastedText, setPastedText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const handleScan = async () => {
    if (!pastedText.trim()) return;
    setScanning(true);
    setError("");
    setResults(null);

    try {
      const companyNames = INTERNSHIPS.map((i) => i.company);
      const uniqueCompanies = [...new Set(companyNames)];

      const message = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `You are a career advisor analyzing a university newsletter for a student.

STUDENT PROFILE:
${PROFILE}

COMPANIES ALREADY IN THEIR INTERNSHIP TRACKER:
${uniqueCompanies.join(", ")}

NEWSLETTER/EMAIL CONTENT:
"""
${pastedText}
"""

Extract ALL events from this newsletter. For each event, return a JSON array with objects containing:
- "title": event name
- "date": date in YYYY-MM-DD format (assume current year 2026 if not specified)
- "time": time range as string
- "location": venue/room
- "company": company name if a specific company is featured (null if general event)
- "category": one of "Terry Event", "Career Fair", "Info Session", "Workshop", "Networking", "Club Meeting"
- "relevance": "high", "medium", or "low" based on how relevant this is to the student's profile
- "why": 1 sentence explaining why this is or isn't relevant
- "hasInternship": true if the company is in their internship tracker, false otherwise
- "suggestAdd": true if this company has supply chain, operations, business dev, or strategy internships that AREN'T in the tracker yet, false otherwise
- "suggestedRole": if suggestAdd is true, suggest a specific role title to research

Return ONLY the JSON array, no other text.`,
          },
        ],
      });

      const text = message.content[0]?.text?.trim();
      const parsed = JSON.parse(text);
      setResults(parsed);
    } catch (err) {
      console.error("Scan failed:", err);
      setError(err.message || "Failed to scan newsletter");
    } finally {
      setScanning(false);
    }
  };

  const handleAddEvents = () => {
    if (results && onEventsFound) {
      onEventsFound(results);
      setResults(null);
      setPastedText("");
    }
  };

  const relevanceColor = (r) => {
    if (r === "high") return "#22c55e";
    if (r === "medium") return "#f59e0b";
    return "var(--text-dim)";
  };

  return (
    <div className="event-scanner">
      <div className="scanner-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16v16H4z" />
          <path d="M4 9h16M9 4v16" />
        </svg>
        <h3>Event Scanner</h3>
        <span className="scanner-badge">Paste newsletter</span>
      </div>

      {!results ? (
        <div className="scanner-input-area">
          <textarea
            className="raw-input scanner-textarea"
            placeholder="Paste your weekly Terry College email or newsletter here... I'll extract events, find relevant companies, and check if they have internships for you."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={6}
          />
          <button
            className="btn btn-generate"
            onClick={handleScan}
            disabled={scanning || !pastedText.trim()}
          >
            {scanning ? (
              <>
                <span className="spinner" />
                Scanning...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                Scan for Events & Companies
              </>
            )}
          </button>
          {error && <p className="scanner-error">{error}</p>}
        </div>
      ) : (
        <div className="scanner-results">
          <div className="scanner-results-header">
            <span>Found {results.length} events</span>
            <div className="scanner-results-actions">
              <button className="btn btn-save" onClick={handleAddEvents}>
                Add to Calendar
              </button>
              <button className="btn btn-discard" onClick={() => { setResults(null); setPastedText(""); }}>
                Dismiss
              </button>
            </div>
          </div>

          <div className="scanner-events">
            {results.map((evt, idx) => (
              <div key={idx} className={`scanner-event ${evt.relevance}`}>
                <div className="scanner-event-top">
                  <span className="scanner-relevance" style={{ color: relevanceColor(evt.relevance) }}>
                    {evt.relevance === "high" ? "!! " : evt.relevance === "medium" ? "! " : ""}
                    {evt.relevance.toUpperCase()}
                  </span>
                  {evt.hasInternship && (
                    <span className="scanner-match-badge">In Tracker</span>
                  )}
                  {evt.suggestAdd && (
                    <span className="scanner-suggest-badge">+ Add to Tracker</span>
                  )}
                </div>
                <div className="scanner-event-title">{evt.title}</div>
                <div className="scanner-event-meta">
                  <span>{evt.date}</span>
                  {evt.time && <span>{evt.time}</span>}
                  {evt.location && <span>{evt.location}</span>}
                </div>
                <div className="scanner-event-why">{evt.why}</div>
                {evt.suggestedRole && (
                  <div className="scanner-event-suggest">
                    Look into: <strong>{evt.suggestedRole}</strong> at {evt.company}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
