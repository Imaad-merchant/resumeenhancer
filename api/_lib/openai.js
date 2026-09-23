import OpenAI from "openai";

let client;

// Server-only. Prefer OPENAI_API_KEY; fall back to the legacy VITE_ name so
// existing Vercel env config keeps working (it's no longer read by client code).
export function getClient() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new HttpError(500, "OpenAI API key is not configured on the server");
  client ??= new OpenAI({ apiKey });
  return client;
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function requireString(value, name, maxLen) {
  if (typeof value !== "string" || !value.trim()) throw new HttpError(400, `${name} is required`);
  if (value.length > maxLen) throw new HttpError(413, `${name} is too long (max ${maxLen} characters)`);
  return value;
}

// Wraps a POST-only JSON handler with method check and error mapping.
export function jsonHandler(fn) {
  return async (req, res) => {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      res.status(200).json(await fn(body));
    } catch (err) {
      const status = err.status && err.status < 600 ? err.status : 500;
      console.error(err);
      res.status(status).json({ error: err.message || "Request failed" });
    }
  };
}
