import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAdminId } from "@/lib/auth";
export async function PUT(request:Request){
 if(!(await getSessionAdminId()))return NextResponse.json({error:"Unauthorized"},{status:401});
 const f=await request.formData();await prisma.setting.upsert({where:{id:"default"},update:{companyName:String(f.get("companyName")||"").trim(),upiId:String(f.get("upiId")||"").trim(),payeeName:String(f.get("payeeName")||"").trim()},create:{id:"default",companyName:String(f.get("companyName")||"My Business"),upiId:String(f.get("upiId")||""),payeeName:String(f.get("payeeName")||"My Business")}});return NextResponse.json({ok:true});
}