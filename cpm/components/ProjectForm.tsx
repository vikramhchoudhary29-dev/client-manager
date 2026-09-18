"use client";
import { useState } from "react";

export default function ProjectForm() {
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError("");
    const res = await fetch("/api/projects", { method: "POST", body: new FormData(e.currentTarget) });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Could not save project");
    location.href = `/projects/${data.id}`;
  }
  return <form className="card form" onSubmit={submit}>
    {error && <div className="alert">{error}</div>}
    <h2>Client Details</h2>
    <div className="form-grid">
      <div className="field"><label>Client Name *</label><input name="clientName" required /></div>
      <div className="field"><label>Mobile Number *</label><input name="mobile" required /></div>
    </div>
    <div className="field"><label>Address</label><textarea name="address" /></div>
    <h2>Project Details</h2>
    <div className="form-grid">
      <div className="field"><label>Project Name *</label><input name="name" required /></div>
      <div className="field"><label>Technology Used</label><input name="technologies" placeholder="Next.js, PostgreSQL..." /></div>
      <div className="field"><label>Yearly Maintenance Charge</label><input name="maintenanceCharge" type="number" min="0" step="0.01" defaultValue="0" /></div>
      <div className="field"><label>Total Project Amount *</label><input name="totalAmount" type="number" min="0" step="0.01" required /></div>
      <div className="field"><label>Advance Received</label><input name="advanceReceived" type="number" min="0" step="0.01" defaultValue="0" /></div>
      <div className="field"><label>Advance Payment Mode</label><select name="advanceMode" defaultValue="UPI"><option>UPI</option><option>CASH</option><option>BANK_TRANSFER</option><option>CHEQUE</option></select></div>
      <div className="field"><label>Project Status</label><select name="status" defaultValue="PLANNING"><option>PLANNING</option><option>IN_PROGRESS</option><option>ON_HOLD</option><option>COMPLETED</option><option>CANCELLED</option></select></div>
      <div className="field"><label>Completion Date</label><input name="completionDate" type="date" /></div>
    </div>
    <div className="field"><label>Project Details</label><textarea name="details" /></div>
    <div className="field"><label>Description / Requirements</label><textarea name="description" /></div>
    <div className="row"><button className="btn" type="submit">Create Project</button></div>
  </form>;
}