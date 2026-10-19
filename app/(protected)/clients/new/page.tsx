import Link from "next/link";
import ClientForm from "@/components/ClientForm";
export default function NewClientPage(){return <main className="container"><div className="row between"><h1>Add Client</h1><Link className="btn light" href="/clients">Back to clients</Link></div><ClientForm/></main>}
