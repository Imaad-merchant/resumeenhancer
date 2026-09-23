import { getClient, jsonHandler, requireString, HttpError } from "./_lib/openai.js";
import { PROFILE_SUMMARY } from "../src/utils/careerProfile.js";
import { INTERNSHIPS } from "../src/utils/internshipData.js";

const PROFILE = `Supply chain management major at UGA Terry College of Business.
Certificate in legal studies and financial technology. Junior (Class of 2028, rising senior in Summer 2027), first-gen, from Texas.
${PROFILE_SUMMARY}`;

export default jsonHandler(async ({ text }) => {
  requireString(text, "text", 30000);
  const companies = [...new Set(INTERNSHIPS.map((i) => i.company))];
  const year = new Date().getFullYear();

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are a career advisor analyzing a university newsletter for a student.

STUDENT PROFILE:
${PROFILE}

COMPANIES ALREADY IN THEIR INTERNSHIP TRACKER:
${companies.join(", ")}

NEWSLETTER/EMAIL CONTENT:
"""
${text}
"""

Extract ALL events from this newsletter. For each event, return a JSON array with objects containing:
- "title": event name
- "date": date in YYYY-MM-DD format (assume current year ${year} if not specified)
- "time": time range as string
- "location": venue/room
- "company": company name if a specific company is featured (null if general event)
- "category": one of "Terry Event", "Career Fair", "Info Session", "Workshop", "Networking", "Club Meeting"
- "relevance": "high", "medium", or "low" based on how relevant this is to the student's profile
- "why": 1 sentence explaining why this is or isn't relevant
- "hasInternship": true if the company is in their internship tracker, false otherwise
- "suggestAdd": true if this company has supply chain, operations, vendor management, logistics, or strategy internships that AREN'T in the tracker yet, false otherwise
- "suggestedRole": if suggestAdd is true, suggest a specific role title to research

Return ONLY the JSON array, no other text.`,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content?.trim() || "";
  const json = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    const events = JSON.parse(json);
    if (!Array.isArray(events)) throw new Error();
    return { events };
  } catch {
    throw new HttpError(502, "AI returned an unreadable response — try again");
  }
});
