import { useState, useCallback, useRef, useEffect } from "react";
import ResumePanel from "./components/ResumePanel";
import BulletLibrary from "./components/BulletLibrary";
import { docxToHtml, extractSections } from "./utils/parseResume";
import {
  loadLibrary,
  addBulletToSection,
  removeBulletFromSection,
  mergeIntoLibrary,
} from "./utils/bulletStore";
import "./App.css";

function App() {
  const [html, setHtml] = useState("");
  const [library, setLibrary] = useState(loadLibrary());
  const [sectionNames, setSectionNames] = useState([]);
  const [notification, setNotification] = useState(null);
  const notifTimeout = useRef(null);

  const showNotif = useCallback((msg, type = "success") => {
    clearTimeout(notifTimeout.current);
    setNotification({ msg, type });
    notifTimeout.current = setTimeout(() => setNotification(null), 2500);
  }, []);

  // Load library from localStorage on mount
  useEffect(() => {
    setLibrary(loadLibrary());
  }, []);

  const handleFileUpload = useCallback(
    async (file) => {
      try {
        const resumeHtml = await docxToHtml(file);
        setHtml(resumeHtml);

        // Extract sections and merge into library
        const sections = extractSections(resumeHtml);
        setSectionNames(Object.keys(sections));
        const merged = mergeIntoLibrary(library, sections);
        setLibrary(merged);

        showNotif(`Loaded "${file.name}" - extracted ${Object.values(sections).flat().length} bullets`);
      } catch (err) {
        console.error("Failed to parse DOCX:", err);
        showNotif("Failed to parse file. Make sure it's a .docx", "error");
      }
    },
    [library, showNotif]
  );

  const handleAddToResume = useCallback(
    (section, bullet) => {
      if (!html) {
        showNotif("Upload a resume first", "error");
        return;
      }

      // Find the section heading in the HTML and inject bullet after it
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Look for the heading matching the section
      const headings = doc.querySelectorAll("h1, h2, h3");
      let targetHeading = null;

      for (const h of headings) {
        if (h.textContent.trim().toLowerCase() === section.toLowerCase()) {
          targetHeading = h;
          break;
        }
      }

      if (targetHeading) {
        // Find the next UL or OL after the heading, or create one
        let sibling = targetHeading.nextElementSibling;
        let targetList = null;

        // Walk forward to find a list
        while (sibling) {
          const tag = sibling.tagName.toLowerCase();
          if (tag === "ul" || tag === "ol") {
            targetList = sibling;
            break;
          }
          if (tag === "h1" || tag === "h2" || tag === "h3") {
            break; // hit next section
          }
          sibling = sibling.nextElementSibling;
        }

        if (targetList) {
          const li = doc.createElement("li");
          li.textContent = bullet;
          li.style.backgroundColor = "#1a3a1a";
          li.style.transition = "background-color 2s";
          targetList.appendChild(li);
        } else {
          // Create a new UL right after the heading
          const ul = doc.createElement("ul");
          const li = doc.createElement("li");
          li.textContent = bullet;
          li.style.backgroundColor = "#1a3a1a";
          li.style.transition = "background-color 2s";
          ul.appendChild(li);
          targetHeading.after(ul);
        }

        setHtml(doc.body.innerHTML);
        showNotif(`Added bullet to "${section}"`);
      } else {
        // Section not found - append at the end
        const appendHtml = `<h2>${section}</h2><ul><li>${bullet}</li></ul>`;
        setHtml((prev) => prev + appendHtml);
        showNotif(`Added new section "${section}" with bullet`);
      }
    },
    [html, showNotif]
  );

  const handleRemoveBullet = useCallback(
    (section, bullet) => {
      const updated = removeBulletFromSection(library, section, bullet);
      setLibrary({ ...updated });
      showNotif("Removed from library");
    },
    [library, showNotif]
  );

  const handleSaveBullet = useCallback(
    (section, bullet) => {
      const updated = addBulletToSection(library, section, bullet);
      setLibrary({ ...updated });
      showNotif(`Saved to "${section}"`);
    },
    [library, showNotif]
  );

  return (
    <div className="app">
      {/* Notification toast */}
      {notification && (
        <div className={`toast toast-${notification.type}`}>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">R</div>
          <h1>Resume Enhancer</h1>
          <span className="badge">IPN Career Services</span>
        </div>
      </header>

      {/* Main two-panel layout */}
      <main className="panels">
        <ResumePanel
          html={html}
          onHtmlChange={setHtml}
          onFileUpload={handleFileUpload}
        />
        <BulletLibrary
          library={library}
          onAddToResume={handleAddToResume}
          onRemoveBullet={handleRemoveBullet}
          onSaveBullet={handleSaveBullet}
          sectionNames={sectionNames}
        />
      </main>
    </div>
  );
}

export default App;
