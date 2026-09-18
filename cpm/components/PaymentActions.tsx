"use client";
export default function PaymentActions({id}:{id:string}){
 async function act(status:string){const r=await fetch(`/api/payments/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});if(r.ok)location.reload();else alert((await r.json()).error||"Failed");}
 return <div className="actions"><button className="btn success" onClick={()=>act("VERIFIED")}>Verify Payment</button><button className="btn danger" onClick={()=>act("REJECTED")}>Reject Payment</button></div>;
}