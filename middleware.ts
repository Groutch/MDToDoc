import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/admin", "/api"];
const OPEN_API = new Set<string>(["/api/login"]); // endpoints non protégés

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Autorise /api/login et /api/tree en GET (lecture de l'arbo)
  if (pathname === "/api/login") return NextResponse.next();
  if (pathname === "/api/tree" && req.method === "GET") return NextResponse.next();

  const mustProtect = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!mustProtect) return NextResponse.next();

  const cookie = req.cookies.get("admin-session")?.value;
  const expected = process.env.ADMIN_PASSWORD ?? "";

  if (!expected) {
    // Si pas de mot de passe défini, bloque tout (sécurité)
    return NextResponse.json({ error: "Admin disabled: set ADMIN_PASSWORD env var" }, { status: 503 });
  }

  // Cookie = password hash ultra simple (ici juste égalité de valeur pour rester trivial)
  if (cookie !== expected) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*"
  ],
};
