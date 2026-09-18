import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAdminId } from "@/lib/auth";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!(await getSessionAdminId()))return NextResponse.json({error:"Unauthorized"},{status:401});
  const id=(await params).id;
  const {status}=await request.json();
  if(!["VERIFIED","REJECTED"].includes(status))return NextResponse.json({error:"Invalid status"},{status:400});
  const p=await prisma.payment.findUnique({where:{id}});
  if(!p)return NextResponse.json({error:"Not found"},{status:404});
  if(p.status!=="PENDING")return NextResponse.json({error:"Payment is already processed"},{status:400});
  if(status==="VERIFIED"){
    const project=await prisma.project.findUnique({where:{id:p.projectId}});
    const verified=Number((await prisma.payment.aggregate({where:{projectId:p.projectId,status:"VERIFIED"},_sum:{amount:true}}))._sum.amount||0);
    if(verified+Number(p.amount)>Number(project?.totalAmount||0))return NextResponse.json({error:"Payment would exceed remaining amount"},{status:400});
  }
  await prisma.payment.update({where:{id},data:{status}});
  return NextResponse.json({ok:true});
}

export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!(await getSessionAdminId()))return NextResponse.json({error:"Unauthorized"},{status:401});
  const id=(await params).id;
  const p=await prisma.payment.findUnique({where:{id}});
  if(!p)return NextResponse.json({error:"Not found"},{status:404});
  const f=await request.formData();
  const amount=Number(f.get("amount"));
  const status=String(f.get("status")||p.status);
  const type=String(f.get("type")||p.type);
  if(!Number.isFinite(amount)||amount<=0)return NextResponse.json({error:"Invalid amount"},{status:400});
  if(!["ADVANCE","PROJECT_PAYMENT"].includes(type)||!["VERIFIED","PENDING","REJECTED"].includes(status))return NextResponse.json({error:"Invalid payment details"},{status:400});
  const verifiedOther=Number((await prisma.payment.aggregate({where:{projectId:p.projectId,status:"VERIFIED",NOT:{id}},_sum:{amount:true}}))._sum.amount||0);
  const project=await prisma.project.findUnique({where:{id:p.projectId}});
  if(status==="VERIFIED" && verifiedOther+amount>Number(project?.totalAmount||0))return NextResponse.json({error:"Payment would exceed the project remaining amount"},{status:400});
  await prisma.payment.update({where:{id},data:{
    amount,
    type:type as any,
    mode:String(f.get("mode")||p.mode) as any,
    status:status as any,
    paymentDate:f.get("paymentDate")?new Date(String(f.get("paymentDate"))):p.paymentDate,
    notes:String(f.get("notes")||"").trim()||null
  }});
  return NextResponse.json({ok:true});
}

export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){
  if(!(await getSessionAdminId()))return NextResponse.json({error:"Unauthorized"},{status:401});
  const id=(await params).id;
  const p=await prisma.payment.findUnique({where:{id}});
  if(!p)return NextResponse.json({error:"Not found"},{status:404});
  await prisma.payment.delete({where:{id}});
  return NextResponse.json({ok:true});
}
