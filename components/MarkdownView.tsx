"use client";

import { useEffect, useRef } from "react";

export default function MarkdownView({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Garde béton : ne rien faire en SSR ou si document indisponible
    if (typeof window === "undefined" || !ref.current) return;

    let cancelled = false;

    (async () => {
      try {
        const mermaidMod = await import("mermaid");
        const mermaid = mermaidMod.default ?? (mermaidMod as any);

        // Init une seule fois par montage
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
        });

        const root = ref.current;
        const blocks = Array.from(root.querySelectorAll<HTMLElement>("pre.mermaid"));
        if (blocks.length === 0) return;

        for (const el of blocks) {
          if (cancelled) break;
          const code = el.textContent ?? "";
          const container = document.createElement("div");
          el.replaceWith(container);

          // Utilise l’API Promise (plus sûre que l’ancienne callback)
          try {
            const id = `m-${Math.random().toString(36).slice(2)}`;
            const { svg } = await mermaid.render(id, code);
            if (!cancelled) container.innerHTML = svg;
          } catch (err) {
            // En cas d’erreur de rendu, on remet le code en clair
            if (!cancelled) {
              container.innerHTML = `<pre>${escapeHtml(code)}</pre>`;
              // Optionnel: log en douceur
              // console.warn("Mermaid render failed:", err);
            }
          }
        }
      } catch (e) {
        // Si l’import échoue ou environnement non-browser
        // console.warn("Mermaid disabled:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [html]);

  return (
    <div
      ref={ref}
      className="prose prose-invert prose-lg max-w-none prose-pre:rounded-xl prose-pre:border prose-pre:border-neutral-800"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
