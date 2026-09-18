import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PaymentForm from "@/components/PaymentForm";

export default async function NewPayment({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const project=await prisma.project.findUnique({where:{id},include:{client:true}});
  if(!project) notFound();
  return <main className="container"><h1>Add Payment — {project.name}</h1><PaymentForm projectId={id} clientId={project.clientId}/></main>;
}