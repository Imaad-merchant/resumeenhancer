import { docxToHtml } from "./parseResume";
import { postJSON } from "./api";

// Everything the upload control accepts
export const RESUME_ACCEPT =
  ".pdf,.docx,.doc,.odt,.rtf,.txt,.md,.markdown,.html,.htm,.pages,.png,.jpg,.jpeg,.webp,.gif,.heic,.heif," +
  "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document," +
  "application/vnd.oasis.opendocument.text,application/rtf,text/plain,text/markdown,text/html,image/*";

export const RESUME_FORMATS_LABEL = "PDF, Word (.docx/.doc), Pages, ODT, RTF, TXT, HTML or a photo";

const SECTION_WORDS =
  /^(summary|profile|objective|education|experience|work experience|professional experience|relevant experience|employment|leadership|leadership experience|activities|involvement|campus involvement|projects|skills|technical skills|skills & interests|skills and interests|certifications|certificates|honors|honors & awards|awards|publications|volunteer|volunteering|community service|interests|languages|coursework|relevant coursework|additional information|additional)\b:?$/i;
const BULLET_RE = /^[\s]*([•●○◦▪▫■□►▶➢➤✓✔\-–—*·•●▪])\s*/;

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function extOf(file) {
  const m = /\.([a-z0-9]+)$/i.exec(file.name || "");
  return m ? m[1].toLowerCase() : "";
}

function isHeading(line) {
  const t = line.trim();
  if (!t || t.length > 60) return false;
  if (SECTION_WORDS.test(t)) return true;
  // ALL CAPS short line with letters (e.g. "WORK EXPERIENCE")
  return /[A-Z]/.test(t) && t === t.toUpperCase() && /^[A-Z0-9 &/,'().-]+$/.test(t) && t.split(/\s+/).length <= 5;
}

/**
 * Turns plain resume text into the heading/list HTML the editor and bullet
 * extractor expect: first line → name (h1), section lines → h2, bullets → ul/li.
 */
export function textToHtml(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/\s+$/, ""));
  const out = [];
  let list = [];
  let sawName = false;
  const flush = () => {
    if (list.length) out.push(`<ul>${list.map((li) => `<li>${esc(li)}</li>`).join("")}</ul>`);
    list = [];
  };

  for (let k = 0; k < lines.length; k++) {
    const raw = lines[k];
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (!sawName) {
      out.push(`<h1>${esc(line)}</h1>`);
      sawName = true;
      continue;
    }
    if (BULLET_RE.test(raw)) {
      list.push(line.replace(BULLET_RE, "").trim());
      continue;
    }
    // Wrapped continuation of the previous bullet (starts lowercase / indented)
    if (list.length && (/^[a-z(]/.test(line) || /^\s{2,}/.test(raw))) {
      list[list.length - 1] += " " + line;
      continue;
    }
    flush();
    if (isHeading(line)) out.push(`<h2>${esc(line.replace(/:$/, ""))}</h2>`);
    else out.push(`<p>${esc(line)}</p>`);
  }
  flush();
  return out.join("\n");
}

// ---------- PDF ----------
async function loadPdfjs() {
  // Legacy build: works in older Safari/Chrome that lack the newest JS features
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const { default: workerUrl } = await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
}

async function pdfToText(data) {
  const pdfjs = await loadPdfjs();
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pageTexts = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const { items } = await page.getTextContent();
    // Group text runs into lines by baseline, then sort left→right
    const rows = [];
    for (const it of items) {
      if (!it.str) continue;
      const y = it.transform[5];
      const x = it.transform[4];
      let row = rows.find((r) => Math.abs(r.y - y) < Math.max(2, (it.height || 10) * 0.4));
      if (!row) rows.push((row = { y, parts: [] }));
      row.parts.push({ x, str: it.str, w: it.width || 0 });
    }
    rows.sort((a, b) => b.y - a.y);
    rows.forEach((r) => r.parts.sort((a, b) => a.x - b.x));
    const rowX = (r) => (r.parts.find((pt) => pt.str.trim()) || r.parts[0]).x;
    const minX = Math.min(...rows.map(rowX));
    let inSection = false;
    const lines = rows.map((r) => {
      let s = "";
      let end = null;
      for (const part of r.parts) {
        if (end !== null && part.x - end > 3 && !s.endsWith(" ") && !part.str.startsWith(" ")) s += " ";
        s += part.str;
        end = part.x + part.w;
      }
      // Some PDF writers draw bullet markers as shapes, not text: treat indented
      // body lines under a section heading as bullets.
      const t = s.trim();
      if (isHeading(t)) inSection = true;
      else if (inSection && !BULLET_RE.test(t) && rowX(r) >= minX + 12 && t.length > 25) s = "• " + t;
      return s;
    });
    // Blank line between big vertical gaps keeps sections apart
    const withGaps = [];
    rows.forEach((r, k) => {
      if (k && rows[k - 1].y - r.y > 22) withGaps.push("");
      withGaps.push(lines[k]);
    });
    pageTexts.push(withGaps.join("\n"));
  }
  return { text: pageTexts.join("\n\n"), pdf };
}

async function renderPdfPages(pdf, maxPages = 2) {
  const images = [];
  for (let p = 1; p <= Math.min(pdf.numPages, maxPages); p++) {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    images.push(canvas.toDataURL("image/jpeg", 0.8));
  }
  return images;
}

// ---------- Images (and scanned PDFs) → AI transcription ----------
async function imageFileToDataUrl(file, maxDim = 1800) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("This image format can't be read by your browser — try a PNG or JPG"));
      i.src = url;
    });
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function transcribeImages(images) {
  const { text } = await postJSON("/api/transcribe-resume", { images });
  return text;
}

