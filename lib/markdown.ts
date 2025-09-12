import { marked } from "marked";
import hljs from "highlight.js";

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

export function mdToHtmlAndToc(md: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const renderer = new marked.Renderer();

  // mini slugify + déduplication locale (h2 identiques => -1, -2, ...)
  const used = new Map<string, number>();
  function slugify(raw: string) {
    const base = raw
      .toLowerCase()
      .replace(/<[^>]*>/g, "")        // retire le HTML éventuel
      .replace(/[^\w\s-]/g, "")       // garde lettres/chiffres/underscore/espace/tiret
      .trim()
      .replace(/\s+/g, "-");
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    return n === 0 ? base : `${base}-${n}`;
  }

  renderer.heading = (text: string, level: number) => {
    const raw = stripHtml(String(text));
    const id = slugify(raw);
    toc.push({ id, text: raw, level });
    return `<h${level} id="${id}">${text}</h${level}>`;
  };

  marked.setOptions({
    headerIds: false, // on gère nous-mêmes les ids
    highlight(code, lang) {
      if (lang && lang.toLowerCase() === "mermaid") return code;
      try {
        return lang
          ? hljs.highlight(code, { language: lang }).value
          : hljs.highlightAuto(code).value;
      } catch {
        return code;
      }
    },
  });

  // Support mermaid explicite
  renderer.code = (code: string, lang?: string) => {
    if (lang && lang.toLowerCase() === "mermaid") {
      return `<pre class="mermaid">${code}</pre>`;
    }
    const className = lang ? `language-${lang}` : "";
    return `<pre><code class="${className}">${code}</code></pre>`;
  };

  const html = marked.parse(md, { renderer }) as string;
  return { html, toc };
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, "");
}
