import { NextResponse } from "next/server";
import { DOCS_ROOT } from "@/lib/fs";
import path from "node:path";
import { promises as fs } from "node:fs";

export async function POST(req: Request) {
  const { target } = await req.json().catch(() => ({ target: "" }));
  if (!target || /(\.\.|\\)/.test(target)) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }
  const abs = path.join(DOCS_ROOT, target);
  try {
    const st = await fs.lstat(abs);
    if (st.isDirectory()) {
      await fs.rm(abs, { recursive: true, force: true });
    } else {
      await fs.unlink(abs);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
