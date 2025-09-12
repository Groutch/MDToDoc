import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/admin", "/api"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Exclusions (toujours autorisées) ---
  if (pathname === "/admin/login") return NextResponse.next();      // <— important
  if (pathname === "/api/login") return NextResponse.next();
  if (pathname === "/api/tree" && req.method === "GET") return NextResponse.next();

  // --- Protège /admin/* et /api/* (sauf exclusions ci-dessus) ---
  const mustProtect = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!mustProtect) return NextResponse.next();

  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) {
    // Pas de mot de passe configuré → bloquer l’admin proprement
    return NextResponse.json({ error: "Admin disabled: set ADMIN_PASSWORD in .env.local" }, { status: 503 });
  }

  const cookie = req.cookies.get("admin-session")?.value;
  if (cookie !== expected) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
