import rateLimit, { type Options } from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";

// ─── Shared helpers ───────────────────────────────────────────────────────────

const json429 = (message: string, code: string) =>
  (_req: Request, res: Response) => {
    res.status(429).json({ error: message, code });
  };

const base: Partial<Options> = {
  standardHeaders: true,   // RateLimit-* headers (RFC 6585)
  legacyHeaders: false,    // Remove X-RateLimit-* legacy headers
  // Trust the rightmost IP when behind a reverse proxy.
  // Set to the number of trusted proxies (e.g. 1 for nginx/Vercel).
  // In development with no proxy, set to 0.
  skip: () => process.env.NODE_ENV === "test",
};

// ─── Rate limiters ────────────────────────────────────────────────────────────

/**
 * Global: 200 requests / 15 min per IP.
 * Applied to every route as a baseline protection layer.
 */
export const globalLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 200,
  handler: json429(
    "Too many requests. Please slow down.",
    "RATE_LIMITED"
  ),
});

/**
 * Login: 5 failed attempts / 15 min per IP.
 * Successful requests are NOT counted toward the limit so legitimate
 * users aren't locked out after a successful login.
 */
export const loginLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  handler: json429(
    "Too many login attempts. Please wait 15 minutes before trying again.",
    "LOGIN_RATE_LIMITED"
  ),
});

/**
 * Signup: 3 accounts / hour per IP.
 * Slows down account-farming scripts.
 */
export const signupLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  max: 3,
  handler: json429(
    "Too many accounts created from this IP. Please try again in an hour.",
    "SIGNUP_RATE_LIMITED"
  ),
});

/**
 * Resend verification email: 3 requests / 30 min per IP.
 * Prevents email-bombing via the resend endpoint.
 */
export const resendLimiter = rateLimit({
  ...base,
  windowMs: 30 * 60 * 1000,
  max: 3,
  handler: json429(
    "Too many verification requests. Please wait before requesting another email.",
    "RESEND_RATE_LIMITED"
  ),
});

/**
 * Chatbot messages: 30 saves / minute per IP.
 * The AI generation itself is rate-limited on the Next.js side; this
 * limits spam to the save-message endpoint.
 */
export const chatbotLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  max: 30,
  handler: json429(
    "Too many messages. Please slow down.",
    "CHATBOT_RATE_LIMITED"
  ),
});

/**
 * Canvas sync operations: 10 syncs / 10 min per IP.
 * Canvas API calls are expensive; prevent accidental or intentional flooding.
 */
export const canvasSyncLimiter = rateLimit({
  ...base,
  windowMs: 10 * 60 * 1000,
  max: 10,
  handler: json429(
    "Too many sync requests. Please wait before triggering another sync.",
    "CANVAS_SYNC_RATE_LIMITED"
  ),
});

// ─── Bot / scraper detection ──────────────────────────────────────────────────

/** Known attack and scraping tool signatures. */
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
  /python-requests\/(?!.*legitimate)/i,
  /go-http-client\/1/i,   // raw Go HTTP (common in scanners)
  /axios\/0\.[0-4]/i,     // very old Axios versions used by some scrapers
];

/**
 * Blocks requests that:
 *   1. Have no User-Agent header
 *   2. Match a known attack/scraper tool pattern
 *
 * Legitimate API clients (mobile apps, internal services) should always
 * set a descriptive User-Agent.
 */
export const botDetection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const ua = req.headers["user-agent"];

  if (!ua || ua.trim() === "") {
    res.status(403).json({ error: "Forbidden", code: "BOT_DETECTED" });
    return;
  }

  if (BOT_UA_PATTERNS.some((p) => p.test(ua))) {
    res.status(403).json({ error: "Forbidden", code: "BOT_DETECTED" });
    return;
  }

  next();
};

// ─── Security response headers ────────────────────────────────────────────────

/**
 * Adds a minimal set of security headers to every response.
 * These complement (not replace) a proper reverse-proxy / CDN config.
 */
export const securityHeaders = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  next();
};
