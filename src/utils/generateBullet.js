import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Generate a polished resume bullet from raw input, using existing bullets as style examples.
 */
export async function generateBullet(rawInput, sectionName, existingBullets = []) {
  const examples = existingBullets.slice(0, 3);
  const examplesText =
    examples.length > 0
      ? `Here are ${examples.length} existing bullets from the "${sectionName}" section for style reference:\n${examples.map((b, i) => `${i + 1}. ${b}`).join("\n")}`
      : `This is for the "${sectionName}" section. No existing bullets for reference.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `You are a resume writing expert. Polish the following rough bullet point into a professional resume bullet.

Rules:
- Start with a strong action verb
- Quantify impact where possible (numbers, percentages, dollar amounts)
- Match the tone, length, and style of the example bullets below
- Return ONLY the single polished bullet point, nothing else
- No bullet character prefix, just the text

${examplesText}

Raw input to polish:
"${rawInput}"

Polished bullet:`,
      },
    ],
  });

  const text = message.content[0]?.text?.trim();
  if (!text) throw new Error("No response from AI");
  // Strip any leading bullet characters
  return text.replace(/^[-•*]\s*/, "").trim();
}
