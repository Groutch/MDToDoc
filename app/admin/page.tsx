"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useDroppable,
  useDraggable,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type TreeNode = {
  name: string;
  path: string; // relative from /docs
  type: "file" | "dir";
  children?: TreeNode[];
};

export default function AdminPage() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    // avoids accidental drag: 8px
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tree", {
        cache: "no-store",
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      setTree(Array.isArray(j.tree) ? j.tree : []);
    } catch (e: any) {
      console.error("Failed to load tree:", e?.message ?? e);
      setTree([]);
      setError("Impossible de charger l’arborescence (API /api/tree indisponible).");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  // Upload
  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) alert("Upload failed");
    await refresh();
    formEl?.reset();
  }

  // Mkdir
  async function onMkdir(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const data = new FormData(formEl);
    const dir = (data.get("dir") as string) || "";
    if (!dir) return;
    const res = await fetch("/api/mkdir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dir }),
    });
    if (!res.ok) alert("mkdir failed");
    await refresh();
    formEl?.reset();
  }

  // Delete
  async function onDelete(target: string) {
    if (!confirm(`Supprimer ${target} ?`)) return;
    const res = await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target }),
    });
    if (!res.ok) alert("delete failed");
    await refresh();
  }

  const flatted = useMemo(() => flattenTree(tree), [tree]);

  function handleDragStart(ev: any) {
    setActiveId(ev.active.id);
  }

  function isDescendantPath(parent: string, maybeChildDir: string) {
    if (!parent) return false;
    const prefix = parent.endsWith("/") ? parent : parent + "/";
    return maybeChildDir.startsWith(prefix);
  }

  async function handleDragEnd(ev: DragEndEvent) {
    const { over, active } = ev;
    setActiveId(null);
    if (!over) return;

    const from = String(active.id);
    const overId = String(over.id);
    const toDir = overId === "root" ? "" : overId;

    // drop only on dirs or root
    if (overId !== "root") {
      const overNode = flatted.get(overId);
      if (!overNode || overNode.type !== "dir") return;
    }

    // no move on self, no move into own descendant
    if (toDir === "" ? from === "" : from === toDir) return;
    if (isDescendantPath(from, toDir)) return;

    const res = await fetch("/api/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, toDir }),
    });
    if (!res.ok) {
      alert("move failed");
      return;
    }
    await refresh();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="lg:col-span-1">
        <h1 className="text-xl font-semibold mb-4">Admin — Arborescence</h1>

        <div className="rounded-xl border border-neutral-800 p-3">
          {loading ? (
            <div className="text-neutral-400 text-sm">Chargement…</div>
          ) : error ? (
            <div className="text-red-400 text-sm">{error}</div>
          ) : (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              collisionDetection={rectIntersection}
            >
              <Droppable
                id="root"
                label="Racine (/docs)"
                className="mb-3 p-2 border-dashed"
              />

              <TreeView
                nodes={tree}
                open={open}
                setOpen={setOpen}
                onDelete={onDelete}
              />

              <DragOverlay>
                {activeId ? (
                  <div className="px-2 py-1 rounded bg-white/10">{activeId}</div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </section>

      <section className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border border-neutral-800 p-4">
          <h2 className="font-semibold mb-3">Upload Markdown</h2>
          <form onSubmit={onUpload} className="flex flex-col md:flex-row gap-3 items-start">
            <input
              type="text"
              name="dest"
              placeholder="Dossier de destination (ex: guide)"
              className="rounded-lg bg-neutral-900 border border-neutral-800 p-2 w-full md:w-80"
            />
            <input
              type="file"
              name="files"
              multiple
              accept=".md,text/markdown"
              className="text-sm"
            />
            <button className="rounded-lg bg-white/10 hover:bg-white/15 px-4 py-2">
              Upload
            </button>
          </form>
          <p className="text-xs text-neutral-500 mt-2">
            Astuce : si pas d'extension, l'extension <code>.md</code> sera ajoutée
          </p>
        </div>

        <div className="rounded-xl border border-neutral-800 p-4">
          <h2 className="font-semibold mb-3">Nouveau dossier</h2>
          <form onSubmit={onMkdir} className="flex gap-3">
            <input
              type="text"
              name="dir"
              placeholder="ex: guide/nouveau"
              className="rounded-lg bg-neutral-900 border border-neutral-800 p-2 w-full max-w-md"
              required
            />
            <button className="rounded-lg bg-white/10 hover:bg-white/15 px-4 py-2">
              Créer
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

/* ---------- components internes à la page ---------- */

function TreeView({
  nodes,
  open,
  setOpen,
  onDelete,
  base = "",
}: {
  nodes: TreeNode[];
  open: Record<string, boolean>;
  setOpen: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onDelete: (target: string) => void;
  base?: string;
}) {
  return (
    <div className="space-y-1">
      {nodes.map((n) => (
        <TreeNodeRow
          key={n.path}
          node={n}
          open={open}
          setOpen={setOpen}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function TreeNodeRow({
  node,
  open,
  setOpen,
  onDelete,
}: {
  node: TreeNode;
  open: Record<string, boolean>;
  setOpen: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onDelete: (target: string) => void;
}) {
  const isOpen = open[node.path] ?? true;
  const toggle = () => setOpen((s) => ({ ...s, [node.path]: !isOpen }));

  return (
    <div className="ml-1">
      <Droppable id={node.type === "dir" ? node.path : undefined}>
        <Draggable id={node.path}>
          <div className="flex items-center gap-2 py-1 group">
            {node.type === "dir" ? (
              <>
                <button
                  onClick={toggle}
                  className="w-5 text-neutral-500 hover:text-neutral-300"
                  title={isOpen ? "Réduire" : "Développer"}
                >
                  {isOpen ? "▾" : "▸"}
                </button>
                <span className="select-none">📁</span>
                <span className="font-medium">{node.name}</span>
                <span className="ml-auto opacity-0 group-hover:opacity-100 transition">
                  <button
                    className="text-xs px-2 py-0.5 rounded bg-white/10 hover:bg-white/15"
                    onClick={() => onDelete(node.path)}
                  >
                    Suppr
                  </button>
                </span>
              </>
            ) : (
              <>
                <span className="w-5" />
                <span className="select-none">📄</span>
                <span>{node.name}</span>
                <span className="ml-auto opacity-0 group-hover:opacity-100 transition">
                  <button
                    className="text-xs px-2 py-0.5 rounded bg-white/10 hover:bg-white/15"
                    onClick={() => onDelete(node.path)}
                  >
                    Suppr
                  </button>
                </span>
              </>
            )}
          </div>
        </Draggable>
      </Droppable>

      {node.type === "dir" && isOpen && node.children && node.children.length > 0 && (
        <div className="ml-6 border-l border-neutral-800 pl-3">
          {node.children.map((c) => (
            <TreeNodeRow
              key={c.path}
              node={c}
              open={open}
              setOpen={setOpen}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ----- DnD wrappers ----- */

function Droppable({
  id,
  label,
  className = "",
  children,
}: {
  id?: string;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  // fake id if none, to disable dnd + disable droppable
  const droppableId = (id ?? "__noop") as any;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    disabled: !id,
  });

  const active =
    id && isOver ? "border-white/30 bg-white/5" : "border-neutral-800";

  return (
    <div ref={setNodeRef} className={`rounded-lg border ${active} ${className}`}>
      {label ? <div className="px-3 py-2 text-sm text-neutral-300">{label}</div> : null}
      {children}
    </div>
  );
}


function Draggable({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

/* ---- utils ---- */
function flattenTree(nodes: TreeNode[]) {
  const map = new Map<string, TreeNode>();
  const walk = (ns: TreeNode[]) => {
    for (const n of ns) {
      map.set(n.path, n);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  return map;
}
