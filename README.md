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
