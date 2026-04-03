"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, X, ChevronDown, ChevronUp, Trash2, Pencil } from "lucide-react";

const BRANDS = [
  { id: "20e8bb0e-29fd-492e-ad91-2beb239e4b0f", abbr: "AC", color: "#2C2C2A" },
  { id: "caa9919a-5fe0-4e67-844a-fd75f3170516", abbr: "DCA", color: "#C8432A" },
  { id: "ba48df91-58dc-4471-93f4-1c2a9ba69d35", abbr: "DES", color: "#185FA5" },
  { id: "a80ef03f-697b-47da-9c73-81b9b4d2717e", abbr: "LLL", color: "#888480" },
  { id: "f4aec731-0842-493e-b17f-56e5265318ac", abbr: "OOG", color: "#B89A5A" },
  { id: "41d737ec-4a5a-425c-9f1e-ad509988c3d8", abbr: "TDI", color: "#534AB7" },
];
const FUNNELS = ["Book a Call","Free Community","Webinar","Email List","Stan Store","Sales Page","ManyChat DM","Other"];
const POST_TYPES = ["Reel","Carousel","Static","Story","Live","TikTok","YouTube Short","Email","Text Post"];
const PHASES = ["Pre-Launch","Launch","Post-Launch"];
const PHASE_COLORS: Record<string,string> = { "Pre-Launch":"#185FA5", "Launch":"#C8432A", "Post-Launch":"#B89A5A" };
const PHASE_DESC: Record<string,string> = { "Pre-Launch":"Warm up your audience", "Launch":"Sell and promote", "Post-Launch":"Keep driving conversions" };
const STATUS_COLOR: Record<string,string> = { Planning:"#EDE8E1", Warmup:"#DBEAFE", Launch:"#FEE2E2", "Open Cart":"#FEF3C7", Closed:"#D1FAE5" };

function emptyLaunch() {
  return { name:"", brand_id:"", offer:"", start_date:"", end_date:"", revenue_goal:"", revenue_closed:"0", leads_generated:"0", conversions:"0", status:"Planning", manychat_keyword:"", landing_page_url:"" };
}
function emptyPost() {
  return { phase:"Pre-Launch", content_type:"Reel", topic:"", cta:"", funnel:"Book a Call", purpose:"", platform:"Instagram", publish_date:"" };
}

