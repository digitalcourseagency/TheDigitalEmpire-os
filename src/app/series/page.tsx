"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus } from "lucide-react";
export default function SeriesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  async function load() { setLoading(true); const { data: d } = await supabase.from("series").select("*").order("created_at", { ascending: false }); setData(d || []); setLoading(false); }
  useEffect(() => { load(); }, []);
  return (<div style={{ maxWidth: 900, animation: "slideUp 0.4s ease" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}><h1 className="font-display" style={{ fontSize: 34, fontWeight: 400 }}>Series</h1><button className="btn btn-primary"><Plus size={14} /> New Series</button></div>{loading ? <div className="skeleton" style={{ height: 200 }} /> : data.length === 0 ? (<div style={{ textAlign: "center", padding: "64px 0" }}><div style={{ fontSize: 13, color: "#9A9188", marginBottom: 12 }}>No series yet.</div><button className="btn btn-primary">Create First Series</button></div>) : (<div style={{ display: "grid", gap: 12 }}>{data.map(s => <div key={s.id} className="card"><div style={{ fontSize: 15, fontWeight: 500 }}>{s.name}</div><div style={{ fontSize: 12, color: "#9A9188", marginTop: 4 }}>{s.platform}</div></div>)}</div>)}</div>);
}