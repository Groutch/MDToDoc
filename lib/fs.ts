import { promises as fs } from "node:fs";
import path from "node:path";

export const DOCS_ROOT = path.join(process.cwd(), "docs");

export type TreeNode = {
  name: string;
  path: string; // relative from /docs
  type: "file" | "dir";
  children?: TreeNode[];
};

export async function ensureDocsRoot() {
  try {
    await fs.access(DOCS_ROOT);
  } catch {
    await fs.mkdir(DOCS_ROOT, { recursive: true });
  }
}

export async function readTree(rel: string = ""): Promise<TreeNode[]> {
  const dir = path.join(DOCS_ROOT, rel);
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nodes: TreeNode[] = [];
  for (const e of entries) {
    if (e.name.startsWith(".")) continue; // skip dotfiles
    const p = path.join(rel, e.name);
    if (e.isDirectory()) {
      const children = await readTree(p);
      nodes.push({ name: e.name, path: p, type: "dir", children });
    } else if (e.isFile() && e.name.toLowerCase().endsWith(".md")) {
      nodes.push({ name: e.name, path: p, type: "file" });
    }
  }
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name, "fr", { numeric: true, sensitivity: "base" });
  });
  return nodes;
}

export async function readMarkdownFile(relPath: string): Promise<string> {
  const abs = path.join(DOCS_ROOT, relPath);
  const content = await fs.readFile(abs, "utf-8");
  return content;
}

// Retourne null si on ne veut pas traiter la slug (ex: favicon.ico)
export function normalizeSlugToPath(slug?: string[]): string | null {
  if (!slug || slug.length === 0) return "index.md";
  const p = slug.join("/");
  if (p === "favicon.ico") return null; // très important
  if (p.endsWith(".md")) return p;
  return p + ".md";
}
