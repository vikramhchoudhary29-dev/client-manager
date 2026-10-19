import { NextResponse } from "next/server";
import { firebaseAdminAuth, isAllowedAdmin } from "@/lib/firebase-admin";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { idToken?: unknown };
    if (typeof body.idToken !== "string" || !body.idToken) {
      return NextResponse.json({ error: "Missing Firebase ID token." }, { status: 400 });
    }

    const decoded = await firebaseAdminAuth().verifyIdToken(body.idToken, true);
    if (!decoded.email_verified) {
      return NextResponse.json({ error: "Verify your email address before signing in." }, { status: 403 });
    }
    if (!isAllowedAdmin(decoded.email)) {
      return NextResponse.json({ error: "This account is not authorized to access the admin panel." }, { status: 403 });
    }

    const sessionCookie = await firebaseAdminAuth().createSessionCookie(body.idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(SESSION_MAX_AGE_MS / 1000),
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to establish a secure session. Check Firebase configuration and try again." }, { status: 401 });
  }
}
