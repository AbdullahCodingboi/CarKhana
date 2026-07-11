import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FAF7FF",
          100: "#F1E8FF",
          200: "#E1CCFF",
          300: "#C79EFF",
          400: "#A66BFF",
          500: "#8B3DFF",
          600: "#7223E0",
          700: "#5A19B8",
          800: "#3F1084",
          900: "#2A0A5C",
          950: "#180538",
        },
        ink: "#1E1B2E",
        mist: "#FAF9FC",
        line: "#EAE4F5",
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jbmono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(42, 10, 92, 0.04), 0 8px 24px -12px rgba(42, 10, 92, 0.18)",
        cardHover: "0 4px 8px rgba(42, 10, 92, 0.06), 0 16px 32px -12px rgba(42, 10, 92, 0.24)",
      },
      backgroundImage: {
        "bridge-dashes": "none",
      },
    },
  },
  plugins: [],
};

export default config;
