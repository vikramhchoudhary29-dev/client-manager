import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAdminId } from "@/lib/auth";
type Ctx = { params: Promise<{ id: string }> };
export async function GET(_: Request, { params }: Ctx) {
 if (!(await getSessionAdminId())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 const { id } = await params; const client = await prisma.client.findUnique({ where: { id }, include: { projects: { include: { payments: true }, orderBy: { createdAt: "desc" } }, payments: { include: { project: true }, orderBy: { paymentDate: "desc" } } } });
 if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 }); return NextResponse.json(client);
}
export async function PATCH(request: Request, { params }: Ctx) {
 if (!(await getSessionAdminId())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 const { id } = await params; const body = await request.json().catch(() => null); const name = String(body?.name || "").trim(); const mobile = String(body?.mobile || "").trim();
 if (!name || !mobile) return NextResponse.json({ error: "Client name and mobile are required" }, { status: 400 });
 try { const client = await prisma.client.update({ where: { id }, data: { name, mobile, address: String(body?.address || "").trim() || null, notes: String(body?.notes || "").trim() || null } }); return NextResponse.json(client); } catch { return NextResponse.json({ error: "Could not update client" }, { status: 404 }); }
}
export async function DELETE(_: Request, { params }: Ctx) {
 if (!(await getSessionAdminId())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 const { id } = await params; const client = await prisma.client.findUnique({ where: { id }, include: { _count: { select: { projects: true, payments: true } } } });
 if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
 if (client._count.projects || client._count.payments) return NextResponse.json({ error: "This client has project or payment history. Archive/edit the client instead of deleting it." }, { status: 409 });
 await prisma.client.delete({ where: { id } }); return NextResponse.json({ ok: true });
}
