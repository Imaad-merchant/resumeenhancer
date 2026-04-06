import mammoth from "mammoth";

/**
 * Convert DOCX file to HTML using mammoth, preserving formatting.
 */
export async function docxToHtml(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Title'] => h1.doc-title:fresh",
        "p[style-name='Subtitle'] => h2.doc-subtitle:fresh",
        "p[style-name='List Paragraph'] => li:fresh",
      ],
    }
  );
  return result.value;
}

/**
 * Extract bullet points grouped by section headings from the HTML.
 * Returns { "Section Name": ["bullet 1", "bullet 2", ...], ... }
 */
export function extractSections(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const sections = {};
  let currentSection = "General";

  const elements = doc.body.children;
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const tag = el.tagName.toLowerCase();

    // Detect section headings
    if (tag === "h1" || tag === "h2" || tag === "h3") {
      const text = el.textContent.trim();
      if (text) {
        currentSection = text;
        if (!sections[currentSection]) {
          sections[currentSection] = [];
        }
      }
      continue;
    }

    // Extract bullets from lists
    if (tag === "ul" || tag === "ol") {
      const items = el.querySelectorAll("li");
      items.forEach((li) => {
        const text = li.textContent.trim();
        if (text && text.length > 5) {
          if (!sections[currentSection]) {
            sections[currentSection] = [];
          }
          sections[currentSection].push(text);
        }
      });
      continue;
    }

    // Also grab paragraphs that look like bullets (start with - or * or action verbs)
    if (tag === "p") {
      const text = el.textContent.trim();
      if (
        text &&
        text.length > 10 &&
        (text.startsWith("-") ||
          text.startsWith("•") ||
          text.startsWith("*") ||
          /^(Led|Managed|Built|Developed|Created|Designed|Implemented|Increased|Reduced|Drove|Spearheaded|Negotiated|Automated|Coordinated|Established|Launched|Optimized|Delivered|Generated|Achieved|Oversaw|Directed|Executed|Streamlined|Facilitated|Pioneered)/i.test(
            text
          ))
      ) {
        if (!sections[currentSection]) {
          sections[currentSection] = [];
        }
        const cleaned = text.replace(/^[-•*]\s*/, "").trim();
        sections[currentSection].push(cleaned);
      }
    }
  }

  // Remove empty sections
  for (const key of Object.keys(sections)) {
    if (sections[key].length === 0) delete sections[key];
  }

  return sections;
}
