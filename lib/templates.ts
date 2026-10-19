import { prisma } from "@/lib/prisma";

export async function buildTemplate(template: string, projectId: string, extra: Record<string, string> = {}) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true, payments: true }
  });
  if (!project) throw new Error("Project not found");

  const setting = await prisma.setting.findUnique({ where: { id: "default" } });
  const nextRenewal = await prisma.renewal.findFirst({ where: { projectId: project.id }, orderBy: { renewalDate: "asc" } });
  const total = Number(project.totalAmount);
  const received = project.payments
    .filter((p) => p.status === "VERIFIED")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = Math.max(total - received, 0);
  const base = process.env.APP_URL || "http://localhost:3000";
  const paymentLink = `${base}/pay/project/${project.id}`;

  const values: Record<string, string> = {
    client_name: project.client.name,
    client_mobile: project.client.mobile,
    project_name: project.name,
    project_total: total.toLocaleString("en-IN"),
    amount_received: Math.min(received, total).toLocaleString("en-IN"),
    remaining_amount: remaining.toLocaleString("en-IN"),
    maintenance_charge: Number(project.maintenanceCharge).toLocaleString("en-IN"),
    maintenance_start_date: project.maintenanceStartDate ? project.maintenanceStartDate.toLocaleDateString("en-IN") : "Not specified",
    renewal_date: nextRenewal ? nextRenewal.renewalDate.toLocaleDateString("en-IN") : "Not scheduled",
    payment_link: paymentLink,
    company_name: setting?.companyName || "My Business",
    project_completion_date: project.completionDate ? project.completionDate.toLocaleDateString("en-IN") : "",
    payment_section: remaining > 0 ? `Please complete the remaining payment here:\n${paymentLink}` : "Payment Fully Received.",
    ...extra
  };

  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{{${key}}}`, value), template);
}
