import { NextResponse } from "next/server";
import { DOCS_ROOT } from "@/lib/fs";
import path from "node:path";
import { promises as fs } from "node:fs";

export async function POST(req: Request) {
  const { from, toDir } = await req.json().catch(() => ({}));
  if (!from || toDir === undefined) {
    return NextResponse.json({ error: "from/toDir required" }, { status: 400 });
  }
  if (/(\.\.|\\)/.test(from) || /(\.\.|\\)/.test(toDir)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const srcAbs = path.join(DOCS_ROOT, from);
  const baseName = path.basename(from);
  const dstAbs = path.join(DOCS_ROOT, toDir, baseName);

  // Garde-fous: pas de move sur soi-même ou dans son descendant
  const normFrom = from.replace(/\\/g, "/");
  const normToDir = String(toDir).replace(/\\/g, "/");
  if (normFrom === normToDir || (normToDir && normToDir.startsWith(normFrom + "/"))) {
    return NextResponse.json({ error: "Invalid move (self/descendant)" }, { status: 400 });
  }

  try {
    await fs.mkdir(path.dirname(dstAbs), { recursive: true });
    await fs.rename(srcAbs, dstAbs);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Move failed" }, { status: 500 });
  }
}
