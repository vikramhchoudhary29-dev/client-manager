import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE = "cpm_session";

function secret() {
  return process.env.SESSION_SECRET || "development-only-secret-change-me";
}

export function createSessionToken(adminId: string) {
  const payload = `${adminId}.${Date.now()}`;
  const signature = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const [adminId, timestamp, signature] = decoded.split(".");
    if (!adminId || !timestamp || !signature) return null;
    const payload = `${adminId}.${timestamp}`;
    const expected = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    if (Date.now() - Number(timestamp) > 1000 * 60 * 60 * 24 * 30) return null;
    return adminId;
  } catch {
    return null;
  }
}

export async function getSessionAdminId() {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE)?.value);
}

export async function setSession(adminId: string) {
  const store = await cookies();
  store.set(COOKIE, createSessionToken(adminId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}