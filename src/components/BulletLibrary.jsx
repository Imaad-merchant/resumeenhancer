import { useState } from "react";
import { generateBullet } from "../utils/generateBullet";

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
  const [generatedPreview, setGeneratedPreview] = useState("");
  const [collapsedSections, setCollapsedSections] = useState({});

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
    setGeneratedPreview("");
    try {
      const existing = library[selectedSection] || [];
      const polished = await generateBullet(rawInput, selectedSection, existing);
      setGeneratedPreview(polished);
    } catch (err) {
      console.error("Generation failed:", err);
      setGeneratedPreview("ERROR: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGenerated = () => {
    if (generatedPreview && selectedSection && !generatedPreview.startsWith("ERROR")) {
      onSaveBullet(selectedSection, generatedPreview);
      setGeneratedPreview("");
      setRawInput("");
    }
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
                Generating...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate & Save
              </>
            )}
          </button>

          {generatedPreview && (
            <div className={`preview ${generatedPreview.startsWith("ERROR") ? "preview-error" : ""}`}>
              <p className="preview-label">
                {generatedPreview.startsWith("ERROR") ? "Error" : "Generated bullet:"}
              </p>
              <p className="preview-text">{generatedPreview.replace(/^ERROR:\s*/, "")}</p>
              {!generatedPreview.startsWith("ERROR") && (
                <div className="preview-actions">
                  <button className="btn btn-save" onClick={handleSaveGenerated}>
                    Save to Library
                  </button>
                  <button
                    className="btn btn-discard"
                    onClick={() => setGeneratedPreview("")}
                  >
                    Discard
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
