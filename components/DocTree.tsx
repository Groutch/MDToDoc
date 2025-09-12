import Link from "next/link";
import type { TreeNode } from "@/lib/fs";

function Node({ node, basePath = "" }: { node: TreeNode; basePath?: string }) {
  if (node.type === "dir") {
    return (
      <div className="ml-2">
        <div className="flex items-center gap-2 py-1 text-neutral-300">
          <span>📁</span>
          <span className="font-medium">{node.name}</span>
        </div>
        <div className="ml-4 border-l border-neutral-800 pl-3">
          {node.children?.map((child) => (
            <Node key={child.path} node={child} basePath={basePath} />
          ))}
        </div>
      </div>
    );
  }
  // file
  const withoutExt = node.path.replace(/\.md$/i, "");
  const href = "/" + withoutExt;
  return (
    <Link href={href} className="flex items-center gap-2 py-1 text-neutral-300 hover:text-white">
      <span>📄</span>
      <span>{node.name.replace(/\.md$/i, "")}</span>
    </Link>
  );
}

export default function DocTree({ tree }: { tree: TreeNode[] }) {
  return (
    <div className="space-y-1">
      {tree.map((n) => (
        <Node key={n.path} node={n} />
      ))}
    </div>
  );
}
