// Proxies the Google Sheet tracker (Apps Script web app, see google-sheet/tracker-sync.gs).
// Env: SHEET_WEBAPP_URL, SHEET_TOKEN (required); TRACKER_PASSCODE (optional — if set, the
// browser must send it in x-tracker-passcode, since the site itself is public).

const FIELDS = ["status", "appliedOn", "contact", "followUp", "nextAction", "notes"];

function send(res, status, data) {
  res.status(status).json(data);
}

export default async function handler(req, res) {
  const url = process.env.SHEET_WEBAPP_URL;
  const token = process.env.SHEET_TOKEN;
  if (!url || !token) return send(res, 503, { error: "Sheet sync is not configured", configured: false });

  const passcode = process.env.TRACKER_PASSCODE;
  if (passcode && req.headers["x-tracker-passcode"] !== passcode) {
    return send(res, 401, { error: "Passcode required", needPasscode: true });
  }

  try {
    if (req.method === "GET") {
      const r = await fetch(`${url}?token=${encodeURIComponent(token)}`, { redirect: "follow" });
      const data = await r.json();
      if (data.error) return send(res, 502, { error: `Sheet: ${data.error}` });
      return send(res, 200, { rows: data.rows || [] });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const { id, row, company, role, link, fields } = body;
      if (id === undefined || !company || typeof fields !== "object") return send(res, 400, { error: "id, company and fields are required" });
      const clean = {};
      for (const k of FIELDS) {
        if (k in fields) clean[k] = String(fields[k] ?? "").slice(0, 2000);
      }
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, id: String(id), row: Number(row) || 0, company: String(company).slice(0, 200), role: String(role || "").slice(0, 300), link: String(link || "").slice(0, 1000), fields: clean }),
        redirect: "follow",
      });
      const data = await r.json();
      if (data.error) return send(res, 502, { error: `Sheet: ${data.error}` });
      return send(res, 200, data);
    }

    res.setHeader("Allow", "GET, POST");
    return send(res, 405, { error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return send(res, 502, { error: "Could not reach the Google Sheet" });
  }
}
