import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "node:path"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Dev server only: in production the frontend Apache signs users in with Okta and sets X-Remote-User itself.
  // Locally, DEV_REMOTE_USER (in .env.local, not exposed to the browser) stands in for that signed-in uniqname.
  const devRemoteUser = loadEnv(mode, process.cwd(), '').DEV_REMOTE_USER

  return {
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@constants": path.resolve(__dirname, "./src/constants"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        // Keep the browser's Host (localhost:5173), like ProxyPreserveHost in production, so it matches the Origin
        // header Django's CSRF check compares against on writes.
        headers: devRemoteUser ? { "X-Remote-User": devRemoteUser } : {},
      },
    },
  },
  }
})
