"use client";
export default function DeleteProject({id}:{id:string}) {
  async function del(){ if(!confirm("Delete this project and its payment records?")) return; const r=await fetch(`/api/projects/${id}`,{method:"DELETE"}); if(r.ok) location.href="/projects"; }
  return <button className="btn danger" onClick={del}>Delete</button>;
}