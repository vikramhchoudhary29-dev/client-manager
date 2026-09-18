import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAdminId } from "@/lib/auth";

export async function POST(request: Request) {
  if (!(await getSessionAdminId())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const f = await request.formData();
  const clientName = String(f.get("clientName") || "").trim();
  const mobile = String(f.get("mobile") || "").trim();
  const name = String(f.get("name") || "").trim();
  const total = Number(f.get("totalAmount"));
  const advance = Number(f.get("advanceReceived") || 0);

  if (!clientName || !mobile || !name || !Number.isFinite(total) || total < 0) {
    return NextResponse.json({ error: "Please enter valid required fields" }, { status: 400 });
  }
  if (!Number.isFinite(advance) || advance < 0 || advance > total) {
    return NextResponse.json({ error: "Advance received cannot be greater than the project total" }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: {
      name: clientName,
      mobile,
      address: String(f.get("address") || "").trim() || null
    }
  });

  const project = await prisma.project.create({
    data: {
      clientId: client.id,
      name,
      technologies: String(f.get("technologies") || "").trim() || null,
      details: String(f.get("details") || "").trim() || null,
      description: String(f.get("description") || "").trim() || null,
      maintenanceCharge: Math.max(Number(f.get("maintenanceCharge") || 0), 0),
      totalAmount: total,
      status: String(f.get("status") || "PLANNING") as any,
      completionDate: f.get("completionDate") ? new Date(String(f.get("completionDate"))) : null
    }
  });

  if (advance > 0) {
    await prisma.payment.create({
      data: {
        projectId: project.id,
        clientId: client.id,
        amount: advance,
        paymentDate: new Date(),
        mode: String(f.get("advanceMode") || "UPI") as any,
        type: "ADVANCE",
        status: "VERIFIED",
        notes: "Advance received when project was created"
      }
    });
  }

  return NextResponse.json({ id: project.id });
}
