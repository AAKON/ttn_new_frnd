const { NextResponse } = require("next/server");
const { getToken } = require("next-auth/jwt");
const {
  ROOT,
  PROTECTED_ROUTE,
  ADMIN_ROUTE,
  AUTH_ROUTES,
  DEFAULT_REDIRECT,
} = require("@/lib/routes");

async function middleware(req) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const currentTime = Math.floor(Date.now() / 1000);
  const isAuthenticated =
    token &&
    token.accessToken &&
    (typeof token.exp !== "number" || token.exp > currentTime);

  const isProtectedPath = pathname.startsWith(PROTECTED_ROUTE);
  const isAdminPath = pathname.startsWith(ADMIN_ROUTE);
  const isAuthPath = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Admin routes: require authentication + administrator role
  if (isAdminPath) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
    const roles = token.roles || [];
    if (!roles.includes("administrator")) {
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  }

  // Protected routes: require authentication
  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Auth routes: redirect to home if already authenticated
  if (isAuthPath && isAuthenticated) {
    const protectedUrl = new URL(DEFAULT_REDIRECT, req.url);
    return NextResponse.redirect(protectedUrl);
  }

  return NextResponse.next();
}

const config = {
  matcher: ["/myaccount/:path*", "/admin/:path*", "/login", "/register"],
};

module.exports = { middleware, config };
