import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#e5e7eb",
            a: { color: "#93c5fd", textDecoration: "none" },
            "a:hover": { textDecoration: "underline" },
            blockquote: { color: "#d1d5db", borderLeftColor: "#374151" },
            hr: { borderColor: "#27272a" },
          },
        },
        invert: {},
      },
    },
  },
  plugins: [typography],
} satisfies Config;
