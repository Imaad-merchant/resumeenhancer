import { useRef, useCallback } from "react";
import { exportToDocx } from "../utils/exportResume";

export default function ResumePanel({ html, onHtmlChange, onFileUpload }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onHtmlChange(editorRef.current.innerHTML);
    }
  }, [onHtmlChange]);

  const handleExport = useCallback(() => {
    if (editorRef.current) {
      exportToDocx(editorRef.current.innerHTML, "resume-enhanced.docx");
    }
  }, []);

  const handleFileDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer?.files[0];
      if (
        file &&
        file.name.endsWith(".docx")
      ) {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div className="resume-panel">
      <div className="panel-header">
        <h2>Resume</h2>
        <div className="header-actions">
          <button
            className="btn btn-upload"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            Upload DOCX
          </button>
          {html && (
            <button className="btn btn-export" onClick={handleExport}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export DOCX
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileUpload(file);
          }}
        />
      </div>

      <div className="editor-wrapper">
        {html ? (
          <div
            ref={editorRef}
            className="resume-editor"
            contentEditable
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: html }}
            onInput={handleInput}
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
          />
        ) : (
          <div
            className="upload-zone"
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="12" y2="12" />
                <line x1="15" y1="15" x2="12" y2="12" />
              </svg>
            </div>
            <p className="upload-title">Drop your resume here</p>
            <p className="upload-subtitle">or click to upload a .docx file</p>
          </div>
        )}
      </div>
    </div>
  );
}
