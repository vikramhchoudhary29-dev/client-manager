import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getProjectFinancials } from "@/lib/finance";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({ include: { client: true }, orderBy: { createdAt: "desc" } });
  const rows = await Promise.all(projects.map(async (p) => ({ p, f: await getProjectFinancials(p.id) })));
  return (
    <main className="container">
      <div className="row between"><h1>Projects</h1><Link className="btn" href="/projects/new">+ Add Project</Link></div>
      <div className="card table-wrap">
        {rows.length === 0 ? <div className="empty">No projects yet.</div> : <table>
          <thead><tr><th>Project</th><th>Client</th><th>Total</th><th>Received</th><th>Remaining</th><th>Status</th><th></th></tr></thead>
          <tbody>{rows.map(({p,f}) => <tr key={p.id}>
            <td>{p.name}</td><td>{p.client.name}<br/><span className="muted">{p.client.mobile}</span></td>
            <td>₹{f.total.toLocaleString("en-IN")}</td><td>₹{f.received.toLocaleString("en-IN")}</td><td>₹{f.remaining.toLocaleString("en-IN")}</td>
            <td><span className="badge">{p.status.replaceAll("_"," ")}</span></td>
            <td><Link className="btn light" href={`/projects/${p.id}`}>View</Link></td>
          </tr>)}</tbody>
        </table>}
      </div>
    </main>
  );
}