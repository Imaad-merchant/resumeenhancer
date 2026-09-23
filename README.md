# resumeenhancer

Vite + React app deployed on Vercel. OpenAI calls run in serverless functions under `api/`, so the key never reaches the browser.

## Local dev

```bash
cp .env.example .env.local   # set OPENAI_API_KEY
npm install
npm run dev                  # http://localhost:5173 (also serves /api/*)
```

## Vercel

Set `OPENAI_API_KEY` in Project Settings → Environment Variables (Production + Preview).

## Google Sheet sync (Internships page)

The tracker syncs both ways with a Google Sheet via a small Apps Script:

1. In the sheet: Extensions → Apps Script → paste `google-sheet/tracker-sync.gs`, set `TOKEN`, then Deploy → Web app (Execute as: Me, Access: Anyone). Copy the URL.
2. In Vercel env vars: `SHEET_WEBAPP_URL` (that URL), `SHEET_TOKEN` (same token), and optionally `TRACKER_PASSCODE` (required to read/edit from the site). Redeploy.

Synced columns: My Status, Applied On, Contact / Referral, Follow-Up, Next Action, Notes (sheet → site also picks up Deadline edits and rows you add in the sheet).
