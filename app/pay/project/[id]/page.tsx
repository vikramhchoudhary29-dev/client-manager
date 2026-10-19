import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getProjectFinancials } from "@/lib/finance";

export default async function PayPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const p=await prisma.project.findUnique({where:{id},include:{client:true}});if(!p)notFound();
 const f=await getProjectFinancials(id);const setting=await prisma.setting.findUnique({where:{id:"default"}});
 const upi=setting?.upiId||"";const payee=setting?.payeeName||setting?.companyName||"My Business";
 const uri=upi?`upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(payee)}&am=${f.remaining.toFixed(2)}&cu=INR&tn=${encodeURIComponent(p.name)}`:"";
 const qr=uri?await QRCode.toDataURL(uri,{width:300,margin:2}):"";
 return <main className="hero-pay"><div className="pay-card"><h1>{setting?.companyName||"Payment"}</h1><p className="muted">{p.client.name}</p><h2>{p.name}</h2><div className="stat-label">AMOUNT DUE</div><div className="amount">₹{f.remaining.toLocaleString("en-IN")}</div>{f.remaining<=0?<div className="success-box">Payment fully received.</div>:!upi?<div className="alert">UPI payment is not configured yet.</div>:<><img className="qr" src={qr} alt="UPI QR Code"/><p><b>UPI ID:</b> {upi}</p><a className="btn" href={uri}>Pay with UPI App</a><p className="muted" style={{marginTop:20}}>After completing the payment, please send the payment screenshot to the concerned team for verification.</p></>}</div></main>;
}