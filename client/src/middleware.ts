import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static / _next/image  (Next.js internals)
     * - favicon.ico, robots.txt, sitemap.xml (static files)
     * - Public asset folders
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets|icons|images|widgets).*)",
  ],
};

// ─── Bot / scraper signatures ─────────────────────────────────────────────────

const BOT_UA_PATTERNS: RegExp[] = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /dirbuster/i,
  /dirb\b/i,
  /gobuster/i,
  /wfuzz/i,
  /hydra/i,
  /medusa/i,
  /burpsuite/i,
  /zgrab/i,
  /nuclei/i,
  /scrapy/i,
];

// ─── Route → role mapping ─────────────────────────────────────────────────────

const ROLE_ROUTES: Record<string, string> = {
  TEEN: "/dashboard",
  SPONSOR: "/sponsors",
  MENTOR: "/mentors",
  ADMIN: "/admin",
};

const PROTECTED_PREFIXES = Object.values(ROLE_ROUTES);

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ua = request.headers.get("user-agent") ?? "";

  // ── 1. Bot detection on API routes ──────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    // Block completely empty User-Agent on API calls
    if (!ua.trim()) {
      return new NextResponse(
        JSON.stringify({ error: "Forbidden", code: "BOT_DETECTED" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Block known attack tools
    if (BOT_UA_PATTERNS.some((p) => p.test(ua))) {
      return new NextResponse(
        JSON.stringify({ error: "Forbidden", code: "BOT_DETECTED" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // ── 2. Auth & role-based routing ─────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = (await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })) as any;

  if (token) {
    const allowedPrefix = ROLE_ROUTES[token.role as string];

    // Authenticated user visiting a route outside their allowed section
    if (
      allowedPrefix &&
      !pathname.startsWith(allowedPrefix) &&
      !pathname.startsWith("/auth") &&
      !pathname.startsWith("/api")
    ) {
      return NextResponse.redirect(new URL(allowedPrefix, request.url));
    }
  } else {
    // Unauthenticated user trying to access a protected prefix
    const isProtected = PROTECTED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );
    if (isProtected) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // ── 3. Security headers on every response ────────────────────────────────
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  // Only send over HTTPS in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  return response;
}
