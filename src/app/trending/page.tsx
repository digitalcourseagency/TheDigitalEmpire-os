"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, TrendingUp } from "lucide-react";
export default function TrendingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  async function load() { setLoading(true); const { data } = await supabase.from("trending").select("*").order("created_at", { ascending: false }); setItems(data || []); setLoading(false); }
  useEffect(() => { load(); }, []);
  return (<div style={{ maxWidth: 900, animation: "slideUp 0.4s ease" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}><h1 className="font-display" style={{ fontSize: 34, fontWeight: 400 }}>Trending Sounds</h1><button className="btn btn-primary"><Plus size={14} /> Log Sound</button></div>{loading ? <div className="skeleton" style={{ height: 200 }} /> : items.length === 0 ? (<div style={{ textAlign: "center", padding: "48px 0" }}><TrendingUp size={32} color="#B8B0A5" style={{ margin: "0 auto 12px" }} /><div style={{ fontSize: 13, color: "#9A9188", marginBottom: 12 }}>No trending sounds logged yet.</div></div>) : (<div className="card" style={{ padding: 0, overflow: "hidden" }}><table className="data-table"><thead><tr><th>Sound</th><th>Platform</th><th>Direction</th><th>Status</th></tr></thead><tbody>{items.map(i => <tr key={i.id}><td style={{ fontWeight: 500 }}>{i.sound_name}</td><td style={{ fontSize: 12 }}>{i.platform}</td><td style={{ fontSize: 12 }}>{i.trending_direction}</td><td style={{ fontSize: 11 }}>{i.status}</td></tr>)}</tbody></table></div>)}</div>);
}