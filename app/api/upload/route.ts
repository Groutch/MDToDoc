import { NextResponse } from "next/server";
import { DOCS_ROOT, ensureDocsRoot } from "@/lib/fs";
import path from "node:path";
import { promises as fs } from "node:fs";

export async function POST(req: Request) {
  await ensureDocsRoot();
  const form = await req.formData();
  const dest = (form.get("dest") as string) || "";
  if (/(\.\.|\\)/.test(dest)) {
    return NextResponse.json({ error: "Invalid dest" }, { status: 400 });
  }
  const files = form.getAll("files") as File[];
  if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });

  const dirAbs = path.join(DOCS_ROOT, dest);
  await fs.mkdir(dirAbs, { recursive: true });

  for (const f of files) {
    const buf = Buffer.from(await f.arrayBuffer());
    let name = f.name;
    if (!name.toLowerCase().endsWith(".md")) name += ".md";
    const abs = path.join(dirAbs, name);
    await fs.writeFile(abs, buf);
  }
  return NextResponse.json({ ok: true });
}
