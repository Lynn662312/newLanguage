import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Helper to load environment variables from the Backend folder
function loadBackendEnv() {
  try {
    const envPath = path.resolve(__dirname, '../be/.env')
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf-8')
      const env: Record<string, string> = {}

      envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/)
        if (match) {
          const key = match[1].trim()
          let value = match[2].trim()
          // Remove wrapping quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
          }
          env[key] = value
        }
      })
      return env
    }
  } catch (error) {
    console.warn("Could not load backend .env file:", error)
  }
  return {}
}

const backendEnv = loadBackendEnv()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Map the backend OPENAI_API_KEY to the frontend VITE_OPENAI_API_KEY
    // JSON.stringify is crucial because 'define' does raw text replacement
    'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(backendEnv.OPENAI_API_KEY || '')
  }
})
