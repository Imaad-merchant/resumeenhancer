// The user's internship search focus — drives the tracker "My Focus" panel,
// calendar coffee-chat/research tasks, and AI bullet generation context.

export const FOCUS_AREAS = [
  { name: "Supply Chain", topics: ["Strategic sourcing", "Procurement / purchasing", "Vendor management", "Operations management", "Consulting"] },
  { name: "Risk Management", topics: ["Vendor risk", "Supply chain risk", "Operational risk", "Insurance", "Risk compliance", "Business continuity"] },
  { name: "International Business", topics: ["Global sourcing", "Import / export", "Trade compliance"] },
  { name: "Legal Studies", topics: ["Contracts", "Compliance", "Commercial negotiation"] },
  { name: "Fintech", topics: ["Payments", "Financial operations", "Vendor management", "Third-party risk", "Strategy"] },
  { name: "Tax", topics: ["Pricing", "Compliance", "Tariffs / duties", "Sales & use tax", "Vendor documentation"] },
];

// Junior in 2026-27 → Summer 2027 is the rising-senior internship (most roles want Dec 2027–Aug 2028 grads)
export const CLASS_YEAR = "Junior, Class of 2028";

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

// What to type into Handshake / careers pages (from the Role Search Bank sheet)
export const ROLE_SEARCH_BANK = [
  {"family": "Strategic Sourcing", "priority": "Core", "search": "Strategic Sourcing Intern", "also": ["Sourcing Analyst Intern", "Global Sourcing Intern"]},
  {"family": "Procurement / Purchasing", "priority": "Core", "search": "Procurement Intern", "also": ["Purchasing Intern", "Buyer Intern", "Procurement Analyst Intern"]},
  {"family": "Vendor / Supplier Management", "priority": "Core", "search": "Vendor Management Intern", "also": ["Supplier Management Intern", "Supplier Relations Intern"]},
  {"family": "Operations", "priority": "Core", "search": "Operations Intern", "also": ["Business Operations Intern", "Operations Analyst Intern"]},
  {"family": "Supply Chain", "priority": "Core", "search": "Supply Chain Intern", "also": ["Supply Chain Analyst Intern", "Supply Planning Intern"]},
  {"family": "Logistics", "priority": "Core", "search": "Logistics Intern", "also": ["Transportation Intern", "Freight Intern", "Cargo Operations Intern"]},
  {"family": "Distribution", "priority": "Core", "search": "Distribution Intern", "also": ["Warehouse Operations Intern", "Fulfillment Intern"]},
  {"family": "Strategy", "priority": "Core", "search": "Strategy Intern", "also": ["Corporate Strategy Intern", "Business Strategy Intern"]},
  {"family": "Third-Party / Vendor Risk", "priority": "Recommended", "search": "Third-Party Risk Intern", "also": ["Vendor Risk Intern", "Supplier Risk Intern"]},
  {"family": "Risk Advisory / Operational Risk", "priority": "Recommended", "search": "Risk Advisory Intern", "also": ["Operational Risk Intern", "Enterprise Risk Intern"]},
  {"family": "Trade Compliance / Import-Export", "priority": "Recommended", "search": "Trade Compliance Intern", "also": ["Import Export Intern", "Customs Intern", "Global Trade Intern"]},
  {"family": "Contracts / Commercial", "priority": "Recommended", "search": "Contracts Intern", "also": ["Contract Analyst Intern", "Commercial Intern", "Subcontracts Intern"]},
  {"family": "Supply Chain / Operations Consulting", "priority": "Recommended", "search": "Supply Chain Consulting Intern", "also": ["Operations Consulting Intern", "Procurement Consulting Intern"]},
  {"family": "Payments / FinTech Operations", "priority": "Recommended", "search": "Payments Operations Intern", "also": ["FinTech Operations Intern", "Business Operations Intern"]},
  {"family": "Indirect Tax / Business Tax Exposure", "priority": "Support Skill", "search": "Indirect Tax Intern", "also": ["Sales & Use Tax Intern", "Tax Technology Intern"]},
];

// One-paragraph summary fed to the AI bullet generator.
export const PROFILE_SUMMARY =
  `${CLASS_YEAR}. Target internships: ${INTERN_FUNCTIONS.join(", ")}. ` +
  `Target roles: ${TARGET_ROLES.join(", ")}. ` +
  `Focus areas: ${FOCUS_AREAS.map((f) => f.name).join(", ")} ` +
  `(e.g. strategic sourcing, vendor risk, trade compliance, contracts, tariffs). ` +
  `Target industries: ${TARGET_INDUSTRIES.join(", ")}.`;
