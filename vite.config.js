import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Serves /api/* serverless functions during `npm run dev` (Vercel does this in production)
function vercelApiDev() {
  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/([\w-]+)\/?(?:\?.*)?$/)
        if (!match) return next()
        let mod
        try {
          mod = await server.ssrLoadModule(`/api/${match[1]}.js`)
        } catch {
          res.statusCode = 404
          return res.end(JSON.stringify({ error: 'Not found' }))
        }
        let raw = ''
        for await (const chunk of req) raw += chunk
        req.body = raw
        res.status = (code) => { res.statusCode = code; return res }
        res.json = (data) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)) }
        await mod.default(req, res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Expose non-VITE_ vars (OPENAI_API_KEY) to the dev API functions only
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), vercelApiDev()],
  }
})
