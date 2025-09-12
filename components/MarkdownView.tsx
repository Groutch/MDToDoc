"use client";

import { useEffect, useRef } from "react";

export default function MarkdownView({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Lazy-load mermaid on the client only
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({ startOnLoad: false, theme: "dark" });
        if (!cancelled && ref.current) {
          // Render any <pre class="mermaid"> blocks
          const blocks = ref.current.querySelectorAll("pre.mermaid");
          blocks.forEach((el) => {
            const code = el.textContent || "";
            const container = document.createElement("div");
            el.replaceWith(container);
            mermaid.render(`m-${Math.random().toString(36).slice(2)}`, code, (svg) => {
              container.innerHTML = svg;
            });
          });
        }
      } catch (e) {
        // fail silently if mermaid isn't available
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [html]);

  return (
    <div
      ref={ref}
      className="prose prose-invert max-w-none prose-pre:rounded-xl prose-pre:border prose-pre:border-neutral-800"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
