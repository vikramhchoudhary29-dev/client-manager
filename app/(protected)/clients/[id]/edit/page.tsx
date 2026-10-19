import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClientForm from "@/components/ClientForm";
import DeleteClient from "@/components/DeleteClient";
export default async function EditClientPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const client=await prisma.client.findUnique({where:{id}});if(!client)notFound();return <main className="container"><div className="row between"><h1>Edit Client</h1><div className="actions"><Link className="btn light" href={`/clients/${id}`}>Cancel</Link><DeleteClient id={id} name={client.name}/></div></div><ClientForm client={client}/></main>}
