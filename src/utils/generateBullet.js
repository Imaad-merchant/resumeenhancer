import { postJSON } from "./api";

/**
 * Generate multiple polished resume bullets from raw input.
 */
export async function generateBullets(rawInput, sectionName, existingBullets = [], count = 5) {
  const { bullets } = await postJSON("/api/generate-bullets", { rawInput, sectionName, existingBullets, count });
  return bullets;
}
