import { cookies } from "next/headers";
import { firebaseAdminAuth, isAllowedAdmin } from "@/lib/firebase-admin";

export const SESSION_COOKIE = "arvik_admin_session";
export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;

export async function getSessionAdminId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await firebaseAdminAuth().verifySessionCookie(sessionCookie, true);
    if (!isAllowedAdmin(decoded.email)) return null;
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
