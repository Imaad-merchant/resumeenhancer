// Pre-populated networking & career development tasks
// weekOfMonth: 1-4 determines which week the task appears on
// Categories map to the user's specific UGA/Terry resources

export const CATEGORIES = {
  LINKEDIN: { name: "LinkedIn & Alumni", color: "#3b82f6" },
  COLD_OUTREACH: { name: "Cold Outreach", color: "#f97316" },
  MENTORSHIP: { name: "Mentor Program", color: "#a855f7" },
  TERRY_COACHES: { name: "Terry Peer Coaches", color: "#ec4899" },
  CORPORATE: { name: "Corporate Engagement", color: "#ef4444" },
  SKILLS: { name: "Skills & Certifications", color: "#22c55e" },
  CAMPUS_EVENT: { name: "Campus Event", color: "#06b6d4" },
};

// Real UGA/Terry events for April 2026 (from terry.uga.edu + career.uga.edu)
// These are added as fixed-date tasks, not recurring
export const REAL_EVENTS = [
  // Apr 7
  { date: "2026-04-07", title: "Employer of the Day: Bank of America | 9am-12:30pm | Amos Hall, Casey Commons", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-07", title: "Goldman Sachs Info Session | 1-3:30pm | Amos Hall", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-07", title: "Women in Consulting Alumni Panel | 5:30-6:30pm | Benson C109", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-07", title: "Women in Business: Bank of America Speaker | 6-7:30pm | Correll 313", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-07", title: "TerryConnect Tabling | 12-2pm | Amos Front Porch", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-07", title: "Terry Talks: Cal Evans (Synovus) | 2:45-3:45pm | Correll 402", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-07", title: "Crafting Authentic Job Apps with AI Tools | Online via Handshake", category: "Campus Event", color: "#06b6d4" },

  // Apr 8
  { date: "2026-04-08", title: "Employer of the Day: PMI U.S. | 9am-12:30pm | Amos Hall, Casey Commons", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-08", title: "Alumni Workshop: Leveraging AI in the Workplace | 2:30-3:30pm | Moore-Rooker A220", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-08", title: "Women in Finance: Bank of America Info | 6-7pm | Correll 321", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-08", title: "Aprio: Data Security & Compliance | 6:30-7:30pm | Benson C006", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-08", title: "Women in Tech: Goldman Sachs Info Meeting | 7-8pm | Benson C115", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-08", title: "Exploring Mentorship: UGA Mentor Program | Online via Handshake", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-08", title: "Budgeting and Professionalism (Arch Ready) | Online via Handshake", category: "Campus Event", color: "#06b6d4" },

  // Apr 9
  { date: "2026-04-09", title: "Lunch & LinkedIn Learning | 12:15-1:15pm | Bruce Family Conf Room, D300", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-09", title: "Terry Talks: Stephen Weizenecker (Barnes & Thornburg) | 2:45-3:45pm | Correll 402", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-09", title: "Women in Business: Ally Speaker Event | 6-7:30pm | Ivester E101", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-09", title: "Skills First: Leadership & Collaboration | Online via Handshake", category: "Campus Event", color: "#06b6d4" },

  // Apr 10
  { date: "2026-04-10", title: "No Internship? No Problem! Making the Most of Your Summer | Online via Handshake", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-10", title: "Beyond the Game: Careers in Sports Networking Night | Georgia Center, Magnolia Ballroom", category: "Campus Event", color: "#06b6d4" },

  // Apr 13
  { date: "2026-04-13", title: "Terry Edge Network Tabling | 11am-1pm | Tate Breezway", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-13", title: "Employer of the Day: Amerisure | 9am-12:30pm | Amos Hall, Casey Commons", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-13", title: "Full Circle: Journey from Mentee to Mentor | Online via Handshake", category: "Campus Event", color: "#06b6d4" },

  // Apr 14
  { date: "2026-04-14", title: "Terry Talks: Paul Carling & Brian Satirky (SteelMart) | 2:45-3:45pm | Correll 402", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-14", title: "Society for HR Management: General Body Meeting | 5:30-6:30pm | Correll 313", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-14", title: "Women in Accounting: Sarah Bunnell Speaker | 6:30-8pm | Correll 221", category: "Campus Event", color: "#06b6d4" },

  // Apr 15
  { date: "2026-04-15", title: "Info Session: Regions Bank | 3-4pm | Virtual", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-15", title: "How to Stand Out in a Competitive Job Market | Virtual via Handshake", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-15", title: "Women in Finance: Unum Info Session | 6-7pm | Correll 321", category: "Campus Event", color: "#06b6d4" },
  { date: "2026-04-15", title: "Corsair Society: Investment Banking Cohort Info | 6-7pm | Ivester E101", category: "Campus Event", color: "#06b6d4" },

  // Apr 22
  { date: "2026-04-22", title: "SEC-ACC Virtual Career Fair | Virtual via Handshake", category: "Campus Event", color: "#06b6d4" },

  // Apr 25
  { date: "2026-04-25", title: "Terry Alumni Awards & Gala | InterContinental Buckhead, Atlanta", category: "Campus Event", color: "#06b6d4" },
];

export const DEFAULT_TASKS = [
  // LINKEDIN - weekly recurring
  { id: "li-1", title: "Connect with 3 supply chain professionals on LinkedIn", category: "LinkedIn & Alumni", color: "#3b82f6", weekOfMonth: 1 },
  { id: "li-2", title: "Message 2 UGA alumni working in vendor management", category: "LinkedIn & Alumni", color: "#3b82f6", weekOfMonth: 1 },
  { id: "li-3", title: "Comment on a supply chain or fintech industry post", category: "LinkedIn & Alumni", color: "#3b82f6", weekOfMonth: 2 },
  { id: "li-4", title: "Connect with students at target companies (Sephora, Delta, etc.)", category: "LinkedIn & Alumni", color: "#3b82f6", weekOfMonth: 2 },
  { id: "li-5", title: "Send follow-up messages to recent LinkedIn connections", category: "LinkedIn & Alumni", color: "#3b82f6", weekOfMonth: 3 },
  { id: "li-6", title: "Update LinkedIn headline and summary for internship search", category: "LinkedIn & Alumni", color: "#3b82f6", weekOfMonth: 4 },

  // COLD OUTREACH - weekly
  { id: "co-1", title: "Send 3 cold emails to professionals at target companies", category: "Cold Outreach", color: "#f97316", weekOfMonth: 1 },
  { id: "co-2", title: "Draft personalized outreach template for beauty/wellness brands", category: "Cold Outreach", color: "#f97316", weekOfMonth: 1 },
  { id: "co-3", title: "Cold text 2 UGA alumni in business development roles", category: "Cold Outreach", color: "#f97316", weekOfMonth: 2 },
  { id: "co-4", title: "Follow up on unanswered cold emails from last week", category: "Cold Outreach", color: "#f97316", weekOfMonth: 3 },
  { id: "co-5", title: "Research 5 new contacts at airline/fintech companies", category: "Cold Outreach", color: "#f97316", weekOfMonth: 4 },

  // MENTORSHIP
  { id: "me-1", title: "Schedule check-in with mentor program coordinator", category: "Mentor Program", color: "#a855f7", weekOfMonth: 1 },
  { id: "me-2", title: "Prepare questions for mentor meeting about internship strategy", category: "Mentor Program", color: "#a855f7", weekOfMonth: 2 },
  { id: "me-3", title: "Ask mentor about supply chain internship timelines", category: "Mentor Program", color: "#a855f7", weekOfMonth: 3 },
  { id: "me-4", title: "Share updated resume with mentor for feedback", category: "Mentor Program", color: "#a855f7", weekOfMonth: 4 },

  // TERRY PEER INTERVIEW COACHES
  { id: "tc-1", title: "Book session with Terry peer interview coach", category: "Terry Peer Coaches", color: "#ec4899", weekOfMonth: 1 },
  { id: "tc-2", title: "Practice STAR method answers for behavioral questions", category: "Terry Peer Coaches", color: "#ec4899", weekOfMonth: 2 },
  { id: "tc-3", title: "Do mock interview focused on vendor management scenarios", category: "Terry Peer Coaches", color: "#ec4899", weekOfMonth: 3 },
  { id: "tc-4", title: "Review interview feedback and improve weak areas", category: "Terry Peer Coaches", color: "#ec4899", weekOfMonth: 4 },

  // CORPORATE ENGAGEMENT
  { id: "ce-1", title: "Visit Terry Corporate Engagement office drop-in hours", category: "Corporate Engagement", color: "#ef4444", weekOfMonth: 1 },
  { id: "ce-2", title: "RSVP for upcoming career fair or employer info session", category: "Corporate Engagement", color: "#ef4444", weekOfMonth: 2 },
  { id: "ce-3", title: "Ask Corporate Engagement about on-campus recruiting events", category: "Corporate Engagement", color: "#ef4444", weekOfMonth: 3 },
  { id: "ce-4", title: "Get on company mailing lists through career services portal", category: "Corporate Engagement", color: "#ef4444", weekOfMonth: 4 },

  // SKILLS & CERTIFICATIONS
  { id: "sk-1", title: "Complete Vault Guide practice simulation (30 min)", category: "Skills & Certifications", color: "#22c55e", weekOfMonth: 1 },
  { id: "sk-2", title: "Work on Forage virtual experience program", category: "Skills & Certifications", color: "#22c55e", weekOfMonth: 1 },
  { id: "sk-3", title: "Six Sigma certification study session (1 hour)", category: "Skills & Certifications", color: "#22c55e", weekOfMonth: 2 },
  { id: "sk-4", title: "Complete LinkedIn Learning course on supply chain analytics", category: "Skills & Certifications", color: "#22c55e", weekOfMonth: 2 },
  { id: "sk-5", title: "Build logistics dashboard project (portfolio piece)", category: "Skills & Certifications", color: "#22c55e", weekOfMonth: 3 },
  { id: "sk-6", title: "LinkedIn Learning: Business Development Foundations", category: "Skills & Certifications", color: "#22c55e", weekOfMonth: 3 },
  { id: "sk-7", title: "Practice with AdLoop platform for analytics skills", category: "Skills & Certifications", color: "#22c55e", weekOfMonth: 4 },
  { id: "sk-8", title: "Update skills section on resume with new certifications", category: "Skills & Certifications", color: "#22c55e", weekOfMonth: 4 },
];
