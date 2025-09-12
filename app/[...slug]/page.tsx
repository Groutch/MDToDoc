import { ensureDocsRoot, normalizeSlugToPath, readMarkdownFile, readTree } from "@/lib/fs";
import { mdToHtmlAndToc } from "@/lib/markdown";
import DocTree from "@/components/DocTree";
import MarkdownView from "@/components/MarkdownView";
import TOC from "@/components/TOC";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DocPage({ params }: { params: { slug?: string[] } }) {
  await ensureDocsRoot();

  const relPath = normalizeSlugToPath(params.slug);
  if (!relPath) return notFound(); // ex: favicon.ico

  let md: string;
  try {
    md = await readMarkdownFile(relPath);
  } catch {
    return notFound();
  }

  const { html, toc } = mdToHtmlAndToc(md);
  const tree = await readTree();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <aside className="lg:col-span-1">
        <DocTree tree={tree} />
      </aside>
      <section className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <MarkdownView html={html} />
        </div>
        <div className="lg:col-span-1">
          <TOC toc={toc} />
        </div>
      </section>
    </div>
  );
}