export default function LaunchesPage() {
  const [launches, setLaunches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);
  const [editLaunch, setEditLaunch] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyLaunch());
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string|null>(null);
  const [posts, setPosts] = useState<Record<string,any[]>>({});
  const [openPost, setOpenPost] = useState<string|null>(null);
  const [postForm, setPostForm] = useState<any>(emptyPost());
  const [editPost, setEditPost] = useState<any>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("launches").select("*").order("created_at", { ascending: false });
    setLaunches(data || []);
    setLoading(false);
  }

  async function loadPosts(lid: string) {
    const { data } = await supabase.from("launch_posts").select("*").eq("launch_id", lid).order("phase").order("publish_date");
    setPosts(p => ({ ...p, [lid]: data || [] }));
  }

  async function toggleExpand(lid: string) {
    if (expanded === lid) { setExpanded(null); }
    else { setExpanded(lid); if (!posts[lid]) await loadPosts(lid); }
  }

  function startNew() { setEditLaunch(null); setForm(emptyLaunch()); setOpenNew(true); }

  function startEdit(l: any) {
    setEditLaunch(l);
    setForm({ name:l.name||"", brand_id:l.brand_id||"", offer:l.offer||"", start_date:l.launch_date?.split("T")[0]||"", end_date:l.end_date?.split("T")[0]||"", revenue_goal:String(l.revenue_goal||""), revenue_closed:String(l.revenue_closed||0), leads_generated:String(l.leads_generated||0), conversions:String(l.conversions||0), status:l.status||"Planning", manychat_keyword:l.manychat_keyword||"", landing_page_url:l.landing_page_url||"" });
    setOpenNew(true);
  }

  async function saveLaunch() {
    if (!form.name) return;
    setSaving(true);
    const n = (s: string) => Number(s) || 0;
    const payload = { name:form.name, brand_id:form.brand_id||null, offer:form.offer||null, launch_date:form.start_date||null, end_date:form.end_date||null, revenue_goal:form.revenue_goal ? n(form.revenue_goal) : null, revenue_closed:n(form.revenue_closed), leads_generated:n(form.leads_generated), conversions:n(form.conversions), status:form.status, manychat_keyword:form.manychat_keyword||null, landing_page_url:form.landing_page_url||null };
    if (editLaunch) { await supabase.from("launches").update(payload).eq("id", editLaunch.id); }
    else { await supabase.from("launches").insert(payload); }
    setSaving(false); setOpenNew(false); load();
  }

  async function delLaunch(id: string) {
    if (!confirm("Delete this launch and all its content posts?")) return;
    await supabase.from("launches").delete().eq("id", id);
    load();
  }

  async function savePost(lid: string) {
    if (!postForm.topic) return;
    setSaving(true);
    const payload = { launch_id:lid, phase:postForm.phase, content_type:postForm.content_type, topic:postForm.topic, cta:postForm.cta||null, funnel:postForm.funnel||null, purpose:postForm.purpose||null, platform:postForm.platform||null, publish_date:postForm.publish_date||null };
    if (editPost) { await supabase.from("launch_posts").update(payload).eq("id", editPost.id); }
    else { await supabase.from("launch_posts").insert(payload); }
    setSaving(false); setOpenPost(null); setEditPost(null); setPostForm(emptyPost());
    await loadPosts(lid);
  }

  async function delPost(lid: string, pid: string) {
    await supabase.from("launch_posts").delete().eq("id", pid);
    await loadPosts(lid);
  }

  function startEditPost(post: any) {
    setEditPost(post);
    setPostForm({ phase:post.phase||"Pre-Launch", content_type:post.content_type||"Reel", topic:post.topic||"", cta:post.cta||"", funnel:post.funnel||"Book a Call", purpose:post.purpose||"", platform:post.platform||"Instagram", publish_date:post.publish_date?.split("T")[0]||"" });
    setOpenPost(post.launch_id);
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:34, fontWeight:400 }}>Launch Campaigns</h1>
          <div style={{ fontSize:13, color:"#9A9188", marginTop:2 }}>{launches.length} launches</div>
        </div>
        <button className="btn btn-primary" onClick={startNew}><Plus size={14}/> New Launch</button>
      </div>

      {loading ? <div className="skeleton" style={{ height:200 }}/> : launches.length === 0 ? (
        <div style={{ textAlign:"center", padding:"64px 0" }}>
          <div style={{ fontSize:13, color:"#9A9188", marginBottom:12 }}>No launches yet.</div>
          <button className="btn btn-primary" onClick={startNew}>Plan Your First Launch</button>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {launches.map((l: any) => {
            const brand = BRANDS.find(b => b.id === l.brand_id);
            const lp = posts[l.id] || [];
            const grouped = PHASES.reduce((a, p) => { a[p] = lp.filter(x => x.phase === p); return a; }, {} as Record<string,any[]>);
            const isOpen = expanded === l.id;
            const pct = l.revenue_goal > 0 ? Math.min(100, Math.round(((l.revenue_closed||0) / l.revenue_goal) * 100)) : 0;
            return (
              <div key={l.id} className="card" style={{ padding:0, overflow:"hidden" }}>
                <div style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={() => toggleExpand(l.id)}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                      <span style={{ fontWeight:500, fontSize:15 }}>{l.name}</span>
                      {brand && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:100, background:brand.color+"22", color:brand.color }}>{brand.abbr}</span>}
                      <span style={{ fontSize:11, padding:"2px 8px", borderRadius:100, background:STATUS_COLOR[l.status]||"#EDE8E1", color:"#7D7470" }}>{l.status}</span>
                    </div>
                    <div style={{ display:"flex", gap:16, fontSize:12, color:"#9A9188", flexWrap:"wrap" }}>
                      {l.offer && <span>{l.offer}</span>}
                      {l.launch_date && <span>Start: {new Date(l.launch_date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>}
                      {l.end_date && <span>End: {new Date(l.end_date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>}
                      {l.revenue_goal && <span>Goal: ${(l.revenue_goal||0).toLocaleString()}</span>}
                      {(l.revenue_closed||0) > 0 && <span style={{ color:"#2C9D6A" }}>Closed: ${(l.revenue_closed).toLocaleString()}</span>}
                      {(l.leads_generated||0) > 0 && <span>Leads: {l.leads_generated}</span>}
                      {(l.conversions||0) > 0 && <span>Converts: {l.conversions}</span>}
                    </div>
                    {l.revenue_goal > 0 && (
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8 }}>
                        <div className="progress-bar" style={{ flex:1, maxWidth:300 }}><div className="progress-fill" style={{ width:pct+"%", background:brand?.color||"#B89A5A" }}/></div>
                        <span style={{ fontSize:11, color:"#9A9188" }}>{pct}%</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <button onClick={e => { e.stopPropagation(); startEdit(l); }} style={{ background:"none", border:"none", cursor:"pointer", color:"#B89A5A" }}><Pencil size={14}/></button>
                    <button onClick={e => { e.stopPropagation(); delLaunch(l.id); }} style={{ background:"none", border:"none", cursor:"pointer", color:"#B8B0A5" }}><Trash2 size={14}/></button>
                    {isOpen ? <ChevronUp size={16} color="#9A9188"/> : <ChevronDown size={16} color="#9A9188"/>}
                  </div>
                </div>
                {isOpen && (
                  <div style={{ borderTop:"1px solid #F7F4F0", padding:"20px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                      <div style={{ fontFamily:"Georgia,serif", fontSize:16 }}>Content Plan</div>
                      <button className="btn btn-primary" style={{ fontSize:12 }} onClick={() => { setOpenPost(l.id); setEditPost(null); setPostForm(emptyPost()); }}><Plus size={12}/> Add Post</button>
                    </div>
                    {lp.length === 0 ? (
                      <div style={{ textAlign:"center", padding:"24px 0", color:"#9A9188", fontSize:13 }}>No content planned yet. Add posts to map out this launch.</div>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                        {PHASES.map(phase => grouped[phase]?.length > 0 && (
                          <div key={phase}>
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                              <div style={{ width:10, height:10, borderRadius:"50%", background:PHASE_COLORS[phase] }}/>
                              <span style={{ fontSize:12, fontWeight:600, color:PHASE_COLORS[phase], textTransform:"uppercase", letterSpacing:"0.06em" }}>{phase}</span>
                              <span style={{ fontSize:11, color:"#9A9188" }}>- {PHASE_DESC[phase]}</span>
                              <span style={{ fontSize:11, color:"#B8B0A5", marginLeft:"auto" }}>{grouped[phase].length} post{grouped[phase].length !== 1 ? "s" : ""}</span>
                            </div>
                            <div style={{ display:"grid", gap:8 }}>
                              {grouped[phase].map((post: any) => (
                                <div key={post.id} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", background:"#F7F4F0", borderRadius:8, borderLeft:"3px solid "+PHASE_COLORS[phase] }}>
                                  <div style={{ flex:1 }}>
                                    <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:6, flexWrap:"wrap" }}>
                                      <span style={{ fontSize:11, fontWeight:500, background:"#EDE8E1", padding:"2px 8px", borderRadius:100, color:"#7D7470" }}>{post.content_type}</span>
                                      <span style={{ fontSize:11, fontWeight:500, background:"#EDE8E1", padding:"2px 8px", borderRadius:100, color:"#7D7470" }}>{post.platform}</span>
                                      {post.funnel && <span style={{ fontSize:11, color:"#B89A5A", fontWeight:500 }}>to {post.funnel}</span>}
                                      {post.publish_date && <span style={{ fontSize:11, color:"#9A9188", marginLeft:"auto" }}>{new Date(post.publish_date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>}
                                    </div>
                                    <div style={{ fontSize:13, color:"#1A1917", fontWeight:500, marginBottom:4 }}>{post.topic}</div>
                                    {post.cta && <div style={{ fontSize:12, color:"#9A9188" }}>CTA: {post.cta}</div>}
                                    {post.purpose && <div style={{ fontSize:12, color:"#7D7470", fontStyle:"italic", marginTop:2 }}>{post.purpose}</div>}
                                  </div>
                                  <div style={{ display:"flex", gap:4 }}>
                                    <button onClick={() => startEditPost(post)} style={{ background:"none", border:"none", cursor:"pointer", color:"#B89A5A" }}><Pencil size={13}/></button>
                                    <button onClick={() => delPost(l.id, post.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#B8B0A5" }}><Trash2 size={13}/></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {openNew && (
        <div className="modal-overlay" onClick={() => setOpenNew(false)}>
          <div className="modal" style={{ maxWidth:580 }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontFamily:"Georgia,serif", fontSize:22 }}>{editLaunch ? "Edit Launch" : "New Launch Campaign"}</div>
              <button onClick={() => setOpenNew(false)} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={18}/></button>
            </div>
            <div style={{ display:"grid", gap:12 }}>
              <div>
                <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Launch Name</label>
                <input className="input" placeholder="DCA Spring Launch 2026" value={form.name} onChange={e => setForm((f: any) => ({ ...f, name:e.target.value }))}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Brand</label>
                  <select className="input" value={form.brand_id} onChange={e => setForm((f: any) => ({ ...f, brand_id:e.target.value }))}>
                    <option value="">Select brand</option>
                    {BRANDS.map(b => <option key={b.id} value={b.id}>{b.abbr}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Status</label>
                  <select className="input" value={form.status} onChange={e => setForm((f: any) => ({ ...f, status:e.target.value }))}>
                    <option>Planning</option><option>Warmup</option><option>Launch</option><option>Open Cart</option><option>Closed</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Offer</label>
                  <input className="input" placeholder="Teach and Be Rich" value={form.offer} onChange={e => setForm((f: any) => ({ ...f, offer:e.target.value }))}/>
                </div>
                <div>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Revenue Goal</label>
                  <input className="input" type="number" placeholder="30000" value={form.revenue_goal} onChange={e => setForm((f: any) => ({ ...f, revenue_goal:e.target.value }))}/>
                </div>
                <div>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Start Date</label>
                  <input className="input" type="date" value={form.start_date} onChange={e => setForm((f: any) => ({ ...f, start_date:e.target.value }))}/>
                </div>
                <div>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>End Date</label>
                  <input className="input" type="date" value={form.end_date} onChange={e => setForm((f: any) => ({ ...f, end_date:e.target.value }))}/>
                </div>
                <div>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Leads Generated</label>
                  <input className="input" type="number" placeholder="0" value={form.leads_generated} onChange={e => setForm((f: any) => ({ ...f, leads_generated:e.target.value }))}/>
                </div>
                <div>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Conversions</label>
                  <input className="input" type="number" placeholder="0" value={form.conversions} onChange={e => setForm((f: any) => ({ ...f, conversions:e.target.value }))}/>
                </div>
                <div>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Revenue Closed</label>
                  <input className="input" type="number" placeholder="0" value={form.revenue_closed} onChange={e => setForm((f: any) => ({ ...f, revenue_closed:e.target.value }))}/>
                </div>
                <div>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>ManyChat Keyword</label>
                  <input className="input" placeholder="digital stream" value={form.manychat_keyword} onChange={e => setForm((f: any) => ({ ...f, manychat_keyword:e.target.value }))}/>
                </div>
              </div>
              <div>
                <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Landing Page URL</label>
                <input className="input" placeholder="https://..." value={form.landing_page_url} onChange={e => setForm((f: any) => ({ ...f, landing_page_url:e.target.value }))}/>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setOpenNew(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveLaunch} disabled={saving}>{saving ? "Saving..." : editLaunch ? "Update" : "Create Launch"}</button>
            </div>
          </div>
        </div>
      )}

      {openPost && (
        <div className="modal-overlay" onClick={() => { setOpenPost(null); setEditPost(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontFamily:"Georgia,serif", fontSize:22 }}>{editPost ? "Edit Post" : "Add Content Post"}</div>
              <button onClick={() => { setOpenPost(null); setEditPost(null); }} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={18}/></button>
            </div>
            <div style={{ display:"grid", gap:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                <div>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Phase</label>
                  <select className="input" value={postForm.phase} onChange={e => setPostForm((f: any) => ({ ...f, phase:e.target.value }))}>
                    {PHASES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Post Type</label>
                  <select className="input" value={postForm.content_type} onChange={e => setPostForm((f: any) => ({ ...f, content_type:e.target.value }))}>
                    {POST_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Platform</label>
                  <select className="input" value={postForm.platform} onChange={e => setPostForm((f: any) => ({ ...f, platform:e.target.value }))}>
                    <option>Instagram</option><option>TikTok</option><option>YouTube</option><option>Email</option><option>All</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Topic / Hook</label>
                <input className="input" placeholder="What is this post about? What is the hook?" value={postForm.topic} onChange={e => setPostForm((f: any) => ({ ...f, topic:e.target.value }))}/>
              </div>
              <div>
                <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Funnel This Post Feeds Into</label>
                <select className="input" value={postForm.funnel} onChange={e => setPostForm((f: any) => ({ ...f, funnel:e.target.value }))}>
                  {FUNNELS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Call to Action</label>
                <input className="input" placeholder="Comment STREAM, DM me, Link in bio..." value={postForm.cta} onChange={e => setPostForm((f: any) => ({ ...f, cta:e.target.value }))}/>
              </div>
              <div>
                <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Purpose / Objective</label>
                <textarea className="input" rows={2} placeholder="Why are you posting this? What should the audience feel or do after seeing it?" value={postForm.purpose} onChange={e => setPostForm((f: any) => ({ ...f, purpose:e.target.value }))}/>
              </div>
              <div>
                <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Planned Publish Date</label>
                <input className="input" type="date" value={postForm.publish_date} onChange={e => setPostForm((f: any) => ({ ...f, publish_date:e.target.value }))}/>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
              <button className="btn btn-ghost" onClick={() => { setOpenPost(null); setEditPost(null); }}>Cancel</button>
              <button className="btn btn-primary" onClick={() => savePost(openPost!)} disabled={saving}>{saving ? "Saving..." : editPost ? "Update" : "Add Post"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
