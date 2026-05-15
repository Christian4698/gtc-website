import type { Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import { timingSafeEqual } from "node:crypto";
import type { User } from "../drizzle/schema";

const ADMIN_COOKIE_NAME = "gtc_admin_session";
const ADMIN_OPEN_ID = "gtc-local-admin";
const ADMIN_USERNAME = process.env.GTC_ADMIN_USER ?? "Admin_GTC";
const ADMIN_PASSWORD = process.env.GTC_ADMIN_PASSWORD ?? "";
const ONE_DAY_SECONDS = 60 * 60 * 24;

function getSecretKey() {
  const secret = process.env.JWT_SECRET || process.env.GTC_ADMIN_SECRET || "gtc-admin-local-secret";
  return new TextEncoder().encode(secret);
}

function safeEquals(value: string, expected: string) {
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

function parseCookie(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return null;
  const prefix = `${name}=`;
  const match = cookieHeader
    .split(";")
    .map(part => part.trim())
    .find(part => part.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

export function isValidAdminCredentials(username: string, password: string) {
  if (!ADMIN_PASSWORD) {
    console.warn("[adminAuth] GTC_ADMIN_PASSWORD is not configured");
    return false;
  }
  return safeEquals(username, ADMIN_USERNAME) && safeEquals(password, ADMIN_PASSWORD);
}

export async function createAdminSessionToken() {
  return new SignJWT({ openId: ADMIN_OPEN_ID, role: "admin" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${ONE_DAY_SECONDS}s`)
    .sign(getSecretKey());
}

export function setAdminSessionCookie(req: Request, res: Response, token: string) {
  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: ONE_DAY_SECONDS * 1000,
    path: "/",
    sameSite: "lax",
    secure: isSecureRequest(req),
  });
}

export function clearAdminSessionCookie(req: Request, res: Response) {
  res.clearCookie(ADMIN_COOKIE_NAME, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isSecureRequest(req),
  });
}

export async function getAdminUserFromRequest(req: Request): Promise<User | null> {
  const token = parseCookie(req.headers.cookie, ADMIN_COOKIE_NAME);
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
    if (payload.openId !== ADMIN_OPEN_ID || payload.role !== "admin") return null;
    const now = new Date();
    return {
      id: 0,
      openId: ADMIN_OPEN_ID,
      name: "Admin GTC",
      email: "admin@generaltechconsult.com",
      loginMethod: "local",
      role: "admin",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    };
  } catch {
    return null;
  }
}
