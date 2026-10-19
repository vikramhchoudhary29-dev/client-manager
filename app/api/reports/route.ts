import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAdminId } from "@/lib/auth";

function cell(value: unknown) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replaceAll('"', '""')}"`;
}
function parseDateRange(from?: string | null, to?: string | null) {
  const start = from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? new Date(`${from}T00:00:00.000Z`) : undefined;
  const end = to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? new Date(`${to}T23:59:59.999Z`) : undefined;
  return { start, end };
}
function within(date: Date, start?: Date, end?: Date) { return (!start || date >= start) && (!end || date <= end); }

export async function GET(request: NextRequest) {
  if (!(await getSessionAdminId())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { start, end } = parseDateRange(request.nextUrl.searchParams.get("from"), request.nextUrl.searchParams.get("to"));
  const [projects, allPayments, allRenewals] = await Promise.all([
    prisma.project.findMany({ include: { client: true, payments: true }, orderBy: { createdAt: "desc" } }),
    prisma.payment.findMany({ include: { client: true, project: true }, orderBy: { paymentDate: "desc" } }),
    prisma.renewal.findMany({ include: { project: { include: { client: true } } }, orderBy: { renewalDate: "asc" } }),
  ]);
  const filteredProjects = projects.filter(p => within(p.createdAt, start, end));
  const payments = allPayments.filter(p => within(p.paymentDate, start, end));
  const renewals = allRenewals.filter(r => within(r.renewalDate, start, end));
  const lines = [["Record Type", "Client", "Project", "Date", "Status", "Total Amount", "Verified Received", "Pending Amount", "Outstanding", "Payment Mode", "Service Renewal"].map(cell).join(",")];
  for (const p of filteredProjects) {
    const verified = p.payments.filter(x => x.status === "VERIFIED").reduce((sum, x) => sum + Number(x.amount), 0);
    const pending = p.payments.filter(x => x.status === "PENDING").reduce((sum, x) => sum + Number(x.amount), 0);
    lines.push(["Project", p.client.name, p.name, p.createdAt.toISOString().slice(0, 10), p.status, Number(p.totalAmount), verified, pending, Math.max(Number(p.totalAmount) - verified, 0), "", ""].map(cell).join(","));
  }
  for (const p of payments) lines.push(["Payment", p.client.name, p.project.name, p.paymentDate.toISOString().slice(0, 10), p.status, "", p.status === "VERIFIED" ? Number(p.amount) : 0, p.status === "PENDING" ? Number(p.amount) : 0, "", p.mode, ""].map(cell).join(","));
  for (const r of renewals) lines.push(["Renewal", r.project.client.name, r.project.name, r.renewalDate.toISOString().slice(0, 10), r.status, "", "", "", "", "", `${r.serviceName}: ${Number(r.amount)}`].map(cell).join(","));
  return new NextResponse(lines.join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=arvik-client-manager-report.csv", "Cache-Control": "no-store" } });
}
