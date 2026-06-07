import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: "/",
  build: {
    sourcemap: mode !== "production",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          query: ["@tanstack/react-query"],
          chess: ["chess.js", "react-chessboard"],
          motion: ["framer-motion"],
          icons: ["lucide-react"],
          zustand: ["zustand"]
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  server: {
    port: 5173
  }
}));
