"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Flame } from "lucide-react";
export default function InspoPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  async function load() { setLoading(true); const { data } = await supabase.from("inspo").select("*").order("created_at", { ascending: false }); setItems(data || []); setLoading(false); }
  useEffect(() => { load(); }, []);
  return (<div style={{ maxWidth: 1100, animation: "slideUp 0.4s ease" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}><h1 className="font-display" style={{ fontSize: 34, fontWeight: 400 }}>Inspo Vault</h1><button className="btn btn-primary" onClick={() => {}}><Plus size={14} /> Save Inspo</button></div>{loading ? <div className="skeleton" style={{ height: 200 }} /> : items.length === 0 ? (<div style={{ textAlign: "center", padding: "64px 0" }}><Flame size={32} color="#B8B0A5" style={{ margin: "0 auto 12px" }} /><div style={{ fontSize: 13, color: "#9A9188", marginBottom: 12 }}>No inspo saved yet.</div><button className="btn btn-primary">Save First Inspo</button></div>) : (<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>{items.map(i => (<div key={i.id} className="card" style={{ borderTop: "3px solid #B89A5A" }}><div style={{ fontSize: 13, fontWeight: 400 }}>{i.title}</div>{i.source_account && <div style={{ fontSize: 11, color: "#9A9188", marginTop: 4 }}>{i.source_account}</div>}</div>))}</div>)}</div>);
}