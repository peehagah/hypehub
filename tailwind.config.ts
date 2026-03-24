import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f1117",
        sidebar: "#161822",
        card: "#1a1d2e",
        border: "#2a2d3e",
        coral: "#ff6b6b",
        pink: "#ff4dca",
        purple: "#9b59ff",
        "coral-light": "#ff8e8e",
        "purple-light": "#b47aff",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #ff6b6b 0%, #ff4dca 50%, #9b59ff 100%)",
        "gradient-brand-subtle": "linear-gradient(135deg, rgba(255,107,107,0.15) 0%, rgba(255,77,202,0.1) 50%, rgba(155,89,255,0.15) 100%)",
        "gradient-card": "linear-gradient(145deg, #1a1d2e 0%, #1e2235 100%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slideIn 0.2s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
