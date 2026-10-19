import Link from "next/link";
import ReceiptPrintButton from "@/components/ReceiptPrintButton";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProjectFinancials } from "@/lib/finance";
import PaymentActions from "@/components/PaymentActions";
import WhatsAppButton from "@/components/WhatsAppButton";
import DeletePayment from "@/components/DeletePayment";

export default async function PaymentView({params}:{params:Promise<{id:string}>}){
  const p=await prisma.payment.findUnique({where:{id:(await params).id},include:{client:true,project:true}});
  if(!p)notFound();
  const f=await getProjectFinancials(p.projectId);
  const setting=await prisma.setting.findUnique({where:{id:"default"}});
  const company=setting?.companyName||"My Business";
  const receivedMessage=`Hi ${p.client.name},\n\nWe have received your ${p.type === "ADVANCE" ? "advance" : "payment"} of ₹${Number(p.amount).toLocaleString("en-IN")} for your ${p.project.name} project.\n\nProject Amount: ₹${f.total.toLocaleString("en-IN")}\nTotal Received: ₹${f.received.toLocaleString("en-IN")}\nRemaining Amount: ₹${f.remaining.toLocaleString("en-IN")}\n\nThank you,\n${company}`;
  return <main className="container receipt-page">
    <div className="row between"><div><h1>Payment</h1><div className="muted">{p.project.name}</div></div><div className="actions"><Link className="btn light" href="/payments">Back to Payments</Link><Link className="btn light" href={`/payments/${p.id}/edit`}>Edit</Link><DeletePayment id={p.id}/></div></div>
    <div className="grid grid-3">
      <div className="card"><div className="stat-label">Project Total</div><div className="stat-value">₹{f.total.toLocaleString("en-IN")}</div></div>
      <div className="card"><div className="stat-label">Total Received</div><div className="stat-value">₹{f.received.toLocaleString("en-IN")}</div></div>
      <div className="card"><div className="stat-label">Outstanding</div><div className="stat-value">₹{f.remaining.toLocaleString("en-IN")}</div></div>
    </div>
    <div className="card" style={{marginTop:18}}>
      <p><b>Client:</b> {p.client.name}</p><p><b>Mobile:</b> {p.client.mobile}</p><p><b>Project:</b> {p.project.name}</p><p><b>Payment Type:</b> {p.type === "ADVANCE" ? "Advance" : "Project Payment"}</p><p><b>Amount:</b> ₹{Number(p.amount).toLocaleString("en-IN")}</p><p><b>Date:</b> {new Date(p.paymentDate).toLocaleDateString("en-IN")}</p><p><b>Mode:</b> {p.mode}</p><p><b>Status:</b> <span className={`badge ${p.status==="VERIFIED"?"success":p.status==="REJECTED"?"danger":"warn"}`}>{p.status}</span></p><p><b>Notes:</b> {p.notes||"—"}</p>{p.proofUrl&&<p><b>Proof:</b> <a href={p.proofUrl} target="_blank" rel="noreferrer">View proof</a></p>}
      <div className="actions" style={{marginTop:16}}><WhatsAppButton mobile={p.client.mobile} message={receivedMessage} label="WhatsApp Payment Message"/>{p.status==="PENDING"&&<PaymentActions id={p.id}/>}</div>
    </div>
  <div className="print-hide" style={{marginTop:16}}><ReceiptPrintButton /></div></main>;
}
