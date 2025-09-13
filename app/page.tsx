import { readTree, ensureDocsRoot } from "@/lib/fs";
import DocTree from "@/components/DocTree";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureDocsRoot();
  const tree = await readTree();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <aside className="lg:col-span-1">
        <DocTree tree={tree} />
      </aside>
      <section className="lg:col-span-3">
        <h1 className="text-2xl font-semibold mb-4">Bienvenue 👋</h1>
        <p className="text-neutral-300 mb-4">
          Voici la doc <span className="font-semibold">OFFICIELLE</span> de l'équipe Alpha. Tu peux commencer par{" "}
          <Link className="underline" href="/index">index.md</Link>.
        </p>
      </section>
    </div>
  );
}
