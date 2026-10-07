// Terry / UGA events from the weekly newsletter (Oct 2026). ★ = matches your tracker or focus.
const E = (date, time, title, place, star = false) => ({
  key: `campus-${date}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`,
  date,
  title: `${star ? "★ " : ""}${title} | ${time} | ${place}`,
  category: "Campus Event",
  color: star ? "#0e7490" : "#06b6d4",
});

export const CAMPUS_EVENTS = [
  E("2026-10-07", "9:00–12:30", "Employer of the Day: Honeywell", "Amos Hall, Casey Commons", true),
  E("2026-10-07", "1:00–3:30", "Employer of the Day: Pulte Group", "Amos Hall, Casey Commons"),
  E("2026-10-07", "4:30–5:15", "Master of Marketing Research Info Session", "Correll 213 or Zoom"),
  E("2026-10-07", "7:15–8:00", "Women in Accounting: Class Fitness Event", "723 Baxter St"),
  E("2026-10-08", "9:00–12:30", "Employer of the Day: CSX (rail logistics)", "Amos Hall, Casey Commons", true),
  E("2026-10-08", "1:00–3:30", "Employer of the Day: Truist", "Amos Hall, Casey Commons", true),
  E("2026-10-08", "4:00–5:00", "IBP: Terry Study Away International Internships & Exchanges Info Session", "Benson Hall C109", true),
  E("2026-10-08", "5:30–7:30", "Info Session: Truist", "Orkin Hall D101", true),
  E("2026-10-12", "9:00–12:30", "Employer of the Day: Eli Lilly and Company", "Amos Hall, Casey Commons"),
  E("2026-10-13", "9:00–12:30", "Employer of the Day: USI Insurance Services (on your RMI list — use your brokerage pitch)", "Amos Hall, Casey Commons", true),
  E("2026-10-13", "5:00–6:00", "TAL Talks: Panel on AI in Internships (Ivester Institute)", "Correll 315"),
  E("2026-10-13", "5:30–6:30", "Info Session: Federated Insurance", "Orkin Hall D107", true),
  E("2026-10-13", "6:00–7:30", "Info Session: Meadows & Ohly", "Orkin Hall D107"),
  E("2026-10-14", "9:00–12:30", "Employer of the Day: The Virtus Solution", "Amos Hall, Casey Commons"),
  E("2026-10-14", "9:55–10:50", "Mason Public Leadership Lecture", "UGA Chapel"),
  E("2026-10-14", "5:30–6:30", "Info Session: Goldman Sachs Internal Audit", "Zoom"),
  E("2026-10-15", "9:00–12:30", "Employer of the Day: Bank of America", "Amos Hall, Casey Commons"),
];
