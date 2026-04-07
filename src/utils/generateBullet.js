import OpenAI from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
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

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
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

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("No response from AI");
  return text.replace(/^[-•*]\s*/, "").trim();
}
