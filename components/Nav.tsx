"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
  { href: "/projects", label: "Projects" },
  { href: "/payments", label: "Payments" },
  { href: "/renewals", label: "Renewals" },
  { href: "/reports", label: "Reports" },
  { href: "/marketing", label: "Marketing" },
  { href: "/settings", label: "Settings" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="brand" href="/dashboard" onClick={() => setOpen(false)}>
          <Image className="brand-logo" src="/arvik-digital-logo.png" alt="Arvik Digital logo" width={54} height={54} priority />
          <span className="brand-copy"><strong>Client Manager</strong><small>Agency workspace</small></span>
        </Link>
        <a className="agency-site-button" href="https://arvikdigital.in" target="_blank" rel="noreferrer">Arvik Digital <span aria-hidden="true">↗</span></a>
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <span /><span /><span />
        </button>
        <nav id="primary-navigation" className={`nav-links${open ? " is-open" : ""}`} aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(`${link.href}/`)) ? "page" : undefined}
              className={pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(`${link.href}/`)) ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <form action="/api/auth/logout" method="post" className="nav-logout">
            <button className="btn nav-logout-button" type="submit">Log out</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
