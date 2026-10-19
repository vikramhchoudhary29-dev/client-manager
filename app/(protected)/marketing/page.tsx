import { prisma } from "@/lib/prisma";
import MarketingForm from "@/components/MarketingForm";
import TemplateManager from "@/components/TemplateManager";

export default async function Marketing(){
 let maintenanceTemplate = await prisma.marketingTemplate.findFirst({where:{name:"Maintenance Charge Reminder"}});
 if (!maintenanceTemplate) {
   maintenanceTemplate = await prisma.marketingTemplate.create({data:{
     name:"Maintenance Charge Reminder",
     content:"Hello {{client_name}},\n\nThis is a reminder from Arvik Digital regarding the yearly website maintenance for *{{project_name}}*.\n\nYearly maintenance charge: ₹{{maintenance_charge}}\nMaintenance started: {{maintenance_start_date}}\nRenewal date: {{renewal_date}}\n\nPlease contact us if you have any questions. Thank you for choosing {{company_name}}."
   }});
 }
 const [clients,templates]=await Promise.all([prisma.client.findMany({include:{projects:true},orderBy:{name:"asc"}}),prisma.marketingTemplate.findMany({orderBy:{name:"asc"}})]);
 return <main className="container"><h1>Marketing</h1><MarketingForm clients={JSON.parse(JSON.stringify(clients))} templates={JSON.parse(JSON.stringify(templates))}/><TemplateManager initial={JSON.parse(JSON.stringify(templates))}/></main>;
}