import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAdminId } from "@/lib/auth";

export async function GET(request: Request) {
  if (!(await getSessionAdminId())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const q = new URL(request.url).searchParams.get("q")?.trim() || "";
  const clients = await prisma.client.findMany({ where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { mobile: { contains: q } }, { address: { contains: q, mode: "insensitive" } }] } : undefined, include: { _count: { select: { projects: true, payments: true } } }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  if (!(await getSessionAdminId())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const name = String(body?.name || "").trim(); const mobile = String(body?.mobile || "").trim();
  if (!name || !mobile) return NextResponse.json({ error: "Client name and mobile are required" }, { status: 400 });
  const client = await prisma.client.create({ data: { name, mobile, address: String(body?.address || "").trim() || null, notes: String(body?.notes || "").trim() || null } });
  return NextResponse.json(client, { status: 201 });
}
