import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname === "/api/login") return NextResponse.next();

  if (
    pathname === "/api/tree" &&
    ["GET", "HEAD", "OPTIONS"].includes(req.method)
  ) {
    return NextResponse.next();
  }

 
  const mustProtect =
    pathname.startsWith("/admin") || pathname.startsWith("/api");
  if (!mustProtect) return NextResponse.next();

  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) {
    return NextResponse.json(
      { error: "Admin disabled: set ADMIN_PASSWORD in .env" },
      { status: 503 }
    );
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
