import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAdminId } from "@/lib/auth";

const projectStatuses = ["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"] as const;

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSessionAdminId())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await params).id;
  try {
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Project not found or could not be deleted" }, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSessionAdminId())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await params).id;
  const form = await request.formData();
  const clientName = String(form.get("clientName") || "").trim();
  const mobile = String(form.get("mobile") || "").trim();
  const name = String(form.get("name") || "").trim();
  const total = Number(form.get("totalAmount"));
  const maintenanceCharge = Number(form.get("maintenanceCharge") || 0);
  const maintenanceStartDateValue = String(form.get("maintenanceStartDate") || "");
  const maintenanceStartDate = maintenanceStartDateValue ? new Date(`${maintenanceStartDateValue}T00:00:00`) : null;
  const status = String(form.get("status") || "PLANNING");
  const completionDateValue = String(form.get("completionDate") || "");
  const completionDate = completionDateValue ? new Date(completionDateValue) : null;

  if (!clientName || !mobile || !name) return NextResponse.json({ error: "Client name, mobile, and project name are required" }, { status: 400 });
  if (!Number.isFinite(total) || total < 0) return NextResponse.json({ error: "Enter a valid project amount" }, { status: 400 });
  if (!Number.isFinite(maintenanceCharge) || maintenanceCharge < 0) return NextResponse.json({ error: "Enter a valid maintenance charge" }, { status: 400 });
  if (maintenanceStartDate && Number.isNaN(maintenanceStartDate.getTime())) return NextResponse.json({ error: "Enter a valid maintenance start date" }, { status: 400 });
  if (maintenanceCharge > 0 && !maintenanceStartDate) return NextResponse.json({ error: "Select a maintenance start date when entering a yearly maintenance charge" }, { status: 400 });
  if (!projectStatuses.includes(status as (typeof projectStatuses)[number])) return NextResponse.json({ error: "Invalid project status" }, { status: 400 });
  if (completionDate && Number.isNaN(completionDate.getTime())) return NextResponse.json({ error: "Invalid completion date" }, { status: 400 });

  try {
    await prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({ where: { id } });
      if (!project) throw new Error("PROJECT_NOT_FOUND");
      const reserved = await tx.payment.aggregate({
        where: { projectId: id, status: { in: ["VERIFIED", "PENDING"] } },
        _sum: { amount: true },
      });
      if (total < Number(reserved._sum.amount || 0)) throw new Error("TOTAL_BELOW_PAYMENTS");

      await tx.client.update({
        where: { id: project.clientId },
        data: {
          name: clientName,
          mobile,
          address: String(form.get("address") || "").trim() || null,
        },
      });
      await tx.project.update({
        where: { id },
        data: {
          name,
          technologies: String(form.get("technologies") || "").trim() || null,
          details: String(form.get("details") || "").trim() || null,
          description: String(form.get("description") || "").trim() || null,
          maintenanceCharge,
          maintenanceStartDate,
          totalAmount: total,
          status: status as (typeof projectStatuses)[number],
          completionDate,
        },
      });
    }, { isolationLevel: "Serializable" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "PROJECT_NOT_FOUND") return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (message === "TOTAL_BELOW_PAYMENTS") return NextResponse.json({ error: "Project total cannot be lower than its verified and pending payments" }, { status: 400 });
    return NextResponse.json({ error: "Could not update project. Refresh and try again." }, { status: 500 });
  }
}
