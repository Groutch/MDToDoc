import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const expected = process.env.ADMIN_PASSWORD ?? "";

  if (!expected) {
    return NextResponse.json({ error: "ADMIN_PASSWORD not set" }, { status: 503 });
  }

  if (password !== expected) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin-session", expected, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return res;
}
