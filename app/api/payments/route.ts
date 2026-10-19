import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAdminId } from "@/lib/auth";

const paymentModes = ["UPI", "CASH", "BANK_TRANSFER", "CHEQUE"] as const;
const paymentTypes = ["ADVANCE", "PROJECT_PAYMENT"] as const;
const paymentStatuses = ["VERIFIED", "PENDING", "REJECTED"] as const;

export async function POST(request: Request) {
  if (!(await getSessionAdminId())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const projectId = String(form.get("projectId") || "");
  const clientId = String(form.get("clientId") || "");
  const amount = Number(form.get("amount"));
  const type = String(form.get("type") || "PROJECT_PAYMENT");
  const status = String(form.get("status") || "VERIFIED");
  const mode = String(form.get("mode") || "UPI");
  const paymentDateValue = String(form.get("paymentDate") || "");
  const paymentDate = paymentDateValue ? new Date(paymentDateValue) : new Date();

  if (!projectId || !clientId || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Enter a valid project, client, and payment amount" }, { status: 400 });
  }
  if (!paymentTypes.includes(type as (typeof paymentTypes)[number]) || !paymentStatuses.includes(status as (typeof paymentStatuses)[number])) {
    return NextResponse.json({ error: "Invalid payment type or status" }, { status: 400 });
  }
  if (!paymentModes.includes(mode as (typeof paymentModes)[number])) {
    return NextResponse.json({ error: "Invalid payment mode" }, { status: 400 });
  }
  if (Number.isNaN(paymentDate.getTime())) {
    return NextResponse.json({ error: "Invalid payment date" }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({ where: { id: projectId } });
      if (!project || project.clientId !== clientId) throw new Error("INVALID_PROJECT_CLIENT");

      // Pending payments reserve part of the contract amount to prevent multiple pending entries
      // from collectively exceeding the project total. Rejected payments do not reserve funds.
      const reserved = await tx.payment.aggregate({
        where: { projectId, status: { in: ["VERIFIED", "PENDING"] } },
        _sum: { amount: true },
      });
      const remaining = Math.max(Number(project.totalAmount) - Number(reserved._sum.amount || 0), 0);
      if (amount > remaining) throw new Error(`PAYMENT_LIMIT:${remaining}`);

      await tx.payment.create({
        data: {
          projectId,
          clientId,
          amount,
          paymentDate,
          mode: mode as (typeof paymentModes)[number],
          type: type as (typeof paymentTypes)[number],
          status: status as (typeof paymentStatuses)[number],
          notes: String(form.get("notes") || "").trim() || null,
        },
      });
    }, { isolationLevel: "Serializable" });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_PROJECT_CLIENT") {
      return NextResponse.json({ error: "The selected project and client do not match" }, { status: 400 });
    }
    if (error instanceof Error && error.message.startsWith("PAYMENT_LIMIT:")) {
      const remaining = Number(error.message.split(":")[1] || 0);
      return NextResponse.json({ error: `Payment exceeds the available amount. Remaining after other verified/pending payments: ₹${remaining.toLocaleString("en-IN")}` }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not save payment. Please refresh and try again." }, { status: 500 });
  }
}
