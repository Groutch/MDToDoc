import { marked } from "marked";
import hljs from "highlight.js";

export type TocItem = { id: string; text: string; level: number };

export function mdToHtmlAndToc(md: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const renderer = new marked.Renderer();

  const used = new Map<string, number>();
  function slugify(raw: string) {
    const base = raw
      .toLowerCase()
      .replace(/<[^>]*>/g, "")
      .replace(/[^\w\s-]/g, "")
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

  renderer.code = (
    code: string,
    infostring?: string | undefined,
    _escaped?: boolean | undefined
  ) => {
    const lang = (infostring || "").toLowerCase();

    if (lang === "mermaid") {
      return `<pre class="mermaid">${escapeHtml(code)}</pre>`;
    }

    try {
      if (lang) {
        const html = hljs.highlight(code, { language: lang }).value;
        return `<pre class="hljs"><code class="language-${lang} hljs">${html}</code></pre>`;
      } else {
        const html = hljs.highlightAuto(code).value;
        return `<pre class="hljs"><code class="hljs">${html}</code></pre>`;
      }
    } catch {
      return `<pre class="hljs"><code class="hljs">${escapeHtml(code)}</code></pre>`;
    }
  };

  const html = marked.parse(md, { renderer }) as string;
  return { html, toc };
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, "");
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
