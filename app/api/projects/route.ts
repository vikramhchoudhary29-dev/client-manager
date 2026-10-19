import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAdminId } from "@/lib/auth";

const projectStatuses = ["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"] as const;
const paymentModes = ["UPI", "CASH", "BANK_TRANSFER", "CHEQUE"] as const;

export async function POST(request: Request) {
  if (!(await getSessionAdminId())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const clientName = String(form.get("clientName") || "").trim();
  const mobile = String(form.get("mobile") || "").trim();
  const name = String(form.get("name") || "").trim();
  const total = Number(form.get("totalAmount"));
  const advance = Number(form.get("advanceReceived") || 0);
  const maintenanceCharge = Number(form.get("maintenanceCharge") || 0);
  const maintenanceStartDateValue = String(form.get("maintenanceStartDate") || "");
  const maintenanceStartDate = maintenanceStartDateValue ? new Date(`${maintenanceStartDateValue}T00:00:00`) : null;
  const status = String(form.get("status") || "PLANNING");
  const advanceMode = String(form.get("advanceMode") || "UPI");
  const completionDateValue = String(form.get("completionDate") || "");
  const completionDate = completionDateValue ? new Date(completionDateValue) : null;

  if (!clientName || !mobile || !name || !Number.isFinite(total) || total < 0) {
    return NextResponse.json({ error: "Please enter valid required fields" }, { status: 400 });
  }
  if (!Number.isFinite(advance) || advance < 0 || advance > total) {
    return NextResponse.json({ error: "Advance received cannot be greater than the project total" }, { status: 400 });
  }
  if (!Number.isFinite(maintenanceCharge) || maintenanceCharge < 0) {
    return NextResponse.json({ error: "Please enter a valid maintenance charge" }, { status: 400 });
  }
  if (!projectStatuses.includes(status as (typeof projectStatuses)[number])) {
    return NextResponse.json({ error: "Invalid project status" }, { status: 400 });
  }
  if (!paymentModes.includes(advanceMode as (typeof paymentModes)[number])) {
    return NextResponse.json({ error: "Invalid advance payment mode" }, { status: 400 });
  }
  if (maintenanceStartDate && Number.isNaN(maintenanceStartDate.getTime())) {
    return NextResponse.json({ error: "Invalid maintenance start date" }, { status: 400 });
  }
  if (maintenanceCharge > 0 && !maintenanceStartDate) {
    return NextResponse.json({ error: "Please select a maintenance start date when entering a yearly maintenance charge" }, { status: 400 });
  }
  if (completionDate && Number.isNaN(completionDate.getTime())) {
    return NextResponse.json({ error: "Invalid completion date" }, { status: 400 });
  }

  try {
    const project = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          name: clientName,
          mobile,
          address: String(form.get("address") || "").trim() || null,
        },
      });

      const createdProject = await tx.project.create({
        data: {
          clientId: client.id,
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

      if (maintenanceCharge > 0 && maintenanceStartDate) {
        const renewalDate = new Date(maintenanceStartDate);
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        await tx.renewal.create({
          data: {
            projectId: createdProject.id,
            serviceName: `Yearly maintenance — ${name}`,
            renewalDate,
            amount: maintenanceCharge,
            status: renewalDate <= new Date() ? "OVERDUE" : "UPCOMING",
            notes: `Automatically created from project maintenance start date ${maintenanceStartDate.toLocaleDateString("en-IN")}.`,
          },
        });
      }

      if (advance > 0) {
        await tx.payment.create({
          data: {
            projectId: createdProject.id,
            clientId: client.id,
            amount: advance,
            paymentDate: new Date(),
            mode: advanceMode as (typeof paymentModes)[number],
            type: "ADVANCE",
            status: "VERIFIED",
            notes: "Advance received when project was created",
          },
        });
      }
      return createdProject;
    });

    return NextResponse.json({ id: project.id });
  } catch {
    return NextResponse.json({ error: "Could not create project. No partial records were saved; please try again." }, { status: 500 });
  }
}
