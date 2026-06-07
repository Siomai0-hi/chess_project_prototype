import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          query: ["@tanstack/react-query"],
          chess: ["chess.js", "react-chessboard"],
          motion: ["framer-motion"]
        }
      }
    }
  },
  server: {
    port: 5173
  }
});
