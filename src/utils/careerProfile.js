// The user's internship search focus — drives the tracker "My Focus" panel,
// calendar coffee-chat/research tasks, and AI bullet generation context.

export const FOCUS_AREAS = [
  { name: "Supply Chain", topics: ["Strategic sourcing", "Procurement / purchasing", "Vendor management", "Operations management", "Consulting"] },
  { name: "Risk Management", topics: ["Vendor risk", "Supply chain risk", "Operational risk", "Insurance", "Risk compliance", "Business continuity"] },
  { name: "International Business", topics: ["Global sourcing", "Import / export", "Trade compliance"] },
  { name: "Legal Studies", topics: ["Contracts", "Compliance"] },
  { name: "Fintech", topics: [] },
  { name: "Tax", topics: ["Pricing", "Compliance", "Tariffs"] },
];

export const TARGET_ROLES = ["Procurement / Vendor Specialist", "Production Scheduler"];

export const TARGET_INDUSTRIES = ["Makeup", "Airline — Cargo", "Credit Card", "Consulting"];

export const INTERN_FUNCTIONS = ["Operations", "Supply Chain", "Vendor Management", "Logistics", "Distribution", "Strategy"];

export const RESEARCH_CHANNELS = ["Company research / mailing lists", "LinkedIn research", "Forage"];

export const COFFEE_CHATS = [
  { name: "Thomas Edmunds", context: "RMIN" },
  { name: "Sharmin", context: "LinkedIn" },
  { name: "Robert Trotter", context: "" },
  { name: "Jill's dad", context: "" },
  { name: "RMIN speakers", context: "RMIN" },
  { name: "Last Mile, Academy Director, Patrick Weight", context: "Fintech" },
  { name: "Carys Hall", context: "" },
  { name: "IPN summit speakers + search", context: "IPN" },
  { name: "UGA Mentor Program", context: "Mentor match" },
  { name: "Sundhar + Jennifer", context: "Professors" },
];

// One-paragraph summary fed to the AI bullet generator.
export const PROFILE_SUMMARY =
  `Target internships: ${INTERN_FUNCTIONS.join(", ")}. ` +
  `Target roles: ${TARGET_ROLES.join(", ")}. ` +
  `Focus areas: ${FOCUS_AREAS.map((f) => f.name).join(", ")} ` +
  `(e.g. strategic sourcing, vendor risk, trade compliance, contracts, tariffs). ` +
  `Target industries: ${TARGET_INDUSTRIES.join(", ")}.`;
