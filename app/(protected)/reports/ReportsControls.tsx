"use client";

import { useSearchParams } from "next/navigation";

export default function ReportsControls({ from, to }: { from: string; to: string }) {
  const params = useSearchParams();
  return (
    <div className="report-controls row" style={{ gap: 10, flexWrap: "wrap", alignItems: "end" }}>
      <form action="/reports" method="get" className="row" style={{ gap: 10, flexWrap: "wrap", alignItems: "end" }}>
        <div className="field" style={{ margin: 0 }}><label htmlFor="from">From date</label><input id="from" name="from" type="date" defaultValue={from} /></div>
        <div className="field" style={{ margin: 0 }}><label htmlFor="to">To date</label><input id="to" name="to" type="date" defaultValue={to} /></div>
        <button className="btn" type="submit">Apply filter</button>
        <a className="btn light" href="/reports">Clear</a>
      </form>
      <a className="btn light" href={`/api/reports${params.toString() ? `?${params.toString()}` : ""}`}>Export CSV</a>
      <button className="btn" type="button" onClick={() => window.print()}>Export PDF / Print</button>
    </div>
  );
}
