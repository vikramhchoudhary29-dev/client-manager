import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PaymentEditForm from "@/components/PaymentEditForm";

export default async function EditPayment({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const payment=await prisma.payment.findUnique({where:{id},include:{client:true,project:true}});
  if(!payment)notFound();
  return <main className="container"><h1>Edit Payment</h1><PaymentEditForm payment={JSON.parse(JSON.stringify(payment))}/></main>;
}
