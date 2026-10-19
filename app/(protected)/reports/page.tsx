import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ReportsControls from "./ReportsControls";

function dateRange(from?: string, to?: string) {
  const start = from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? new Date(`${from}T00:00:00.000Z`) : undefined;
  const end = to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? new Date(`${to}T23:59:59.999Z`) : undefined;
  return { start, end };
}
function inRange(date: Date, start?: Date, end?: Date) { return (!start || date >= start) && (!end || date <= end); }
function money(n: number) { return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`; }

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const query = await searchParams;
  const from = query.from ?? "";
  const to = query.to ?? "";
  const { start, end } = dateRange(from, to);
  const [projects, allPayments, allRenewals, clients] = await Promise.all([
    prisma.project.findMany({ include: { client: true, payments: true }, orderBy: { createdAt: "desc" } }),
    prisma.payment.findMany({ include: { client: true, project: true }, orderBy: { paymentDate: "desc" } }),
    prisma.renewal.findMany({ include: { project: { include: { client: true } } }, orderBy: { renewalDate: "asc" } }),
    prisma.client.count(),
  ]);
  const payments = allPayments.filter(p => inRange(p.paymentDate, start, end));
  const filteredProjects = projects.filter(p => inRange(p.createdAt, start, end));
  const renewals = allRenewals.filter(r => inRange(r.renewalDate, start, end));
  const revenue = payments.filter(p => p.status === "VERIFIED").reduce((sum, p) => sum + Number(p.amount), 0);
  const pending = payments.filter(p => p.status === "PENDING").reduce((sum, p) => sum + Number(p.amount), 0);
  const total = filteredProjects.reduce((sum, p) => sum + Number(p.totalAmount), 0);
  const paidAgainstFilteredProjects = filteredProjects.reduce((sum, p) => sum + p.payments.filter(x => x.status === "VERIFIED").reduce((s, x) => s + Number(x.amount), 0), 0);
  const outstanding = Math.max(total - paidAgainstFilteredProjects, 0);
  const period = from || to ? `${from || "Beginning"} to ${to || "Today"}` : "All dates";

  return <main className="container">
    <div className="row between report-controls" style={{ marginBottom: 18, gap: 14, flexWrap: "wrap" }}><div><h1>Reports</h1><p className="muted">Revenue, outstanding balances and payment collection overview.</p></div><ReportsControls from={from} to={to} /></div>
    <section id="report-print-area">
      <header className="report-print-header" style={{ display: "none", marginBottom: 22, borderBottom: "2px solid #b98522", paddingBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}><Image src="/arvik-digital-logo.png" alt="Arvik Digital" width={150} height={75} style={{ objectFit: "contain", width: 120, height: "auto" }} /><div><h1 style={{ margin: 0 }}>Business Report</h1><p style={{ margin: "5px 0" }}>Arvik Digital · Reporting period: {period}</p><p style={{ margin: 0, fontSize: 11, color: "#555" }}>Generated on {new Date().toLocaleDateString("en-IN")}</p></div></div>
      </header>
      <div className="grid grid-4"><div className="card"><div className="stat-label">Total clients</div><div className="stat-value">{clients}</div></div><div className="card"><div className="stat-label">Project value in period</div><div className="stat-value">{money(total)}</div></div><div className="card"><div className="stat-label">Verified revenue in period</div><div className="stat-value">{money(revenue)}</div></div><div className="card"><div className="stat-label">Outstanding on filtered projects</div><div className="stat-value">{money(outstanding)}</div></div></div>
      <div className="grid grid-3" style={{ marginTop: 18 }}><div className="card"><div className="stat-label">Pending payments in period</div><div className="stat-value">{money(pending)}</div></div><div className="card"><div className="stat-label">Projects created in period</div><div className="stat-value">{filteredProjects.length}</div></div><div className="card"><div className="stat-label">Renewals in period</div><div className="stat-value">{renewals.length}</div></div></div>
      <div className="card" style={{ marginTop: 18 }}><h2>Payment activity</h2><p className="muted">Reporting period: {period}</p><table className="report-print-table" style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th>Date</th><th>Client</th><th>Project</th><th>Status</th><th>Mode</th><th>Amount</th></tr></thead><tbody>{payments.length ? payments.map(p => <tr key={p.id}><td>{p.paymentDate.toLocaleDateString("en-IN")}</td><td>{p.client.name}</td><td>{p.project.name}</td><td>{p.status}</td><td>{p.mode}</td><td>{money(Number(p.amount))}</td></tr>) : <tr><td colSpan={6}>No payments found for this date range.</td></tr>}</tbody></table></div>
      <div className="card" style={{ marginTop: 18 }}><h2>Renewals in period</h2><table className="report-print-table" style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th>Renewal date</th><th>Client</th><th>Project</th><th>Service</th><th>Status</th><th>Charge</th></tr></thead><tbody>{renewals.length ? renewals.map(r => <tr key={r.id}><td>{r.renewalDate.toLocaleDateString("en-IN")}</td><td>{r.project.client.name}</td><td>{r.project.name}</td><td>{r.serviceName}</td><td>{r.status}</td><td>{money(Number(r.amount))}</td></tr>) : <tr><td colSpan={6}>No renewals found for this date range.</td></tr>}</tbody></table></div>
      <div className="card" style={{ marginTop: 18 }}><h2>Projects created in period</h2><table className="report-print-table" style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th>Created</th><th>Client</th><th>Project</th><th>Status</th><th>Project value</th></tr></thead><tbody>{filteredProjects.length ? filteredProjects.map(p => <tr key={p.id}><td>{p.createdAt.toLocaleDateString("en-IN")}</td><td>{p.client.name}</td><td>{p.name}</td><td>{p.status}</td><td>{money(Number(p.totalAmount))}</td></tr>) : <tr><td colSpan={5}>No projects found for this date range.</td></tr>}</tbody></table></div>
    </section>
    <div className="report-controls"><p className="muted" style={{ marginTop: 14 }}>Use “Export PDF / Print”, then choose “Save as PDF” and A4 paper size in the browser print dialog.</p><div className="actions"><Link className="btn light" href="/payments">Payment history</Link><Link className="btn light" href="/renewals">Renewals</Link></div></div>
  </main>;
}
