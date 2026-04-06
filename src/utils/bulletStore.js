const STORAGE_KEY = "resume-enhancer-bullet-library";

export function loadLibrary() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveLibrary(library) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
}

export function addBulletToSection(library, section, bullet) {
  const updated = { ...library };
  if (!updated[section]) {
    updated[section] = [];
  }
  // No duplicates
  if (!updated[section].includes(bullet)) {
    updated[section].push(bullet);
  }
  saveLibrary(updated);
  return updated;
}

export function removeBulletFromSection(library, section, bullet) {
  const updated = { ...library };
  if (updated[section]) {
    updated[section] = updated[section].filter((b) => b !== bullet);
    if (updated[section].length === 0) {
      delete updated[section];
    }
  }
  saveLibrary(updated);
  return updated;
}

export function mergeIntoLibrary(existing, incoming) {
  const merged = { ...existing };
  for (const [section, bullets] of Object.entries(incoming)) {
    if (!merged[section]) {
      merged[section] = [];
    }
    for (const bullet of bullets) {
      if (!merged[section].includes(bullet)) {
        merged[section].push(bullet);
      }
    }
  }
  saveLibrary(merged);
  return merged;
}
