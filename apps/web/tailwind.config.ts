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
          light: "#d9c89c",
          dark: "#54736f"
        },
        ink: "#f7f3ea",
        night: "#12110f",
        panel: "#1d1a16",
        line: "#3a342b",
        accent: "#d7b56d",
        "accent-light": "#f2d98d",
        "accent-dim": "#8a6930",
        danger: "#b84653",
        "danger-light": "#ff7d86",
        warning: "#c88937",
        "warning-light": "#f0bc68",
        muted: "#9f9a8f",
        success: "#5fb38e",
        teal: "#65c8bd",
        "teal-dim": "#2c5f5a",
        burgundy: "#7d3142"
      },
      backgroundImage: {
        "gradient-night": "linear-gradient(135deg, #12110f 0%, #1b1715 48%, #12110f 100%)",
        "gradient-panel": "linear-gradient(145deg, rgba(33,29,23,0.98) 0%, rgba(22,21,19,0.98) 100%)",
        "gradient-accent": "linear-gradient(135deg, #d7b56d 0%, #65c8bd 100%)",
        "gradient-accent-hover": "linear-gradient(135deg, #f2d98d 0%, #7fded4 100%)",
        "gradient-danger": "linear-gradient(135deg, #7d3142 0%, #b84653 100%)",
        "gradient-radial-glow": "linear-gradient(90deg, rgba(215,181,109,0.10), rgba(101,200,189,0.08))"
      },
      boxShadow: {
        glow: "0 0 30px rgba(215, 181, 109, 0.18), 0 14px 42px rgba(0,0,0,0.45)",
        "glow-sm": "0 0 14px rgba(215, 181, 109, 0.16)",
        "glow-accent": "0 0 22px rgba(101, 200, 189, 0.22)",
        "glow-danger": "0 0 20px rgba(184, 70, 83, 0.32)",
        panel: "0 16px 48px rgba(0,0,0,0.36), 0 1px 0 rgba(255,255,255,0.05)",
        card: "0 8px 24px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.04)",
        inner: "inset 0 1px 0 rgba(255,255,255,0.08)"
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
          "0%, 100%": { boxShadow: "0 0 10px rgba(215,181,109,0.18)" },
          "50%": { boxShadow: "0 0 22px rgba(101,200,189,0.32)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(215,181,109,0.32)" },
          "50%": { borderColor: "rgba(101,200,189,0.7)" }
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
