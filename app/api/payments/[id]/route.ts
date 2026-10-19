import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAdminId } from "@/lib/auth";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!(await getSessionAdminId()))return NextResponse.json({error:"Unauthorized"},{status:401});
  const id=(await params).id;
  let body:{status?:unknown};
  try { body=await request.json(); } catch { return NextResponse.json({error:"Invalid request body"},{status:400}); }
  const status=body.status;
  if(!["VERIFIED","REJECTED"].includes(String(status)))return NextResponse.json({error:"Invalid status"},{status:400});
  try {
    await prisma.$transaction(async(tx)=>{
      const payment=await tx.payment.findUnique({where:{id}});
      if(!payment)throw new Error("PAYMENT_NOT_FOUND");
      if(payment.status!=="PENDING")throw new Error("PAYMENT_ALREADY_PROCESSED");
      if(status==="VERIFIED"){
        const project=await tx.project.findUnique({where:{id:payment.projectId}});
        if(!project)throw new Error("PROJECT_NOT_FOUND");
        const verified=await tx.payment.aggregate({where:{projectId:payment.projectId,status:"VERIFIED"},_sum:{amount:true}});
        if(Number(verified._sum.amount||0)+Number(payment.amount)>Number(project.totalAmount))throw new Error("PAYMENT_LIMIT");
      }
      await tx.payment.update({where:{id},data:{status:status as "VERIFIED"|"REJECTED"}});
    },{isolationLevel:"Serializable"});
    return NextResponse.json({ok:true});
  } catch(error) {
    const message=error instanceof Error?error.message:"";
    if(message==="PAYMENT_NOT_FOUND"||message==="PROJECT_NOT_FOUND")return NextResponse.json({error:"Payment or project not found"},{status:404});
    if(message==="PAYMENT_ALREADY_PROCESSED")return NextResponse.json({error:"Payment is already processed"},{status:400});
    if(message==="PAYMENT_LIMIT")return NextResponse.json({error:"Verifying this payment would exceed the project total. Review other verified payments first."},{status:400});
    return NextResponse.json({error:"Could not update payment. Refresh and try again."},{status:500});
  }
}

export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!(await getSessionAdminId()))return NextResponse.json({error:"Unauthorized"},{status:401});
  const id=(await params).id;
  const form=await request.formData();
  const amount=Number(form.get("amount"));
  const status=String(form.get("status")||"PENDING");
  const type=String(form.get("type")||"PROJECT_PAYMENT");
  const mode=String(form.get("mode")||"UPI");
  const dateValue=String(form.get("paymentDate")||"");
  const paymentDate=dateValue?new Date(dateValue):null;
  if(!Number.isFinite(amount)||amount<=0)return NextResponse.json({error:"Enter a valid payment amount"},{status:400});
  if(!["ADVANCE","PROJECT_PAYMENT"].includes(type)||!["VERIFIED","PENDING","REJECTED"].includes(status))return NextResponse.json({error:"Invalid payment type or status"},{status:400});
  if(!["UPI","CASH","BANK_TRANSFER","CHEQUE"].includes(mode))return NextResponse.json({error:"Invalid payment mode"},{status:400});
  if(paymentDate&&Number.isNaN(paymentDate.getTime()))return NextResponse.json({error:"Invalid payment date"},{status:400});
  try {
    await prisma.$transaction(async(tx)=>{
      const existing=await tx.payment.findUnique({where:{id}});
      if(!existing)throw new Error("PAYMENT_NOT_FOUND");
      const project=await tx.project.findUnique({where:{id:existing.projectId}});
      if(!project)throw new Error("PROJECT_NOT_FOUND");
      if(status==="VERIFIED"){
        const others=await tx.payment.aggregate({where:{projectId:existing.projectId,status:"VERIFIED",NOT:{id}},_sum:{amount:true}});
        if(Number(others._sum.amount||0)+amount>Number(project.totalAmount))throw new Error("PAYMENT_LIMIT");
      }
      await tx.payment.update({where:{id},data:{
        amount,
        type:type as "ADVANCE"|"PROJECT_PAYMENT",
        mode:mode as "UPI"|"CASH"|"BANK_TRANSFER"|"CHEQUE",
        status:status as "VERIFIED"|"PENDING"|"REJECTED",
        paymentDate:paymentDate||existing.paymentDate,
        notes:String(form.get("notes")||"").trim()||null
      }});
    },{isolationLevel:"Serializable"});
    return NextResponse.json({ok:true});
  } catch(error) {
    const message=error instanceof Error?error.message:"";
    if(message==="PAYMENT_NOT_FOUND"||message==="PROJECT_NOT_FOUND")return NextResponse.json({error:"Payment or project not found"},{status:404});
    if(message==="PAYMENT_LIMIT")return NextResponse.json({error:"This payment would exceed the project total after other verified payments"},{status:400});
    return NextResponse.json({error:"Could not update payment. Refresh and try again."},{status:500});
  }
}

export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){
  if(!(await getSessionAdminId()))return NextResponse.json({error:"Unauthorized"},{status:401});
  const id=(await params).id;
  const p=await prisma.payment.findUnique({where:{id}});
  if(!p)return NextResponse.json({error:"Not found"},{status:404});
  await prisma.payment.delete({where:{id}});
  return NextResponse.json({ok:true});
}
