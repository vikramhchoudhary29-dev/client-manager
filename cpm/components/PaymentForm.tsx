"use client";
import { useState } from "react";

export default function PaymentForm({projectId,clientId}:{projectId:string;clientId:string}) {
  const [error,setError]=useState("");
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setError("");
    const r=await fetch("/api/payments",{method:"POST",body:new FormData(e.currentTarget)});
    const d=await r.json();
    if(!r.ok)return setError(d.error||"Failed");
    location.href=`/projects/${projectId}`;
  }
  return <form className="card form" onSubmit={submit}>
    {error&&<div className="alert">{error}</div>}
    <input type="hidden" name="projectId" value={projectId}/><input type="hidden" name="clientId" value={clientId}/>
    <div className="form-grid">
      <div className="field"><label>Payment Type</label><select name="type" defaultValue="PROJECT_PAYMENT"><option value="ADVANCE">ADVANCE</option><option value="PROJECT_PAYMENT">PROJECT PAYMENT</option></select></div>
      <div className="field"><label>Amount *</label><input name="amount" type="number" min="0.01" step="0.01" required/></div>
      <div className="field"><label>Payment Date</label><input name="paymentDate" type="date" defaultValue={new Date().toISOString().slice(0,10)}/></div>
      <div className="field"><label>Payment Mode</label><select name="mode" defaultValue="UPI"><option>UPI</option><option>CASH</option><option>BANK_TRANSFER</option><option>CHEQUE</option></select></div>
      <div className="field"><label>Status</label><select name="status" defaultValue="VERIFIED"><option>VERIFIED</option><option>PENDING</option><option>REJECTED</option></select></div>
    </div>
    <div className="field"><label>Notes</label><textarea name="notes"/></div>
    <button className="btn" type="submit">Save Payment</button>
  </form>;
}
