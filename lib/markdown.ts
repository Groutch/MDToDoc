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
  const slugger = new (marked as any).Slugger();

  // heading(text, level) — API simplifiée dans marked v12
  renderer.heading = (text: string, level: number) => {
    const raw = stripHtml(String(text));
    const id = slugger.slug(raw);
    toc.push({ id, text: raw, level });
    return `<h${level} id="${id}">${text}</h${level}>`;
  };

  marked.setOptions({
    headerIds: false, // on gère nous-mêmes les ids
    highlight(code, lang) {
      if (lang && lang.toLowerCase() === "mermaid") {
        return code;
      }
      try {
        const v = lang ? hljs.highlight(code, { language: lang }).value : hljs.highlightAuto(code).value;
        return v;
      } catch {
        return code;
      }
    }
  });

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
