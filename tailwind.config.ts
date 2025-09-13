import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "75ch",
            color: "#e5e7eb",
            a: { color: "#93c5fd", textDecoration: "none" },
            "a:hover": { textDecoration: "underline" },
            h1: {
              color: "#fff",
              fontWeight: "800",
              letterSpacing: "-0.02em",
              marginTop: "1.5rem",
              marginBottom: "1rem",
              fontSize: "2rem",
              lineHeight: "1.2"
            },
            h2: {
              color: "#fff",
              fontWeight: "700",
              marginTop: "2rem",
              marginBottom: "0.75rem",
              fontSize: "1.5rem",
              lineHeight: "1.3"
            },
            h3: {
              color: "#fff",
              fontWeight: "600",
              marginTop: "1.25rem",
              marginBottom: "0.5rem",
              fontSize: "1.25rem",
              lineHeight: "1.4"
            },
            p: { marginTop: "0.75rem", marginBottom: "0.75rem" },
            "ul,ol": { marginTop: "0.75rem", marginBottom: "0.75rem" },
            li: { marginTop: "0.25rem", marginBottom: "0.25rem" },
            blockquote: { color: "#d1d5db", borderLeftColor: "#374151" },
            hr: { borderColor: "#27272a" },
            code: {
              color: "#e5e7eb",
              backgroundColor: "#111827",
              padding: "0.2em 0.35em",
              borderRadius: "0.375rem",
              border: "1px solid #27272a"
            },
            pre: {
              backgroundColor: "#0b0f19",
              color: "#e5e7eb",
              borderRadius: "0.75rem",
              padding: "1rem",
              border: "1px solid #27272a",
              overflowX: "auto"
            },
            "pre code": { backgroundColor: "transparent", padding: "0", borderRadius: "0" },
            table: { width: "100%" },
            thead: { borderBottomColor: "#374151" },
            "tbody tr": { borderBottomColor: "#27272a" }
          }
        },
        invert: {}
      }
    }
  },
  plugins: [typography],
} satisfies Config;
