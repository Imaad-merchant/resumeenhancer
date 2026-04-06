import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";

/**
 * Convert the edited HTML resume back to a DOCX and trigger download.
 */
export async function exportToDocx(html, filename = "resume.docx") {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const paragraphs = [];

  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return;
    }

    const tag = node.tagName?.toLowerCase();

    if (tag === "h1") {
      paragraphs.push(
        new Paragraph({
          children: parseInlineContent(node),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (tag === "h2") {
      paragraphs.push(
        new Paragraph({
          children: parseInlineContent(node),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (tag === "h3") {
      paragraphs.push(
        new Paragraph({
          children: parseInlineContent(node),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
        })
      );
    } else if (tag === "ul" || tag === "ol") {
      const items = node.querySelectorAll(":scope > li");
      items.forEach((li) => {
        paragraphs.push(
          new Paragraph({
            children: parseInlineContent(li),
            bullet: { level: 0 },
            spacing: { before: 40, after: 40 },
          })
        );
      });
    } else if (tag === "p") {
      const runs = parseInlineContent(node);
      if (runs.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: runs,
            spacing: { before: 60, after: 60 },
          })
        );
      }
    } else if (tag === "li") {
      // Standalone li outside of ul/ol
      paragraphs.push(
        new Paragraph({
          children: parseInlineContent(node),
          bullet: { level: 0 },
          spacing: { before: 40, after: 40 },
        })
      );
    } else if (tag === "div" || tag === "section" || tag === "article") {
      Array.from(node.children).forEach(processNode);
    } else if (tag === "br") {
      paragraphs.push(new Paragraph({ children: [] }));
    } else {
      // Fallback: treat as paragraph
      const text = node.textContent?.trim();
      if (text) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text })],
            spacing: { before: 60, after: 60 },
          })
        );
      }
    }
  }

  function parseInlineContent(element) {
    const runs = [];

    function walk(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (text) {
          runs.push(new TextRun({ text }));
        }
        return;
      }

      const tag = node.tagName?.toLowerCase();
      if (tag === "strong" || tag === "b") {
        runs.push(new TextRun({ text: node.textContent || "", bold: true }));
      } else if (tag === "em" || tag === "i") {
        runs.push(new TextRun({ text: node.textContent || "", italics: true }));
      } else if (tag === "u") {
        runs.push(
          new TextRun({ text: node.textContent || "", underline: { type: "single" } })
        );
      } else if (tag === "br") {
        runs.push(new TextRun({ text: "", break: 1 }));
      } else {
        Array.from(node.childNodes).forEach(walk);
      }
    }

    Array.from(element.childNodes).forEach(walk);
    return runs;
  }

  // Process all top-level elements
  Array.from(doc.body.children).forEach(processNode);

  // If no paragraphs found, add a fallback
  if (paragraphs.length === 0) {
    const text = doc.body.textContent || "";
    text.split("\n").forEach((line) => {
      if (line.trim()) {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: line.trim() })] }));
      }
    });
  }

  const docxDoc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(docxDoc);
  saveAs(blob, filename);
}
