// The user's internship search focus (account management first, explored broadly across career lanes) — drives the tracker "My Focus" panel,
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

// Primary lane: B2B relationship management (keep existing corporate clients/partners happy and growing),
// not cold-call sales. Supplier relationship management is the buy-side version of the same skill set.
// Career lanes worth exploring (from the Oct 2026 career-fair debrief)
export const CAREER_LANES = [
  { lane: "Relationship / people", roles: ["Strategic Partnerships", "Business Development", "Account Management", "Client Strategy"] },
  { lane: "Risk / problem solving", roles: ["Enterprise Risk", "Operational Risk", "Business Continuity", "Third-Party Risk", "Supply Chain Risk"] },
  { lane: "Negotiation / vendors", roles: ["Strategic Sourcing", "Procurement", "Supplier Relationship Mgmt", "Vendor Management", "Global Sourcing"] },
  { lane: "Big-picture business", roles: ["Corporate Strategy", "Commercial Strategy", "Corporate Development", "Management Consulting"] },
  { lane: "Legal / international", roles: ["Trade Compliance", "Contracts", "Regulatory Compliance", "Customs / Tariffs"] },
  { lane: "Fintech", roles: ["Payments Strategy", "Product Management", "Strategic Partnerships", "Implementation", "Solutions Consulting"] },
  { lane: "Insurance brokerage", roles: ["Client Management", "Client Service", "Brokerage", "Producer track → Client Executive"] },
];

export const TARGET_ROLES = [
  "Strategic / Key Account Manager",
  "Partner Account Manager",
  "Client Relationship / Client Services",
  "Strategic Partnerships",
  "Supplier Relationship Manager",
  "Business Development / Commercial Strategy",
  "Insurance Client Management (→ Client Executive / Producer)",
];

export const TARGET_INDUSTRIES = ["Payments / Fintech", "Beauty", "Travel / Airlines", "Insurance / Risk", "Consulting"];

export const INTERN_FUNCTIONS = ["Account Management", "Client Services", "Partnerships", "Customer Development", "Vendor Management", "Supply Chain", "Strategy"];

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
  {"family": "Strategic / Key Account Management", "priority": "Core", "search": "Account Management Intern", "also": ["Key Account Intern", "Strategic Accounts Intern", "National Account Intern"]},
  {"family": "Partner / Client Relationship", "priority": "Core", "search": "Partner Account Management Intern", "also": ["Client Services Intern", "Client Relationship Intern", "Relationship Management Intern"]},
  {"family": "Partnerships", "priority": "Core", "search": "Partnerships Intern", "also": ["Strategic Partnerships Intern", "Retail Partnerships Intern", "Alliances Intern"]},
  {"family": "Customer Development (CPG / Beauty)", "priority": "Core", "search": "Customer Development Intern", "also": ["Customer Business Development Intern", "Sales & Customer Management Intern", "Category Management Intern"]},
  {"family": "Insurance Client Service", "priority": "Core", "search": "Risk Solutions Intern", "also": ["Client Service Intern insurance", "Account Management Intern insurance", "Client Advisor Intern"]},
  {"family": "Business Development", "priority": "Core", "search": "Business Development Intern", "also": ["Growth Strategy Intern", "Partnerships Analyst Intern"]},
  {"family": "Insurance Brokerage", "priority": "Core", "search": "Brokerage Intern", "also": ["Client Management Intern", "Commercial Risk Intern", "Producer Intern"]},
  {"family": "Business Continuity / Resilience", "priority": "Recommended", "search": "Business Continuity Intern", "also": ["Resilience Intern", "Crisis Management Intern", "Operational Resilience Intern"]},
  {"family": "Commercial Strategy", "priority": "Recommended", "search": "Commercial Strategy Intern", "also": ["Revenue Strategy Intern", "Pricing Strategy Intern"]},
  {"family": "Risk Consulting", "priority": "Recommended", "search": "Risk Consulting Intern", "also": ["Risk Advisory Intern", "Controls Consulting Intern"]},
  {"family": "Solutions / Implementation", "priority": "Recommended", "search": "Implementation Consultant Intern", "also": ["Solutions Consultant Intern", "Pre-Sales Intern"]},
  {"family": "Corporate Development", "priority": "Recommended", "search": "Corporate Development Intern", "also": ["M&A Intern", "Strategic Investments Intern"]},
  {"family": "Customer Success (Enterprise)", "priority": "Recommended", "search": "Customer Success Intern", "also": ["Partner Manager Intern", "Client Success Intern"]},
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
  `${CLASS_YEAR}. Primary lane: B2B account / relationship management (corporate clients, partners and suppliers: business reviews, negotiation, cross-functional coordination); also exploring partnerships, business development, insurance client management, business continuity / third-party risk, sourcing and strategy. Not cold-call sales. ` +
  `Target internships: ${INTERN_FUNCTIONS.join(", ")}. ` +
  `Target roles: ${TARGET_ROLES.join(", ")}. ` +
  `Focus areas: ${FOCUS_AREAS.map((f) => f.name).join(", ")} ` +
  `(e.g. client/partner relationships, vendor management, contracts, pricing, vendor risk). ` +
  `Target industries: ${TARGET_INDUSTRIES.join(", ")}.`;
