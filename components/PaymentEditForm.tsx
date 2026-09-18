"use client";
import { useState } from "react";

export default function PaymentEditForm({payment}:any){
  const [error,setError]=useState("");
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setError("");
    const r=await fetch(`/api/payments/${payment.id}`,{method:"PUT",body:new FormData(e.currentTarget)});
    const d=await r.json();
    if(!r.ok)return setError(d.error||"Failed");
    location.href=`/payments/${payment.id}`;
  }
  return <form className="card form" onSubmit={submit}>
    {error&&<div className="alert">{error}</div>}
    <p><b>Client:</b> {payment.client.name}</p><p><b>Project:</b> {payment.project.name}</p>
    <div className="form-grid">
      <div className="field"><label>Payment Type</label><select name="type" defaultValue={payment.type}><option value="ADVANCE">ADVANCE</option><option value="PROJECT_PAYMENT">PROJECT PAYMENT</option></select></div>
      <div className="field"><label>Amount *</label><input name="amount" type="number" min="0.01" step="0.01" defaultValue={Number(payment.amount)} required/></div>
      <div className="field"><label>Payment Date</label><input name="paymentDate" type="date" defaultValue={new Date(payment.paymentDate).toISOString().slice(0,10)}/></div>
      <div className="field"><label>Payment Mode</label><select name="mode" defaultValue={payment.mode}><option>UPI</option><option>CASH</option><option>BANK_TRANSFER</option><option>CHEQUE</option></select></div>
      <div className="field"><label>Status</label><select name="status" defaultValue={payment.status}><option>VERIFIED</option><option>PENDING</option><option>REJECTED</option></select></div>
    </div>
    <div className="field"><label>Notes</label><textarea name="notes" defaultValue={payment.notes||""}/></div>
    <button className="btn" type="submit">Save Payment</button>
  </form>;
}
