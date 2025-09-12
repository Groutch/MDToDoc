"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const next = sp.get("next") || "/admin";

  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ password: pwd }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error || "Login failed");
      } else {
        router.push(next);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm mt-16 p-6 rounded-xl border border-neutral-800">
      <h1 className="text-xl font-semibold mb-4">Admin — Connexion</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 text-neutral-400">Mot de passe admin</label>
          <input
            type="password"
            className="w-full rounded-lg bg-neutral-900 border border-neutral-800 p-2"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="ADMIN_PASSWORD"
            autoFocus
          />
        </div>
        {err && <div className="text-sm text-red-400">{err}</div>}
        <button
          disabled={loading}
          className="rounded-lg bg-white/10 hover:bg-white/15 px-4 py-2"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
