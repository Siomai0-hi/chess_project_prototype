import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"]
      },
      colors: {
        board: {
          light: "#f0d9b5",
          dark: "#b58863"
        },
        ink: "#ffffff",
        night: "#141614",
        panel: "#1e211e",
        line: "#2e322e",
        accent: "#5b8a32",
        "accent-light": "#72b040",
        "accent-dim": "#3d5e22",
        danger: "#c0392b",
        "danger-light": "#e05046",
        warning: "#d4a017",
        "warning-light": "#f0c040",
        muted: "#8a9a8a",
        success: "#4caf7d"
      },
      backgroundImage: {
        "gradient-night": "linear-gradient(135deg, #141614 0%, #1a1e1a 100%)",
        "gradient-panel": "linear-gradient(135deg, #1e211e 0%, #242824 100%)",
        "gradient-accent": "linear-gradient(135deg, #5b8a32 0%, #72b040 100%)",
        "gradient-accent-hover": "linear-gradient(135deg, #6a9e3a 0%, #82c84a 100%)",
        "gradient-danger": "linear-gradient(135deg, #c0392b 0%, #e05046 100%)",
        "gradient-radial-glow": "radial-gradient(ellipse at center, rgba(91,138,50,0.12) 0%, transparent 70%)"
      },
      boxShadow: {
        glow: "0 0 30px rgba(91, 138, 50, 0.25), 0 10px 30px rgba(0,0,0,0.4)",
        "glow-sm": "0 0 12px rgba(91, 138, 50, 0.2)",
        "glow-accent": "0 0 20px rgba(91, 138, 50, 0.35)",
        "glow-danger": "0 0 20px rgba(192, 57, 43, 0.35)",
        panel: "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04)",
        card: "0 4px 16px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.03)",
        inner: "inset 0 1px 0 rgba(255,255,255,0.06)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)", maxHeight: "0" },
          "100%": { opacity: "1", transform: "translateY(0)", maxHeight: "400px" }
        },
        "count-up": {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 12px rgba(91,138,50,0.2)" },
          "50%": { boxShadow: "0 0 24px rgba(91,138,50,0.45)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(91,138,50,0.3)" },
          "50%": { borderColor: "rgba(91,138,50,0.7)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.3s ease-out both",
        "fade-in": "fade-in 0.25s ease-out both",
        "slide-down": "slide-down 0.25s ease-out both",
        "count-up": "count-up 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        "glow-pulse": "glow-pulse 2.4s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
        "border-glow": "border-glow 2s ease-in-out infinite"
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: []
} satisfies Config;
