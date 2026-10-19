"use client";

import { useState } from "react";
import Image from "next/image";
import { sendEmailVerification, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirebaseClientAuth } from "@/lib/firebase-client";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    try {
      const auth = getFirebaseClientAuth();
      const credential = await signInWithEmailAndPassword(auth, email, password);
      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user);
        await signOut(auth);
        setError("Please verify your email first. We sent a verification link to your inbox; open it, then sign in again.");
        return;
      }
      const idToken = await credential.user.getIdToken(true);
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();
      if (!response.ok) {
        await signOut(auth);
        setError(data.error || "This account cannot access the admin panel.");
        return;
      }
      window.location.assign("/dashboard");
    } catch (caught) {
      const code = (caught as { code?: string })?.code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Incorrect email or password.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many login attempts. Please wait and try again.");
      } else {
        setError(caught instanceof Error ? caught.message : "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-logo-wrap"><Image src="/arvik-digital-logo.png" alt="Arvik Digital logo" width={240} height={120} priority className="login-logo" /></div>
        <p className="eyebrow">ARVIK DIGITAL</p>
        <h1 id="login-title">Welcome back</h1>
        <p className="muted login-intro">Sign in to manage your clients, projects and payments.</p>
        {error && <div className="alert" role="alert">{error}</div>}
        <form className="form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">Admin email</label>
            <input id="email" name="email" type="email" autoComplete="username" placeholder="you@company.com" required disabled={loading} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required disabled={loading} />
          </div>
          <button className="btn login-submit" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in securely"}
          </button>
        </form>
        <p className="login-footnote">Access is limited to administrator accounts configured in Firebase.</p>
      </section>
    </main>
  );
}
