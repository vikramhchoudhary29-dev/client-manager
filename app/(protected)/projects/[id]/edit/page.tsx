import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditProjectForm from "@/components/EditProjectForm";

export default async function EditProject({params}:{params:Promise<{id:string}>}) {
 const {id}=await params; const p=await prisma.project.findUnique({where:{id},include:{client:true}}); if(!p)notFound();
 return <main className="container"><h1>Edit Project</h1><EditProjectForm project={JSON.parse(JSON.stringify(p))}/></main>;
}