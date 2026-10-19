import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProjectFinancials } from "@/lib/finance";
import DeleteProject from "@/components/DeleteProject";
import WhatsAppButton from "@/components/WhatsAppButton";

export default async function ProjectPage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const project=await prisma.project.findUnique({where:{id},include:{client:true}});
  if(!project) notFound();
  const f=await getProjectFinancials(id);
  const paymentMessage = `Hi ${project.client.name},\n\nPayment update for your ${project.name} project.\n\nProject Amount: ₹${f.total.toLocaleString("en-IN")}\nTotal Received: ₹${f.received.toLocaleString("en-IN")}\nRemaining Amount: ₹${f.remaining.toLocaleString("en-IN")}\n\n${f.remaining>0?`Please complete the remaining payment here:\n${process.env.APP_URL || "http://localhost:3000"}/pay/project/${id}\n\n`:"Payment is fully received.\n\n"}Thank you,\n${(await prisma.setting.findUnique({where:{id:"default"}}))?.companyName || "My Business"}`;

  return <main className="container">
    <div className="row between"><div><h1>{project.name}</h1><div className="muted">{project.client.name} · {project.client.mobile}</div></div><div className="actions"><Link className="btn light" href={`/projects/${id}/edit`}>Edit</Link><DeleteProject id={id}/></div></div>
    <div className="grid grid-4">
      <div className="card"><div className="stat-label">Project Total</div><div className="stat-value">₹{f.total.toLocaleString("en-IN")}</div></div>
      <div className="card"><div className="stat-label">Advance Received</div><div className="stat-value">₹{f.advance.toLocaleString("en-IN")}</div></div>
      <div className="card"><div className="stat-label">Total Received</div><div className="stat-value">₹{f.received.toLocaleString("en-IN")}</div></div>
      <div className="card"><div className="stat-label">Outstanding</div><div className="stat-value">₹{f.remaining.toLocaleString("en-IN")}</div></div>
    </div>
    <div className="card" style={{marginTop:18}}>
      <div className="row between"><h2>Project & Client Details</h2><div className="actions"><Link className="btn" href={`/pay/project/${id}`}>Open Payment Page</Link>{f.remaining>0&&<WhatsAppButton mobile={project.client.mobile} message={paymentMessage} label="WhatsApp Payment"/>}</div></div>
      <p><b>Client:</b> {project.client.name}</p><p><b>Mobile:</b> {project.client.mobile}</p><p><b>Address:</b> {project.client.address || "—"}</p>
      <p><b>Technology:</b> {project.technologies || "—"}</p><p><b>Details:</b> {project.details || "—"}</p><p><b>Requirements:</b> {project.description || "—"}</p><p><b>Yearly Maintenance:</b> ₹{Number(project.maintenanceCharge).toLocaleString("en-IN")}</p><p><b>Maintenance Start Date:</b> {project.maintenanceStartDate ? new Date(project.maintenanceStartDate).toLocaleDateString("en-IN") : "—"}</p><p><b>Project Status:</b> {project.status.replaceAll("_"," ")}</p>
      <p><b>Payment Status:</b> <span className={`badge ${f.remaining===0?"success":f.received>0?"warn":"danger"}`}>{f.remaining===0?"FULLY PAID":f.received>0?"PARTIALLY PAID":"PAYMENT PENDING"}</span></p>
    </div>
    <div className="card" style={{marginTop:18}}>
      <div className="row between"><h2>Payment History</h2><Link className="btn light" href={`/projects/${id}/payments/new`}>+ Add Payment</Link></div>
      <div className="table-wrap"><table><thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Mode</th><th>Status</th><th>Notes</th></tr></thead><tbody>
      {f.payments.length===0?<tr><td colSpan={6} className="empty">No payments recorded yet.</td></tr>:f.payments.map(p=><tr key={p.id}><td>{new Date(p.paymentDate).toLocaleDateString("en-IN")}</td><td>{p.type === "ADVANCE" ? "Advance" : "Project Payment"}</td><td>₹{Number(p.amount).toLocaleString("en-IN")}</td><td>{p.mode}</td><td><span className={`badge ${p.status==="VERIFIED"?"success":p.status==="REJECTED"?"danger":"warn"}`}>{p.status}</span></td><td>{p.notes||"—"}</td></tr>)}
      </tbody></table></div>
    </div>
  </main>;
}
