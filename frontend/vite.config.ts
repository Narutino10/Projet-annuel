import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 8080,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    hmr: {
      overlay: false, // Désactive les erreurs bloquantes de Vite
    },
  },
});
