"use client";
import { useState } from "react";

export default function EditProjectForm({project}:any){
  const [error,setError]=useState("");
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setError("");
    const r=await fetch(`/api/projects/${project.id}`,{method:"PUT",body:new FormData(e.currentTarget)});
    const d=await r.json();
    if(!r.ok)return setError(d.error||"Failed");
    location.href=`/projects/${project.id}`;
  }
  return <form className="card form" onSubmit={submit}>
    {error&&<div className="alert">{error}</div>}
    <h2>Client</h2>
    <div className="form-grid">
      <div className="field"><label>Name</label><input name="clientName" defaultValue={project.client.name} required/></div>
      <div className="field"><label>Mobile</label><input name="mobile" defaultValue={project.client.mobile} required/></div>
    </div>
    <div className="field"><label>Address</label><textarea name="address" defaultValue={project.client.address||""}/></div>
    <h2>Project</h2>
    <div className="form-grid">
      <div className="field"><label>Name</label><input name="name" defaultValue={project.name} required/></div>
      <div className="field"><label>Technology</label><input name="technologies" defaultValue={project.technologies||""}/></div>
      <div className="field"><label>Maintenance Charge</label><input name="maintenanceCharge" type="number" min="0" step="0.01" defaultValue={Number(project.maintenanceCharge)}/></div>
      <div className="field"><label>Total Amount</label><input name="totalAmount" type="number" min="0" step="0.01" defaultValue={Number(project.totalAmount)} required/></div>
      <div className="field"><label>Status</label><select name="status" defaultValue={project.status}><option>PLANNING</option><option>IN_PROGRESS</option><option>ON_HOLD</option><option>COMPLETED</option><option>CANCELLED</option></select></div>
      <div className="field"><label>Completion Date</label><input name="completionDate" type="date" defaultValue={project.completionDate ? new Date(project.completionDate).toISOString().slice(0,10) : ""}/></div>
    </div>
    <div className="field"><label>Project Details</label><textarea name="details" defaultValue={project.details||""}/></div>
    <div className="field"><label>Description / Requirements</label><textarea name="description" defaultValue={project.description||""}/></div>
    <div className="muted">Advance and other received payments are managed from the payment history. This prevents the same payment from being counted twice.</div>
    <button className="btn" type="submit">Save Changes</button>
  </form>;
}
