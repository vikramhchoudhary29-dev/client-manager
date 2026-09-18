import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAdminId } from "@/lib/auth";

export async function POST(request:Request){
  if(!(await getSessionAdminId()))return NextResponse.json({error:"Unauthorized"},{status:401});
  const f=await request.formData();
  const projectId=String(f.get("projectId")||"");
  const clientId=String(f.get("clientId")||"");
  const amount=Number(f.get("amount"));
  const type=String(f.get("type")||"PROJECT_PAYMENT");
  const status=String(f.get("status")||"VERIFIED");
  if(!projectId||!clientId||!Number.isFinite(amount)||amount<=0)return NextResponse.json({error:"Invalid payment"},{status:400});
  if(!["ADVANCE","PROJECT_PAYMENT"].includes(type)||!["VERIFIED","PENDING","REJECTED"].includes(status))return NextResponse.json({error:"Invalid payment details"},{status:400});
  const project=await prisma.project.findUnique({where:{id:projectId}});
  if(!project||project.clientId!==clientId)return NextResponse.json({error:"Invalid project/client"},{status:400});
  const verified=(await prisma.payment.aggregate({where:{projectId,status:"VERIFIED"},_sum:{amount:true}}))._sum.amount;
  const remaining=Math.max(Number(project.totalAmount)-Number(verified||0),0);
  if(amount>remaining)return NextResponse.json({error:`Payment cannot exceed remaining amount ₹${remaining.toLocaleString("en-IN")}`},{status:400});
  await prisma.payment.create({data:{
    projectId,clientId,amount,
    paymentDate:f.get("paymentDate")?new Date(String(f.get("paymentDate"))):new Date(),
    mode:String(f.get("mode")||"UPI") as any,
    type:type as any,
    status:status as any,
    notes:String(f.get("notes")||"").trim()||null
  }});
  return NextResponse.json({ok:true});
}
