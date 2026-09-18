import Link from "next/link";
import { prisma } from "@/lib/prisma";
import WhatsAppButton from "@/components/WhatsAppButton";

export default async function PaymentsPage(){
  const [projects, payments, setting] = await Promise.all([
    prisma.project.findMany({include:{client:true,payments:true},orderBy:{createdAt:"desc"}}),
    prisma.payment.findMany({include:{client:true,project:true},orderBy:{createdAt:"desc"}}),
    prisma.setting.findUnique({where:{id:"default"}})
  ]);

  const rows=projects.map((project)=>{
    const verified=project.payments.filter(p=>p.status==="VERIFIED").reduce((s,p)=>s+Number(p.amount),0);
    const pending=project.payments.filter(p=>p.status==="PENDING").reduce((s,p)=>s+Number(p.amount),0);
    const advance=project.payments.filter(p=>p.status==="VERIFIED"&&p.type==="ADVANCE").reduce((s,p)=>s+Number(p.amount),0);
    return {project,total:Number(project.totalAmount),verified,remaining:Math.max(Number(project.totalAmount)-verified,0),pending,advance};
  });
  const total=rows.reduce((s,r)=>s+r.total,0);
  const received=rows.reduce((s,r)=>s+r.verified,0);
  const outstanding=Math.max(total-received,0);
  const pending=rows.reduce((s,r)=>s+r.pending,0);
  const company=setting?.companyName || "My Business";

  return <main className="container">
    <div className="row between"><div><h1>Payments</h1><div className="muted">Project-wise collection, outstanding amounts and payment history.</div></div></div>
    <div className="grid grid-4" style={{marginBottom:18}}>
      <div className="card"><div className="stat-label">Total Project Value</div><div className="stat-value">₹{total.toLocaleString("en-IN")}</div></div>
      <div className="card"><div className="stat-label">Total Received</div><div className="stat-value">₹{received.toLocaleString("en-IN")}</div></div>
      <div className="card"><div className="stat-label">Outstanding</div><div className="stat-value">₹{outstanding.toLocaleString("en-IN")}</div></div>
      <div className="card"><div className="stat-label">Pending Verification</div><div className="stat-value">₹{pending.toLocaleString("en-IN")}</div></div>
    </div>

    <div className="card" style={{marginBottom:18}}>
      <h2>Project Payment Summary</h2>
      <div className="table-wrap"><table><thead><tr><th>Project</th><th>Client</th><th>Total</th><th>Advance</th><th>Received</th><th>Outstanding</th><th>Pending</th><th></th></tr></thead><tbody>
        {rows.length===0?<tr><td colSpan={8} className="empty">No projects yet.</td></tr>:rows.map(({project,total,advance,verified,remaining,pending})=>{
          const message=`Hi ${project.client.name},\n\nPayment update for your ${project.name} project.\n\nProject Amount: ₹${total.toLocaleString("en-IN")}\nTotal Received: ₹${verified.toLocaleString("en-IN")}\nRemaining Amount: ₹${remaining.toLocaleString("en-IN")}\n\n${remaining>0?`Please complete the remaining payment here:\n${process.env.APP_URL || "http://localhost:3000"}/pay/project/${project.id}\n\n`:"Payment is fully received.\n\n"}Thank you,\n${company}`;
          return <tr key={project.id}><td>{project.name}</td><td>{project.client.name}<br/><span className="muted">{project.client.mobile}</span></td><td>₹{total.toLocaleString("en-IN")}</td><td>₹{advance.toLocaleString("en-IN")}</td><td>₹{verified.toLocaleString("en-IN")}</td><td><b>₹{remaining.toLocaleString("en-IN")}</b></td><td>{pending>0?`₹${pending.toLocaleString("en-IN")}`:"—"}</td><td><div className="actions"><Link className="btn light" href={`/projects/${project.id}`}>View</Link>{remaining>0&&<WhatsAppButton mobile={project.client.mobile} message={message} label="WhatsApp"/>}</div></td></tr>;
        })}
      </tbody></table></div>
    </div>

    <div className="card">
      <h2>Payment History</h2>
      <div className="table-wrap"><table><thead><tr><th>Date</th><th>Client</th><th>Project</th><th>Type</th><th>Amount</th><th>Mode</th><th>Status</th><th></th></tr></thead><tbody>
        {payments.length===0?<tr><td colSpan={8} className="empty">No payment entries yet. Add an advance or project payment from a project.</td></tr>:payments.map(p=><tr key={p.id}><td>{new Date(p.paymentDate).toLocaleDateString("en-IN")}</td><td>{p.client.name}</td><td>{p.project.name}</td><td>{p.type === "ADVANCE" ? "Advance" : "Project Payment"}</td><td>₹{Number(p.amount).toLocaleString("en-IN")}</td><td>{p.mode}</td><td><span className={`badge ${p.status==="VERIFIED"?"success":p.status==="REJECTED"?"danger":"warn"}`}>{p.status}</span></td><td><div className="actions"><Link className="btn light" href={`/payments/${p.id}`}>View</Link><WhatsAppButton mobile={p.client.mobile} message={`Hi ${p.client.name},\n\nWe have received your ${p.type === "ADVANCE" ? "advance" : "payment"} of ₹${Number(p.amount).toLocaleString("en-IN")} for your ${p.project.name} project.\n\nThank you,\n${company}`} label="WhatsApp"/></div></td></tr>)}
      </tbody></table></div>
    </div>
  </main>;
}
