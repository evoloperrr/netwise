import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";

  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // api/auth (NextAuth), api/v1/* (public API, own Bearer-token auth), and
  // api/vlpay/webhook (VLPAY's own callback, no session) all skip the
  // Google-session gate and authenticate themselves.
  matcher: ["/((?!api/auth|api/v1|api/vlpay/webhook|_next/static|_next/image|favicon.ico).*)"],
};
