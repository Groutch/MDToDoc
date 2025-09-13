import { readTree, ensureDocsRoot } from "@/lib/fs";
import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET() {
  await ensureDocsRoot();
  const tree = await readTree();
  return NextResponse.json({ tree });
}
