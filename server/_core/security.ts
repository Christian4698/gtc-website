import type { Express, Request, Response, NextFunction } from "express";

const SENSITIVE_PATH_RE =
  /(^|\/)(\.env(?:\..*)?|\.git|package(?:-lock)?\.json|pnpm-lock\.yaml|vite\.config\.[jt]s|drizzle\.config\.[jt]s|tsconfig(?:\.node)?\.json|.*\.log)$/i;

function isHttpsRequest(req: Request) {
  if (req.secure || req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  const values = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto?.split(",");
  return values?.some(value => value.trim().toLowerCase() === "https") ?? false;
}

function isLocalHost(req: Request) {
  const host = req.headers.host ?? "";
  return host.startsWith("localhost") || host.startsWith("127.0.0.1") || host.startsWith("[::1]");
}

export function registerSecurityMiddleware(app: Express) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === "production" && !isHttpsRequest(req) && !isLocalHost(req)) {
      return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    }

    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=(self), fullscreen=(self)",
    );
    res.setHeader("X-DNS-Prefetch-Control", "on");

    if (SENSITIVE_PATH_RE.test(decodeURIComponent(req.path))) {
      return res.status(404).send("Not found");
    }

    return next();
  });
}
