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

  renderer.heading = (text, level, raw, slugger) => {
    const id = slugger.slug(raw);
    toc.push({ id, text: String(text), level });
    return `<h${level} id="${id}">${text}</h${level}>`;
  };

  // Code highlighting + mermaid tagging
  marked.setOptions({
    highlight(code, lang) {
      if (lang && lang.toLowerCase() === "mermaid") {
        // Return a pre/code block that our client component will transform via mermaid
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

  renderer.code = (code, lang) => {
    if (lang && lang.toLowerCase() === "mermaid") {
      return `<pre class="mermaid">${code}</pre>`;
    }
    const className = lang ? `language-${lang}` : "";
    return `<pre><code class="${className}">${code}</code></pre>`;
  };

  const html = marked.parse(md, { renderer }) as string;
  return { html, toc };
}
