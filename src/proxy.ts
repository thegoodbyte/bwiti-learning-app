import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, adminSessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const expectedToken = await adminSessionToken();
  if (!expectedToken) {
    return NextResponse.next();
  }

  const cookieToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (cookieToken !== expectedToken) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|admin/login).*)"],
};
