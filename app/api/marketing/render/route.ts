import { NextResponse } from "next/server";
import { getSessionAdminId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildTemplate } from "@/lib/templates";
export async function GET(request:Request){
 if(!(await getSessionAdminId()))return NextResponse.json({error:"Unauthorized"},{status:401});
 const u=new URL(request.url);const projectId=u.searchParams.get("projectId");const templateId=u.searchParams.get("templateId");if(!projectId||!templateId)return NextResponse.json({error:"Missing values"},{status:400});
 const t=await prisma.marketingTemplate.findUnique({where:{id:templateId}});if(!t)return NextResponse.json({error:"Template not found"},{status:404});
 return NextResponse.json({message:await buildTemplate(t.content,projectId)});
}