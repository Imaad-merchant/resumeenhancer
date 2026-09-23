import { getClient, jsonHandler, HttpError } from "./_lib/openai.js";

const MAX_IMAGES = 3;
const MAX_CHARS = 3_000_000; // ~2.2 MB per image as a base64 data URL

// Transcribes resume images (photos, screenshots, scanned PDF pages) into plain text.
export default jsonHandler(async ({ images }) => {
  if (!Array.isArray(images) || !images.length) throw new HttpError(400, "images is required");
  if (images.length > MAX_IMAGES) throw new HttpError(413, `Send at most ${MAX_IMAGES} pages`);
  for (const img of images) {
    if (typeof img !== "string" || !/^data:image\/(png|jpe?g|webp|gif);base64,/.test(img)) throw new HttpError(400, "images must be PNG/JPEG/WebP data URLs");
    if (img.length > MAX_CHARS) throw new HttpError(413, "Image too large");
  }

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Transcribe this resume exactly, word for word. Output plain text only:
- First line: the person's name
- Each section heading on its own line in ALL CAPS (e.g. EDUCATION, EXPERIENCE)
- Each bullet point on its own line starting with "• "
- Other lines (job titles, dates, contact info) as-is, one per line
Do not summarize, fix, or add anything.`,
          },
          ...images.map((url) => ({ type: "image_url", image_url: { url, detail: "high" } })),
        ],
      },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) throw new HttpError(502, "Couldn't read any text from the image");
  return { text: text.replace(/^```[a-z]*\n?|```$/g, "").trim() };
});
