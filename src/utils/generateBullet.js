import OpenAI from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Generate multiple polished resume bullets from raw input.
 */
export async function generateBullets(rawInput, sectionName, existingBullets = [], count = 5) {
  const examples = existingBullets.slice(0, 3);
  const examplesText =
    examples.length > 0
      ? `Here are ${examples.length} existing bullets from the "${sectionName}" section for style reference:\n${examples.map((b, i) => `${i + 1}. ${b}`).join("\n")}`
      : `This is for the "${sectionName}" section. No existing bullets for reference.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `You are a resume writing expert. Generate ${count} different polished resume bullet variations from the rough input below.

Rules:
- Each bullet starts with a DIFFERENT strong action verb
- Quantify impact where possible (numbers, percentages, dollar amounts)
- Match the tone, length, and style of the example bullets below
- Vary the angle: some focus on leadership, some on results, some on process
- Return ONLY the bullets, one per line, numbered 1-${count}
- No bullet character prefix on each line, just the number and text

${examplesText}

Raw input to polish:
"${rawInput}"

${count} bullet variations:`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("No response from AI");

  // Parse numbered lines
  const bullets = text
    .split("\n")
    .map((line) => line.replace(/^\d+[\.\)]\s*/, "").replace(/^[-•*]\s*/, "").trim())
    .filter((line) => line.length > 10);

  return bullets.slice(0, count);
}
