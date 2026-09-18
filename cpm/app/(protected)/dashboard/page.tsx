import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const [clients, projects, payments, pending] = await Promise.all([
    prisma.client.count(),
    prisma.project.count(),
    prisma.payment.findMany({ where: { status: "VERIFIED" }, select: { amount: true } }),
    prisma.payment.findMany({ where: { status: "VERIFIED" }, select: { amount: true } })
  ]);
  const received = payments.reduce((s, p) => s + Number(p.amount), 0);
  const projectRows = await prisma.project.findMany({ select: { totalAmount: true } });
  const total = projectRows.reduce((s, p) => s + Number(p.totalAmount), 0);
  const remaining = Math.max(total - received, 0);
  return (
    <main className="container">
      <div className="row between"><h1>Dashboard</h1><Link className="btn" href="/projects/new">+ Add Project</Link></div>
      <div className="grid grid-4">
        <div className="card"><div className="stat-label">Clients</div><div className="stat-value">{clients}</div></div>
        <div className="card"><div className="stat-label">Projects</div><div className="stat-value">{projects}</div></div>
        <div className="card"><div className="stat-label">Total Received</div><div className="stat-value">₹{received.toLocaleString("en-IN")}</div></div>
        <div className="card"><div className="stat-label">Total Pending</div><div className="stat-value">₹{remaining.toLocaleString("en-IN")}</div></div>
      </div>
      <div className="card" style={{marginTop: 18}}>
        <h2>Quick access</h2>
        <div className="actions">
          <Link className="btn light" href="/projects">Projects</Link>
          <Link className="btn light" href="/payments">Payments</Link>
          <Link className="btn light" href="/marketing">Marketing</Link>
          <Link className="btn light" href="/settings">UPI Settings</Link>
        </div>
      </div>
    </main>
  );
}