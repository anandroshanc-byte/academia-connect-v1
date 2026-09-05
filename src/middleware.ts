import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(function middleware(req) {
  const token = req.nextauth.token;
  const role = token?.role;
  const path = req.nextUrl.pathname;
  const rules: Record<string,string> = { "/student":"STUDENT", "/company":"COMPANY", "/institution":"INSTITUTION", "/academician":"ACADEMICIAN", "/admin":"ADMIN" };
  for (const [prefix, allowed] of Object.entries(rules)) {
    if (path.startsWith(prefix) && role !== allowed) return NextResponse.redirect(new URL("/", req.url));
  }
  if (["/company", "/institution", "/academician"].some(p => path.startsWith(p)) && token?.verified !== true) {
    return NextResponse.redirect(new URL("/verification-pending", req.url));
  }
  return NextResponse.next();
}, { pages: { signIn: "/login" } });

export const config = { matcher: ["/student/:path*", "/company/:path*", "/institution/:path*", "/academician/:path*", "/admin/:path*"] };
