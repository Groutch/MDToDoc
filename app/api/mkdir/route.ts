import { promises as fs } from "node:fs";
import path from "node:path";
import { DOCS_ROOT, ensureDocsRoot } from "@/lib/fs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { dir } = await req.json().catch(() => ({ dir: "" }));
  if (!dir || /(^\.|\/\.\.\/|\\)/.test(dir)) {
    return NextResponse.json({ error: "Invalid dir" }, { status: 400 });
  }
  await ensureDocsRoot();
  const abs = path.join(DOCS_ROOT, dir);
  await fs.mkdir(abs, { recursive: true });
  return NextResponse.json({ ok: true });
}
