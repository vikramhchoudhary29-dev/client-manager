import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAdminId } from "@/lib/auth";

export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}) {
  if(!(await getSessionAdminId()))return NextResponse.json({error:"Unauthorized"},{status:401});
  await prisma.project.delete({where:{id:(await params).id}});
  return NextResponse.json({ok:true});
}

export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}) {
  if(!(await getSessionAdminId()))return NextResponse.json({error:"Unauthorized"},{status:401});
  const id=(await params).id;
  const f=await request.formData();
  const p=await prisma.project.findUnique({where:{id}});
  if(!p)return NextResponse.json({error:"Not found"},{status:404});
  const total=Number(f.get("totalAmount"));
  if(!Number.isFinite(total)||total<0)return NextResponse.json({error:"Invalid amount"},{status:400});
  const verified=Number((await prisma.payment.aggregate({where:{projectId:id,status:"VERIFIED"},_sum:{amount:true}}))._sum.amount||0);
  if(total<verified)return NextResponse.json({error:"Total amount cannot be below verified payments"},{status:400});
  await prisma.client.update({where:{id:p.clientId},data:{name:String(f.get("clientName")||"").trim(),mobile:String(f.get("mobile")||"").trim(),address:String(f.get("address")||"").trim()||null}});
  await prisma.project.update({where:{id},data:{
    name:String(f.get("name")||"").trim(),
    technologies:String(f.get("technologies")||"").trim()||null,
    details:String(f.get("details")||"").trim()||null,
    description:String(f.get("description")||"").trim()||null,
    maintenanceCharge:Math.max(Number(f.get("maintenanceCharge")||0),0),
    totalAmount:total,
    status:String(f.get("status")||"PLANNING") as any,
    completionDate:f.get("completionDate")?new Date(String(f.get("completionDate"))):null
  }});
  return NextResponse.json({ok:true});
}
