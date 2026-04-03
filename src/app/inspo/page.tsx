"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, X, ExternalLink, Pencil, Trash2 } from "lucide-react";

const BRANDS = [
  { id: "AC", label: "Ash Couture", color: "#2C2C2A" },
  { id: "DCA", label: "DCA", color: "#C8432A" },
  { id: "DES", label: "Digital Expert School", color: "#185FA5" },
  { id: "OOG", label: "Opulent Outreach", color: "#B89A5A" },
  { id: "LLL", label: "Lux Leisure", color: "#888480" },
];

const CATEGORIES = ["Lifestyle", "Digital CEO", "Aesthetic", "Content Style", "Digital Education", "Agency", "NYC Creator", "Luxury Brand", "Other"];

function empty() {
  return { title: "", account_handle: "", account_url: "", category: "Lifestyle", my_brand: "AC", why_follow: "", what_to_pull: "", priority: "High" };
}

export default function InspoPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<any>(empty());
  const [saving, setSaving] = useState(false);
  const [filterBrand, setFilterBrand] = useState("All");

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("inspo").select("*").order("my_brand").order("created_at");
    setAccounts(data || []);
    setLoading(false);
  }

  function startNew() { setEditItem(null); setForm(empty()); setOpenModal(true); }

  function startEdit(a: any) {
    setEditItem(a);
    setForm({ title: a.title || "", account_handle: a.account_handle || "", account_url: a.account_url || "", category: a.category || "Lifestyle", my_brand: a.my_brand || "AC", why_follow: a.why_follow || "", what_to_pull: a.what_to_pull || "", priority: a.priority || "High" });
    setOpenModal(true);
  }

  async function save() {
    if (!form.title) return;
    setSaving(true);
    const payload = { title: form.title, account_handle: form.account_handle || null, account_url: form.account_url || null, category: form.category, my_brand: form.my_brand, why_follow: form.why_follow || null, what_to_pull: form.what_to_pull || null, priority: form.priority };
    if (editItem) { await supabase.from("inspo").update(payload).eq("id", editItem.id); }
    else { await supabase.from("inspo").insert(payload); }
    setSaving(false); setOpenModal(false); load();
  }

  async function del(id: string) {
    if (!confirm("Remove this account?")) return;
    await supabase.from("inspo").delete().eq("id", id);
    load();
  }

  const filtered = filterBrand === "All" ? accounts : accounts.filter(a => a.my_brand === filterBrand);
  const grouped = BRANDS.reduce((acc, b) => {
    acc[b.id] = filtered.filter(a => a.my_brand === b.id);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: 34, fontWeight: 400 }}>Inspo Accounts</h1>
          <div style={{ fontSize: 13, color: "#9A9188", marginTop: 2 }}>Accounts you study for creative direction - by brand</div>
        </div>
        <button className="btn btn-primary" onClick={startNew}><Plus size={14}/> Add Account</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {["All", ...BRANDS.map(b => b.id)].map(b => {
          const brand = BRANDS.find(x => x.id === b);
          return (
            <button key={b} onClick={() => setFilterBrand(b)} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 100, border: "1px solid", borderColor: filterBrand === b ? (brand?.color || "#1A1917") : "#EDE8E1", background: filterBrand === b ? (brand?.color || "#1A1917") : "transparent", color: filterBrand === b ? "#fff" : "#9A9188", cursor: "pointer", fontFamily: "Jost,sans-serif" }}>
              {b === "All" ? "All Brands" : brand?.label || b}
            </button>
          );
        })}
      </div>

      {loading ? <div className="skeleton" style={{ height: 300 }}/> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {BRANDS.map(brand => {
            const list = grouped[brand.id];
            if (!list || list.length === 0) return null;
            return (
              <div key={brand.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: brand.color }}/>
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: brand.color }}>@{brand.id === "AC" ? "iamashcouture" : brand.id === "DCA" ? "digitalcourseagency" : brand.id === "DES" ? "digitalexpertschool" : brand.id === "OOG" ? "opulentoutreachgroup" : "luxleisurelifestyle"}</span>
                  <span style={{ fontSize: 11, color: "#B8B0A5" }}>{lj…t.length} account{list.length !== 1 ? "s" : ""}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {list.map((a: any) => (
                    <div key={a.id} className="card" style={{ position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{a.title}</div>
                          {a.account_handle && (
                            <div style={{ fontSize: 12, color: "#9A9188" }}>{a.account_handle}</div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          {a.account_url && (
                            <a href={a.account_url} target="_blank" rel="noopener noreferrer" style={{ color: "#B89A5A" }} onClick={e => e.stopPropagation()}>
                              <ExternalLink size={13}/>
                            </a>
                          )}
                          <button onClick={() => startEdit(a)} style={{ background: "none", border: "none", cursor: "pointer", color: "#B89A5A" }}><Pencil size={13}/></button>
                          <button onClick={() => del(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#B8B0A5" }}><Trash2 size={13}/></button>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 100, background: "#EDE8E1", color: "#7D7470" }}>{a.category}</span>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 100, background: brand.color + "22", color: brand.color }}>{a.my_brand}</span>
                      </div>
                      {a.why_follow && (
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 10, textTransform: "uppercase", color: "#B8B0A5", marginBottom: 2 }}>Why I Follow</div>
                          <div style={{ fontSize: 12, color: "#444140" }}>{a.why_follow}</div>
                        </div>
                      )}
                      {a.what_to_pull && (
                        <div>
                          <div style={{ fontSize: 10, textTransform: "uppercase", color: "#B8B0A5", marginBottom: 2 }}>What to Pull</div>
                          <div style={{ fontSize: 12, color: "#7D7470", fontStyle: "italic" }}>{a.what_to_pull}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <div style={{ fontSize: 13, color: "#9A9188", marginBottom: 12 }}>No inspo accounts yet.</div>
              <button className="btn btn-primary" onClick={startNew}>Add Your First Account</button>
            </div>
          )}
        </div>
      )}

      {openModal && (
        <div className="modal-overlay" onClick={() => setOpenModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 22 }}>{editItem ? "Edit Account" : "Add Inspo Account"}</div>
              <button onClick={() => setOpenModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18}/></button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, textTransform: "uppercase", color: "#9A9188", display: "block", marginBottom: 4 }}>Name / Label</label>
                <input className="input" placeholder="e.g. Lazy Millionaire" value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))}/>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, textTransform: "uppercase", color: "#9A9188", display: "block", marginBottom: 4 }}>Handle</label>
                  <input className="input" placeholder="@handle" value={form.account_handle} onChange={e => setForm((f: any) => ({ ...f, account_handle: e.target.value }))}/>
                </div>
                <div>
                  <label style={{ fontSize: 11, textTransform: "uppercase", color: "#9A9188", display: "block", marginBottom: 4 }}>My Brand</label>
                  <select className="input" value={form.my_brand} onChange={e => setForm((f: any) => ({ ...f, my_brand: e.target.value }))}>
                    {BRANDS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, textTransform: "uppercase", color: "#9A9188", display: "block", marginBottom: 4 }}>Instagram URL</label>
                <input className="input" placeholder="https://instagram.com/..." value={form.account_url} onChange={e => setForm((f: any) => ({ ...f, account_url: e.target.value }))}/>
              </div>
              <div>
                <label style={{ fontSize: 11, textTransform: "uppercase", color: "#9A9188", display: "block", marginBottom: 4 }}>Category</label>
                <select className="input" value={form.category} onChange={e => setForm((f: any) => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, textTransform: "uppercase", color: "#9A9188", display: "block", marginBottom: 4 }}>Why I Follow This Account</label>
                <textarea className="input" rows={2} placeholder="What draws you to this account?" value={form.why_follow} onChange={e => setForm((f: any) => ({ ...f, why_follow: e.target.value }))}/>
              </div>
              <div>
                <label style={{ fontSize: 11, textTransform: "uppercase", color: "#9A9188", display: "block", marginBottom: 4 }}>What to Pull From Them</label>
                <textarea className="input" rows={2} placeholder="Hook style, aesthetic, editing, cadence, tone..." value={form.what_to_pull} onChange={e => setForm((f: any) => ({ ...f, what_to_pull: e.target.value }))}/>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setOpenModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving..." : editItem ? "Update" : "Add Account"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
