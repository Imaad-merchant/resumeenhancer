import { getClient, jsonHandler, requireString, HttpError } from "./_lib/openai.js";
import { PROFILE_SUMMARY } from "../src/utils/careerProfile.js";

export default jsonHandler(async ({ rawInput, sectionName, existingBullets = [], count = 5 }) => {
  requireString(rawInput, "rawInput", 2000);
  requireString(sectionName, "sectionName", 200);
  if (!Array.isArray(existingBullets)) throw new HttpError(400, "existingBullets must be an array");
  const n = Math.min(Math.max(parseInt(count, 10) || 5, 1), 8);

  const examples = existingBullets.filter((b) => typeof b === "string").slice(0, 3).map((b) => b.slice(0, 500));
  const examplesText =
    examples.length > 0
      ? `Here are ${examples.length} existing bullets from the "${sectionName}" section for style reference:\n${examples.map((b, i) => `${i + 1}. ${b}`).join("\n")}`
      : `This is for the "${sectionName}" section. No existing bullets for reference.`;

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `You are a resume writing expert. Generate ${n} different polished resume bullet variations from the rough input below.

Rules:
- Each bullet starts with a DIFFERENT strong action verb
- Quantify impact where possible (numbers, percentages, dollar amounts)
- Match the tone, length, and style of the example bullets below
- Vary the angle: some focus on leadership, some on results, some on process
- Where it fits naturally, frame the work in language that resonates with the candidate's targets (sourcing, vendor management, risk, compliance, operations) — never invent experience
- Return ONLY the bullets, one per line, numbered 1-${n}
- No bullet character prefix on each line, just the number and text

Candidate's career targets: ${PROFILE_SUMMARY}

${examplesText}

Raw input to polish:
"${rawInput}"

${n} bullet variations:`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) throw new HttpError(502, "No response from AI");

  const bullets = text
    .split("\n")
    .map((line) => line.replace(/^\d+[\.\)]\s*/, "").replace(/^[-•*]\s*/, "").trim())
    .filter((line) => line.length > 10)
    .slice(0, n);

  return { bullets };
});
