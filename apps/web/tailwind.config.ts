import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        board: {
          light: "#f0d9b5",
          dark: "#b58863"
        },
        ink: "#ffffff",
        night: "#1a1a1a",
        panel: "#242424",
        line: "#343434",
        accent: "#5b8a32",
        danger: "#c0392b",
        warning: "#d4a017",
        muted: "#a0a0a0"
      },
      boxShadow: {
        glow: "0 10px 30px rgba(91, 138, 50, 0.18)"
      }
    }
  },
  plugins: []
} satisfies Config;
