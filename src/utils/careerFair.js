// Fall 2026 career fair: people met + follow-up tasks (synced onto the calendar like deadlines)
export const FAIR_CONTACTS = [
  { company: "IHG Hotels & Resorts", name: "Will Trotman", priority: "Major" },
  { company: "FedEx", name: "Bengali", priority: "Major" },
  { company: "AlphaSights", name: "Katherine Hollingshead", priority: "Major" },
  { company: "Siemens", name: "Griffin", priority: "Other", note: "Values learning + personality; consultative sales" },
  { company: "Penske Logistics", name: "Veronica", priority: "Other" },
  { company: "Enterprise Mobility", name: "Neci", priority: "Other" },
  { company: "PepsiCo", name: "Procurement recruiter", priority: "Other" },
  { company: "Georgia-Pacific", name: "Aly", priority: "Other", note: "Key accounts" },
];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// Major contacts: thank-you + LinkedIn within 48h; others the following Monday; apply nudge a week later
export const FAIR_EVENTS = FAIR_CONTACTS.flatMap((c) => {
  const first = c.priority === "Major" ? "2026-10-08" : "2026-10-12";
  return [
    {
      key: `fair-followup-${slug(c.company)}`,
      date: first,
      title: `Career fair follow-up: thank-you email + LinkedIn to ${c.name} (${c.company})${c.note ? ` — ${c.note}` : ""}`,
      category: "Career Fair",
      color: "#0891b2",
    },
    {
      key: `fair-apply-${slug(c.company)}`,
      date: c.priority === "Major" ? "2026-10-14" : "2026-10-19",
      title: `Apply / check postings at ${c.company} and mention ${c.name} from the career fair`,
      category: "Career Fair",
      color: "#0891b2",
    },
  ];
});

// What to say at RMI / brokerage booths
export const PITCHES = [
  {
    audience: "Insurance brokerage (RMI)",
    text: "I’m looking for your most client-facing Summer 2027 internship. I’m interested in commercial brokerage and client management, and long term I’d like to become a Client Executive or Producer.",
    keywords: ["Brokerage", "Client Management", "Account Management", "Client Service", "Sales", "Production", "Commercial Risk"],
  },
];
