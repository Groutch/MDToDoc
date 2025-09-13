"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { TreeNode } from "@/lib/fs";

type Props = {
  tree: TreeNode[];
  activePath?: string;
};

export default function DocTree({ tree, activePath }: Props) {
  const initialOpen = useMemo(() => {
    if (!activePath) return {} as Record<string, boolean>;
    const map: Record<string, boolean> = {};
    const parents = parentsOf(activePath.replace(/\\/g, "/"));
    for (const p of parents) map[p] = true;
    return map;
  }, [activePath]);

  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);

  return (
    <div className="space-y-1 text-sm">
      {tree.map((n) => (
        <Node
          key={n.path}
          node={n}
          open={open}
          setOpen={setOpen}
          activePath={activePath}
        />
      ))}
    </div>
  );
}

function Node({
  node,
  open,
  setOpen,
  activePath,
  depth = 0,
}: {
  node: TreeNode;
  open: Record<string, boolean>;
  setOpen: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  activePath?: string;
  depth?: number;
}) {
  if (node.type === "dir") {
    const isOpen = open[node.path] ?? true;
    const toggle = () =>
      setOpen((s) => ({ ...s, [node.path]: !(s[node.path] ?? true) }));

    return (
      <div>
        <div
          className="flex items-center gap-2 py-1 px-2 rounded hover:bg-white/5 cursor-pointer group"
          style={{ paddingLeft: depth * 12 + 8 }}
          onClick={toggle}
        >
          <span className="inline-block w-4 text-neutral-500 group-hover:text-neutral-300 select-none">
            {isOpen ? "▾" : "▸"}
          </span>
          <span className="select-none">📁</span>
          <span className="font-medium">{node.name}</span>
        </div>
        {isOpen && node.children?.length ? (
          <div className="ml-3 border-l border-neutral-800">
            {node.children.map((child) => (
              <Node
                key={child.path}
                node={child}
                open={open}
                setOpen={setOpen}
                activePath={activePath}
                depth={depth + 1}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  // file
  const href = "/" + node.path.replace(/\.md$/i, "");
  const isActive =
    activePath && normalize(node.path) === normalize(activePath);

  return (
    <Link
      href={href}
      className={
        "flex items-center gap-2 py-1 px-2 rounded hover:bg-white/5 " +
        (isActive ? "bg-white/10 text-white" : "text-neutral-300")
      }
      style={{ paddingLeft: depth * 12 + 28 }}
    >
      <span className="select-none">📄</span>
      <span className="truncate">{node.name.replace(/\.md$/i, "")}</span>
    </Link>
  );
}

function parentsOf(filePath: string) {
  // "guide/truc/index.md" -> ["guide", "guide/truc"]
  const parts = filePath.split("/");
  parts.pop(); // remove filename
  const res: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    res.push(parts.slice(0, i + 1).join("/"));
  }
  return res;
}
function normalize(p?: string) {
  return (p ?? "").replace(/\\/g, "/");
}
