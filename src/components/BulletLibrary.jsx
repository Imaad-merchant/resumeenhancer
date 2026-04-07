import { useState } from "react";
import { generateBullets } from "../utils/generateBullet";

export default function BulletLibrary({
  library,
  onAddToResume,
  onRemoveBullet,
  onSaveBullet,
  sectionNames,
}) {
  const [rawInput, setRawInput] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBullets, setGeneratedBullets] = useState([]);
  const [savedIndices, setSavedIndices] = useState(new Set());
  const [collapsedSections, setCollapsedSections] = useState({});
  const [error, setError] = useState("");

  const sections = Object.keys(library);
  const allSections = [...new Set([...sections, ...sectionNames])].sort();

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleGenerate = async () => {
    if (!rawInput.trim() || !selectedSection) return;
    setIsGenerating(true);
    setGeneratedBullets([]);
    setSavedIndices(new Set());
    setError("");
    try {
      const existing = library[selectedSection] || [];
      const bullets = await generateBullets(rawInput, selectedSection, existing, 5);
      setGeneratedBullets(bullets);
    } catch (err) {
      console.error("Generation failed:", err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveBullet = (bullet, index) => {
    if (selectedSection) {
      onSaveBullet(selectedSection, bullet);
      setSavedIndices((prev) => new Set([...prev, index]));
    }
  };

  const handleSaveAll = () => {
    for (let i = 0; i < generatedBullets.length; i++) {
      if (!savedIndices.has(i)) {
        onSaveBullet(selectedSection, generatedBullets[i]);
      }
    }
    setSavedIndices(new Set(generatedBullets.map((_, i) => i)));
  };

  const handleClear = () => {
    setGeneratedBullets([]);
    setSavedIndices(new Set());
    setRawInput("");
    setError("");
  };

  return (
    <div className="bullet-library">
      <div className="panel-header">
        <h2>Bullet Library</h2>
        <span className="bullet-count">
          {Object.values(library).reduce((sum, arr) => sum + arr.length, 0)} bullets
        </span>
      </div>

      {/* Section cards */}
      <div className="library-sections">
        {sections.length === 0 ? (
          <div className="empty-library">
            <p>No bullets yet.</p>
            <p className="muted">Upload a DOCX resume to extract bullets, or generate new ones below.</p>
          </div>
        ) : (
          sections.map((section) => (
            <div key={section} className="section-card">
              <div
                className="section-header"
                onClick={() => toggleSection(section)}
              >
                <div className="section-title-row">
                  <svg
                    className={`chevron ${collapsedSections[section] ? "" : "open"}`}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                  <h3>{section}</h3>
                </div>
                <span className="section-count">{library[section].length}</span>
              </div>

              {!collapsedSections[section] && (
                <ul className="bullet-list">
                  {library[section].map((bullet, idx) => (
                    <li key={idx} className="bullet-item">
                      <span className="bullet-text">{bullet}</span>
                      <div className="bullet-actions">
                        <button
                          className="btn-icon btn-add"
                          onClick={() => onAddToResume(section, bullet)}
                          title="Add to resume"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </button>
                        <button
                          className="btn-icon btn-remove"
                          onClick={() => onRemoveBullet(section, bullet)}
                          title="Remove from library"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>

      {/* AI Generator */}
      <div className="ai-generator">
        <div className="generator-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3>AI Bullet Generator</h3>
          <span className="generator-badge">5 variations</span>
        </div>

        <div className="generator-form">
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="section-select"
          >
            <option value="">Select section...</option>
            {allSections.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="__custom">+ Custom section</option>
          </select>

          <textarea
            className="raw-input"
            placeholder="Type a rough bullet point... e.g. 'managed property in lisbon, found contractors, collected rent'"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            rows={3}
          />

          <button
            className="btn btn-generate"
            onClick={handleGenerate}
            disabled={isGenerating || !rawInput.trim() || !selectedSection}
          >
            {isGenerating ? (
              <>
                <span className="spinner" />
                Generating 5 variations...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate 5 Bullets
              </>
            )}
          </button>

          {error && (
            <div className="preview preview-error">
              <p className="preview-label">Error</p>
              <p className="preview-text">{error}</p>
            </div>
          )}

          {generatedBullets.length > 0 && (
            <div className="generated-results">
              <div className="generated-header">
                <span className="preview-label">
                  {generatedBullets.length} variations generated
                </span>
                <div className="generated-header-actions">
                  <button className="btn btn-save" onClick={handleSaveAll}>
                    Save All
                  </button>
                  <button className="btn btn-discard" onClick={handleClear}>
                    Clear
                  </button>
                </div>
              </div>
              <ul className="generated-list">
                {generatedBullets.map((bullet, idx) => {
                  const isSaved = savedIndices.has(idx);
                  return (
                    <li key={idx} className={`generated-item ${isSaved ? "saved" : ""}`}>
                      <span className="generated-number">{idx + 1}</span>
                      <span className="generated-text">{bullet}</span>
                      <div className="generated-actions">
                        {isSaved ? (
                          <span className="generated-saved-badge">Saved</span>
                        ) : (
                          <>
                            <button
                              className="btn-icon btn-add"
                              onClick={() => handleSaveBullet(bullet, idx)}
                              title="Save to library"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                              </svg>
                            </button>
                            <button
                              className="btn-icon btn-add"
                              onClick={() => { handleSaveBullet(bullet, idx); onAddToResume(selectedSection, bullet); }}
                              title="Save & add to resume"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
