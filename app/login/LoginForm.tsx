"use client";
import { useState } from "react";

export default function LoginForm() {
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Login failed");
    location.href = "/dashboard";
  }
  return (
    <main className="login">
      <div className="login-card">
        <h1>Admin Login</h1>
        <p className="muted">Sign in to manage clients, projects and payments.</p>
        {error && <div className="alert">{error}</div>}
        <form className="form" onSubmit={submit}>
          <div className="field"><label>Email</label><input name="email" type="email" required /></div>
          <div className="field"><label>Password</label><input name="password" type="password" required /></div>
          <button className="btn" type="submit">Login</button>
        </form>
        <p className="muted" style={{fontSize: 12, marginTop: 16}}>Initial seed login: admin@example.com / admin123</p>
      </div>
    </main>
  );
}