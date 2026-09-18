import Link from "next/link";

export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link className="brand" href="/dashboard">Client & Project Manager</Link>
        <div className="nav-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/payments">Payments</Link>
          <Link href="/marketing">Marketing</Link>
          <Link href="/settings">Settings</Link>
          <form action="/api/auth/logout" method="post"><button className="btn secondary" type="submit">Logout</button></form>
        </div>
      </div>
    </nav>
  );
}