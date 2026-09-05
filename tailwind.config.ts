import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#12141a",
        paper: "#faf9f6",
        brand: {
          50: "#edf8f1",
          100: "#d7efdf",
          200: "#b3dfc2",
          300: "#80c99b",
          400: "#4caf70",
          500: "#258f55",
          600: "#147a43",
          700: "#0e6337",
          800: "#0d4f2f",
          900: "#0a3c25",
        },
        accent: {
          500: "#e56a3c",
          600: "#c9532a",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["Georgia", "ui-serif", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,20,26,0.06), 0 1px 12px rgba(18,20,26,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
