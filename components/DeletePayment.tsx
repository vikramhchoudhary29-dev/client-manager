"use client";
export default function DeletePayment({id}:{id:string}){
  async function remove(){
    if(!confirm("Delete this payment? This will recalculate the project received and outstanding amounts."))return;
    const r=await fetch(`/api/payments/${id}`,{method:"DELETE"});
    const d=await r.json();
    if(!r.ok)return alert(d.error||"Failed to delete payment");
    location.href="/payments";
  }
  return <button className="btn danger" onClick={remove}>Delete</button>;
}
