/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          50: "#f5f5f4",
          100: "#e7e5e4",
          200: "#d6d3d1",
          300: "#a8a29e",
          400: "#78716c",
          500: "#57534e",
          600: "#3f3c39",
          700: "#292524",
          800: "#1c1917",
          900: "#0f0d0c",
          950: "#070605",
        },
        accent: {
          DEFAULT: "#c8ff5e",
          soft: "#e8ffac",
          deep: "#7fb800",
        },
        plasma: {
          DEFAULT: "#7c5cff",
          soft: "#b6a3ff",
        },
        signal: {
          good: "#5eff8b",
          warn: "#ffb45e",
          bad: "#ff5e7e",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(200, 255, 94, 0.15), 0 8px 40px -8px rgba(200, 255, 94, 0.25)",
        plasma: "0 0 0 1px rgba(124, 92, 255, 0.2), 0 12px 48px -10px rgba(124, 92, 255, 0.35)",
        glass: "0 8px 32px 0 rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      backgroundImage: {
        "grid-lines":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(60% 60% at 50% 0%, rgba(124, 92, 255, 0.18), transparent 70%)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        shimmer: "shimmer 2.4s linear infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
