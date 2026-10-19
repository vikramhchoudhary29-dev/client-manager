"use client";
import { useState } from "react";
export default function SettingsForm({setting}:any){
 const [msg,setMsg]=useState("");
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setMsg("");const r=await fetch("/api/settings",{method:"PUT",body:new FormData(e.currentTarget)});const d=await r.json();if(!r.ok)return setMsg(d.error||"Failed");setMsg("Settings saved.");}
 return <form className="card form" onSubmit={submit}>{msg&&<div className="success-box">{msg}</div>}<div className="field"><label>Company / Business Name</label><input name="companyName" defaultValue={setting?.companyName||""} required/></div><div className="field"><label>UPI ID</label><input name="upiId" placeholder="example@upi" defaultValue={setting?.upiId||""}/></div><div className="field"><label>UPI Payee / Display Name</label><input name="payeeName" defaultValue={setting?.payeeName||""} required/></div><button className="btn" type="submit">Save Settings</button></form>;
}