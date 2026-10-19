import { prisma } from "@/lib/prisma";

export async function getProjectFinancials(projectId: string) {
  const payments = await prisma.payment.findMany({
    where: { projectId },
    orderBy: { paymentDate: "desc" }
  });

  const verified = payments
    .filter((p) => p.status === "VERIFIED")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pending = payments
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const advance = payments
    .filter((p) => p.status === "VERIFIED" && p.type === "ADVANCE")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  const total = Number(project?.totalAmount || 0);
  const received = Math.min(verified, total);
  const remaining = Math.max(total - verified, 0);

  return { payments, total, received, remaining, pending, advance };
}
