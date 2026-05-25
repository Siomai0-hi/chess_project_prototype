import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        board: {
          light: "#d7b98e",
          dark: "#6d4b35"
        },
        ink: "#f5f2eb",
        night: "#101211",
        panel: "#181b19",
        line: "#2a302c",
        accent: "#55c878",
        danger: "#f06457",
        warning: "#f4b84a"
      },
      boxShadow: {
        glow: "0 20px 80px rgba(85, 200, 120, 0.16)"
      }
    }
  },
  plugins: []
} satisfies Config;
