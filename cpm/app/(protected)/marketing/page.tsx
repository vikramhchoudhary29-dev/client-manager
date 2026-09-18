import { prisma } from "@/lib/prisma";
import MarketingForm from "@/components/MarketingForm";

export default async function Marketing(){
 const [clients,templates]=await Promise.all([prisma.client.findMany({include:{projects:true},orderBy:{name:"asc"}}),prisma.marketingTemplate.findMany({orderBy:{name:"asc"}})]);
 return <main className="container"><h1>Marketing</h1><MarketingForm clients={JSON.parse(JSON.stringify(clients))} templates={JSON.parse(JSON.stringify(templates))}/></main>;
}