// ---------- Legacy / other formats ----------
function rtfToText(rtf) {
  return rtf
    .replace(/\\par[d]?/g, "\n")
    .replace(/\\line/g, "\n")
    .replace(/\\tab/g, " ")
    .replace(/\\bullet ?/g, "• ")
    .replace(/\\emdash ?/g, "—")
    .replace(/\\endash ?/g, "–")
    .replace(/\\'([0-9a-f]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\u(-?\d+)\??/g, (_, n) => String.fromCharCode(n < 0 ? 65536 + Number(n) : Number(n)))
    .replace(/\{\\\*[^{}]*\}/g, "")
    .replace(/\\(fonttbl|colortbl|stylesheet|info)[^{}]*(\{[^{}]*\}[^{}]*)*/g, "")
    .replace(/\\[a-z]+-?\d* ?/gi, "")
    .replace(/[{}]/g, "")
    .replace(/\n{3,}/g, "\n\n");
}

// Old binary .doc: pull readable UTF-16LE text runs out of the file
function docBinaryToText(buf) {
  const bytes = new Uint8Array(buf);
  let out = "";
  let run = "";
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    const code = bytes[i] | (bytes[i + 1] << 8);
    const ok = code === 13 || code === 10 || code === 9 || code === 7 || (code >= 32 && code < 0xd800 && code !== 0xfffd);
    if (ok) run += code === 13 || code === 7 ? "\n" : String.fromCharCode(code);
    else {
      if (run.replace(/\s/g, "").length > 20) out += run + "\n";
      run = "";
    }
  }
  if (run.replace(/\s/g, "").length > 20) out += run;
  return out.replace(/\n{3,}/g, "\n\n").trim();
}

async function odtToHtml(buf) {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buf);
  const xml = await zip.file("content.xml")?.async("string");
  if (!xml) throw new Error("This .odt file has no readable content");
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const lines = [];
  const walk = (node) => {
    for (const el of node.children) {
      const name = el.localName;
      if (name === "h") lines.push(el.textContent.toUpperCase());
      else if (name === "list-item") lines.push("• " + el.textContent);
      else if (name === "p") lines.push(el.textContent);
      else walk(el);
    }
  };
  walk(doc.documentElement);
  return textToHtml(lines.join("\n"));
}

async function pagesToHtml(file, buf) {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buf);
  const pdfEntry = zip.file(/preview\.pdf$/i)[0] || zip.file(/QuickLook\/Preview\.pdf$/i)[0];
  if (pdfEntry) return pdfToHtml(await pdfEntry.async("uint8array"));
  const img = zip.file(/preview(-web)?\.jpe?g$/i)[0] || zip.file(/QuickLook\/Thumbnail\.jpg$/i)[0];
  if (img) {
    const blob = new Blob([await img.async("uint8array")], { type: "image/jpeg" });
    const text = await transcribeImages([await imageFileToDataUrl(blob)]);
    return textToHtml(text);
  }
  throw new Error(`Couldn't read "${file.name}". In Pages, use File → Export To → Word or PDF and upload that.`);
}

async function pdfToHtml(data) {
  const { text, pdf } = await pdfToText(data);
  if (text.replace(/\s/g, "").length >= 80) return textToHtml(text);
  // No text layer (scanned/photographed PDF) → transcribe the page images
  return textToHtml(await transcribeImages(await renderPdfPages(pdf)));
}

function sanitizeHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script,style,iframe,object,embed,link,meta").forEach((n) => n.remove());
  doc.querySelectorAll("*").forEach((el) => {
    for (const a of [...el.attributes]) if (/^on/i.test(a.name) || a.name === "style") el.removeAttribute(a.name);
  });
  return doc.body.innerHTML;
}

/**
 * Converts any supported resume file into editor HTML.
 */
export async function fileToHtml(file) {
  const ext = extOf(file);
  const type = file.type || "";

  if (ext === "docx" || type.includes("wordprocessingml")) return docxToHtml(file);
  if (ext === "pdf" || type === "application/pdf") return pdfToHtml(new Uint8Array(await file.arrayBuffer()));
  if (ext === "doc" || type === "application/msword") {
    const buf = await file.arrayBuffer();
    // Some ".doc" files are really .docx or RTF renamed
    const head = new Uint8Array(buf.slice(0, 5));
    if (head[0] === 0x50 && head[1] === 0x4b) return docxToHtml(file);
    const start = new TextDecoder().decode(head);
    if (start.startsWith("{\\rtf")) return textToHtml(rtfToText(new TextDecoder().decode(buf)));
    const text = docBinaryToText(buf);
    if (text.length < 80) throw new Error("Couldn't read this old .doc file. Open it in Word and Save As .docx or PDF.");
    return textToHtml(text);
  }
  if (ext === "odt" || type.includes("opendocument.text")) return odtToHtml(await file.arrayBuffer());
  if (ext === "rtf" || type.includes("rtf")) return textToHtml(rtfToText(await file.text()));
  if (ext === "pages") return pagesToHtml(file, await file.arrayBuffer());
  if (ext === "html" || ext === "htm" || type === "text/html") return sanitizeHtml(await file.text());
  if (type.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif", "heic", "heif"].includes(ext)) {
    return textToHtml(await transcribeImages([await imageFileToDataUrl(file)]));
  }
  if (["txt", "md", "markdown"].includes(ext) || type.startsWith("text/")) {
    return textToHtml((await file.text()).replace(/^#+\s*/gm, "").replace(/\*\*/g, ""));
  }
  throw new Error(`"${file.name}" isn't a supported resume format. Use ${RESUME_FORMATS_LABEL}.`);
}
