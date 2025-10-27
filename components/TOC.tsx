"use client";

import { useEffect, useState } from "react";

type TocItem = { id: string; text: string; level: number };

export default function TOC({ toc }: { toc: TocItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => {
      let current: string | null = null;
      const headings = toc.map(t => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
      const scrollY = window.scrollY + 120;
      for (const h of headings) {
        if (h.offsetTop <= scrollY) current = h.id;
        else break;
      }
      setActive(current);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [toc]);

  return (
    <nav className="toc sticky top-24 max-h-[calc(100vh-8rem)] overflow-auto pr-4 text-sm">
      <div className="font-semibold mb-2 opacity-80">Table des matières</div>
      <ul className="space-y-1">
        {toc.map((item) => (
          <li key={item.id} style={{ marginLeft: (item.level - 1) * 12 }}>
            <a
              href={`#${item.id}`}
              className={
                "block truncate " + (active === item.id ? "text-white font-medium" : "text-neutral-400")
              }
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
