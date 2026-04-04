"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, X, ExternalLink, Pencil, Trash2, BookOpen, Users, Folder, Sparkles } from "lucide-react";

const BRANDS = [
  { id: "AC", label: "Ash Couture", color: "#2C2C2A" },
  { id: "DCA", label: "DCA", color: "#C8432A" },
  { id: "DES", label: "Digital Expert School", color: "#185FA5" },
  { id: "OOG", label: "Opulent Outreach", color: "#B89A5A" },
  { id: "LLL", label: "Lux Leisure", color: "#888480" },
];

const ACCOUNT_HANDLES: Record<string,string> = {
  AC: "iamashcouture", DCA: "digitalcourseagency",
  DES: "digitalexpertschool", OOG: "opulentoutreachgroup", LLL: "luxleisurelifestyle"
};

const CATEGORIES = ["Lifestyle","Digital CEO","Aesthetic","Content Style","Digital Education","Agency","NYC Creator","Luxury Brand","Other"];
const POST_TYPES = ["Reel","Carousel","Static","Story","TikTok","YouTube","Email","Other"];

function emptyAccount() {
  return { title:"", account_handle:"", account_url:"", category:"Lifestyle", my_brand:"AC", why_follow:"", what_to_pull:"", priority:"High" };
}
function emptyPost() {
  return { title:"", source_url:"", source_account:"", caption:"", hook:"", why_saved:"", content_type:"Reel", platform:"Instagram", brand:"AC" };
}

export default function InspoPage() {
  const [tab, setTab] = useState<"collections"|"accounts">("collections");
  const [collections, setCollections] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [posts, setPosts] = useState<Record<string,any[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeCollection, setActiveCollection] = useState<any>(null);
  const [openAccountModal, setOpenAccountModal] = useState(false);
  const [openPostModal, setOpenPostModal] = useState<string|null>(null);
  const [openStudy, setOpenStudy] = useState<any>(null);
  const [editAccount, setEditAccount] = useState<any>(null);
  const [editPost, setEditPost] = useState<any>(null);
  const [accountForm, setAccountForm] = useState<any>(emptyAccount());
  const [postForm, setPostForm] = useState<any>(emptyPost());
  const [studyText, setStudyText] = useState("");
  const [studyBrands, setStudyBrands] = useState<string[]>(["AC"]);
  const [studyResult, setStudyResult] = useState<any>(null);
  const [studyLoading, setStudyLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string|null>(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [{ data: cols }, { data: accs }] = await Promise.all([
      supabase.from("inspo_collections").select("*").order("created_at"),
      supabase.from("inspo").select("*").order("my_brand").order("created_at"),
    ]);
    setCollections(cols || []);
    setAccounts(accs || []);
    if (cols && cols.length > 0 && !activeCollection) setActiveCollection(cols[0]);
    setLoading(false);
  }

  async function loadCollectionPosts(colId: string) {
    const { data } = await supabase.from("inspo_posts").select("*").eq("collection_id", colId).order("created_at", { ascending: false });
    setPosts(p => ({ ...p, [colId]: data || [] }));
  }

  useEffect(() => {
    if (activeCollection) loadCollectionPosts(activeCollection.id);
  }, [activeCollection]);

  async function saveAccount() {
    if (!accountForm.title) return;
    setSaving(true);
    const payload = { title:accountForm.title, account_handle:accountForm.account_handle||null, account_url:accountForm.account_url||null, category:accountForm.category, my_brand:accountForm.my_brand, why_follow:accountForm.why_follow||null, what_to_pull:accountForm.what_to_pull||null, priority:accountForm.priority };
    if (editAccount) { await supabase.from("inspo").update(payload).eq("id", editAccount.id); }
    else { await supabase.from("inspo").insert(payload); }
    setSaving(false); setOpenAccountModal(false); setEditAccount(null); loadAll();
  }

  async function deleteAccount(id: string) {
    if (!confirm("Remove this account?")) return;
    await supabase.from("inspo").delete().eq("id", id);
    loadAll();
  }

  async function savePost() {
    if (!postForm.title || !openPostModal) return;
    setSaving(true);
    const payload = { collection_id:openPostModal, title:postForm.title, source_url:postForm.source_url||null, source_account:postForm.source_account||null, caption:postForm.caption||null, hook:postForm.hook||null, why_saved:postForm.why_saved||null, content_type:postForm.content_type, platform:postForm.platform, brand:postForm.brand };
    if (editPost) { await supabase.from("inspo_posts").update(payload).eq("id", editPost.id); }
    else { await supabase.from("inspo_posts").insert(payload); }
    setSaving(false); setOpenPostModal(null); setEditPost(null); setPostForm(emptyPost());
    loadCollectionPosts(openPostModal);
  }

  async function deletePost(colId: string, postId: string) {
    await supabase.from("inspo_posts").delete().eq("id", postId);
    loadCollectionPosts(colId);
  }

  async function runStudy() {
    if (!studyText || studyBrands.length === 0 || !openStudy) return;
    setStudyLoading(true); setStudyResult(null);
    const res = await fetch("https://oztzizcvebzpzdnhhigd.supabase.co/functions/v1/study-and-recreate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ original_post: studyText, account_handle: openStudy.account_handle, account_name: openStudy.title, brands: studyBrands }),
    });
    const data = await res.json();
    setStudyResult(data);
    setStudyLoading(false);
  }

  async function saveToIdeas(caption: string, brand: string) {
    await supabase.from("ideas").insert({ title: caption.slice(0, 120), brand_id: BRANDS.find(b=>b.id===brand)?.id || null, urgency: "Hot", notes: caption });
    setSaveSuccess(brand);
    setTimeout(() => setSaveSuccess(null), 2000);
  }

  const toggleBrand = (b: string) => setStudyBrands(prev => prev.includes(b) ? prev.filter(x=>x!==b) : [...prev, b]);
  const collectionPosts = activeCollection ? (posts[activeCollection.id] || []) : [];
  const brandGroups = BRANDS.reduce((acc, b) => { acc[b.id] = accounts.filter(a => a.my_brand === b.id); return acc; }, {} as Record<string,any[]>);

  return (
    <div style={{ maxWidth:1100 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:34, fontWeight:400 }}>Inspo Vault</h1>
          <div style={{ fontSize:13, color:"#9A9188", marginTop:2 }}>Save posts by collection or study accounts to recreate content</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {tab === "collections" && activeCollection && (
            <button className="btn btn-primary" onClick={() => { setEditPost(null); setPostForm(emptyPost()); setOpenPostModal(activeCollection.id); }}>
              <Plus size={14}/> Save Inspo Post
            </button>
          )}
          {tab === "accounts" && (
            <button className="btn btn-primary" onClick={() => { setEditAccount(null); setAccountForm(emptyAccount()); setOpenAccountModal(true); }}>
              <Plus size={14}/> Add Account
            </button>
          )}
        </div>
      </div>

      <div style={{ display:"flex", gap:4, marginBottom:24, borderBottom:"1px solid #EDE8E1", paddingBottom:0 }}>
        <button onClick={() => setTab("collections")} style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 16px", background:"none", border:"none", cursor:"pointer", fontSize:13, color:tab==="collections"?"#1A1917":"#9A9188", borderBottom:tab==="collections"?"2px solid #B89A5A":"2px solid transparent", fontWeight:tab==="collections"?500:400, fontFamily:"Jost,sans-serif" }}>
          <Folder size={14}/> Collections
        </button>
        <button onClick={() => setTab("accounts")} style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 16px", background:"none", border:"none", cursor:"pointer", fontSize:13, color:tab==="accounts"?"#1A1917":"#9A9188", borderBottom:tab==="accounts"?"2px solid #B89A5A":"2px solid transparent", fontWeight:tab==="accounts"?500:400, fontFamily:"Jost,sans-serif" }}>
          <Users size={14}/> Accounts
        </button>
      </div>

      {loading ? <div className="skeleton" style={{ height:300 }}/> : (
        <>
          {tab === "collections" && (
            <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:20 }}>
              <div>
                <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em", color:"#9A9188", marginBottom:8 }}>Collections</div>
                {collections.map(col => {
                  const brand = BRANDS.find(b => b.id === col.brand);
                  return (
                    <div key={col.id} onClick={() => setActiveCollection(col)} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:8, cursor:"pointer", background:activeCollection?.id===col.id?"#F5F1EC":"transparent", borderLeft:activeCollection?.id===col.id?`3px solid ${brand?.color||"#B89A5A"}`:"3px solid transparent", marginBottom:4 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:brand?.color||"#B89A5A", flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, color:"#1A1917", fontWeight:activeCollection?.id===col.id?500:400 }}>{col.name}</div>
                        <div style={{ fontSize:10, color:"#9A9188" }}>{col.brand}</div>
                      </div>
                      <div style={{ fontSize:10, color:"#B8B0A5" }}>{(posts[col.id]||[]).length}</div>
                    </div>
                  );
                })}
              </div>
              <div>
                {activeCollection && (
                  <>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                      <div>
                        <div style={{ fontFamily:"Georgia,serif", fontSize:20 }}>{activeCollection.name}</div>
                        {activeCollection.description && <div style={{ fontSize:12, color:"#9A9188", marginTop:2 }}>{activeCollection.description}</div>}
                      </div>
                    </div>
                    {collectionPosts.length === 0 ? (
                      <div style={{ textAlign:"center", padding:"48px 0", color:"#9A9188", fontSize:13 }}>
                        No inspo saved yet in this collection.<br/>
                        <button className="btn btn-primary" style={{ marginTop:12 }} onClick={() => { setEditPost(null); setPostForm(emptyPost()); setOpenPostModal(activeCollection.id); }}>Save Your First Post</button>
                      </div>
                    ) : (
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:12 }}>
                        {collectionPosts.map((post: any) => (
                          <div key={post.id} className="card">
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                              <div style={{ flex:1 }}>
                                <div style={{ fontSize:13, fontWeight:500, color:"#1A1917", marginBottom:2 }}>{post.title}</div>
                                {post.source_account && <div style={{ fontSize:11, color:"#9A9188" }}>via {post.source_account}</div>}
                              </div>
                              <div style={{ display:"flex", gap:4 }}>
                                {post.source_url && <a href={post.source_url} target="_blank" rel="noopener noreferrer" style={{ color:"#B89A5A" }}><ExternalLink size={12}/></a>}
                                <button onClick={() => { setEditPost(post); setPostForm({ title:post.title, source_url:post.source_url||"", source_account:post.source_account||"", caption:post.caption||"", hook:post.hook||"", why_saved:post.why_saved||"", content_type:post.content_type||"Reel", platform:post.platform||"Instagram", brand:post.brand||"AC" }); setOpenPostModal(activeCollection.id); }} style={{ background:"none", border:"none", cursor:"pointer", color:"#B89A5A" }}><Pencil size={12}/></button>
                                <button onClick={() => deletePost(activeCollection.id, post.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#B8B0A5" }}><Trash2 size={12}/></button>
                              </div>
                            </div>
                            <div style={{ display:"flex", gap:6, marginBottom:8 }}>
                              <span style={{ fontSize:10, padding:"2px 8px", borderRadius:100, background:"#EDE8E1", color:"#7D7470" }}>{post.content_type}</span>
                              <span style={{ fontSize:10, padding:"2px 8px", borderRadius:100, background:"#EDE8E1", color:"#7D7470" }}>{post.platform}</span>
                            </div>
                            {post.hook && <div style={{ marginBottom:6 }}><div style={{ fontSize:9, textTransform:"uppercase", color:"#B8B0A5", marginBottom:2 }}>Hook</div><div style={{ fontSize:12, color:"#1A1917", fontStyle:"italic" }}>"{post.hook}"</div></div>}
                            {post.caption && <div style={{ marginBottom:6 }}><div style={{ fontSize:9, textTransform:"uppercase", color:"#B8B0A5", marginBottom:2 }}>Caption</div><div style={{ fontSize:11, color:"#444140" }}>{post.caption.slice(0,120)}{post.caption.length>120?"...":""}</div></div>}
                            {post.why_saved && <div><div style={{ fontSize:9, textTransform:"uppercase", color:"#B8B0A5", marginBottom:2 }}>Why I Saved This</div><div style={{ fontSize:11, color:"#7D7470", fontStyle:"italic" }}>{post.why_saved}</div></div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {tab === "accounts" && (
            <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
              {BRANDS.map(brand => {
                const list = brandGroups[brand.id];
                if (!list || list.length === 0) return null;
                return (
                  <div key={brand.id}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:brand.color }}/>
                      <span style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", color:brand.color }}>@{ACCOUNT_HANDLES[brand.id]}</span>
                      <span style={{ fontSize:11, color:"#B8B0A5" }}>{list.length} account{list.length!==1?"s":""}</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:10 }}>
                      {list.map((a: any) => (
                        <div key={a.id} className="card">
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                            <div>
                              <div style={{ fontWeight:500, fontSize:14, marginBottom:2 }}>{a.title}</div>
                              {a.account_handle && <div style={{ fontSize:12, color:"#9A9188" }}>{a.account_handle}</div>}
                            </div>
                            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                              {a.account_url && <a href={a.account_url} target="_blank" rel="noopener noreferrer" style={{ color:"#B89A5A" }}><ExternalLink size={13}/></a>}
                              <button onClick={() => { setEditAccount(a); setAccountForm({ title:a.title||"", account_handle:a.account_handle||"", account_url:a.account_url||"", category:a.category||"Lifestyle", my_brand:a.my_brand||"AC", why_follow:a.why_follow||"", what_to_pull:a.what_to_pull||"", priority:a.priority||"High" }); setOpenAccountModal(true); }} style={{ background:"none", border:"none", cursor:"pointer", color:"#B89A5A" }}><Pencil size={13}/></button>
                              <button onClick={() => deleteAccount(a.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#B8B0A5" }}><Trash2 size={13}/></button>
                            </div>
                          </div>
                          <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                            <span style={{ fontSize:10, padding:"2px 8px", borderRadius:100, background:"#EDE8E1", color:"#7D7470" }}>{a.category}</span>
                          </div>
                          {a.why_follow && <div style={{ marginBottom:6 }}><div style={{ fontSize:9, textTransform:"uppercase", color:"#B8B0A5", marginBottom:2 }}>Why I Follow</div><div style={{ fontSize:11, color:"#444140" }}>{a.why_follow}</div></div>}
                          {a.what_to_pull && <div style={{ marginBottom:10 }}><div style={{ fontSize:9, textTransform:"uppercase", color:"#B8B0A5", marginBottom:2 }}>What to Pull</div><div style={{ fontSize:11, color:"#7D7470", fontStyle:"italic" }}>{a.what_to_pull}</div></div>}
                          <button onClick={() => { setOpenStudy(a); setStudyText(""); setStudyBrands(["AC"]); setStudyResult(null); }} style={{ width:"100%", padding:"8px 12px", background:"#B89A5A22", color:"#B89A5A", border:"0.5px solid #B89A5A44", borderRadius:8, cursor:"pointer", fontSize:12, fontFamily:"Jost,sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                            <Sparkles size={13}/> Study + Recreate with AI
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {openPostModal && (
        <div className="modal-overlay" onClick={() => setOpenPostModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontFamily:"Georgia,serif", fontSize:22 }}>{editPost ? "Edit Inspo Post" : "Save Inspo Post"}</div>
              <button onClick={() => setOpenPostModal(null)} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={18}/></button>
            </div>
            <div style={{ display:"grid", gap:12 }}>
              <div><label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Title / What It Is</label><input className="input" placeholder="e.g. Strong hook about starting over" value={postForm.title} onChange={e => setPostForm((f:any) => ({ ...f, title:e.target.value }))}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                <div><label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Type</label><select className="input" value={postForm.content_type} onChange={e => setPostForm((f:any) => ({ ...f, content_type:e.target.value }))}>{POST_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Platform</label><select className="input" value={postForm.platform} onChange={e => setPostForm((f:any) => ({ ...f, platform:e.target.value }))}><option>Instagram</option><option>TikTok</option><option>YouTube</option><option>Other</option></select></div>
                <div><label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Brand</label><select className="input" value={postForm.brand} onChange={e => setPostForm((f:any) => ({ ...f, brand:e.target.value }))}>{BRANDS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}</select></div>
              </div>
              <div><label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Source Account</label><input className="input" placeholder="@handle" value={postForm.source_account} onChange={e => setPostForm((f:any) => ({ ...f, source_account:e.target.value }))}/></div>
              <div><label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Post URL2</label><input className="input" placeholder="https://instagram.com/p/..." value={postForm.source_url} onChange={e => setPostForm((f:any) => ({ ...f, source_url:e.target.value }))}/></div>
              <div><label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Hook</label><input className="input" placeholder="The opening line that hooked you" value={postForm.hook} onChange={e => setPostForm((f:any) => ({ ...f, hook:e.target.value }))}/></div>
              <div><label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Caption / Copy</label><textarea className="input" rows={3} placeholder="Paste the caption here" value={postForm.caption} onChange={e => setPostForm((f:any) => ({ ...f, caption:e.target.value }))}/></div>
              <div><label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Why I Saved This</label><textarea className="input" rows={2} placeholder="What about this works? What do you want to borrow?" value={postForm.why_saved} onChange={e => setPostForm((f:any) => ({ ...f, why_saved:e.target.value }))}/></div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setOpenPostModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={savePost} disabled={saving}>{saving ? "Saving..." : editPost ? "Update" : "Save Post"}</button>
            </div>
          </div>
        </div>
      )}

      {openAccountModal && (
        <div className="modal-overlay" onClick={() => setOpenAccountModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontFamily:"Georgia,serif", fontSize:22 }}>{editAccount ? "Edit Account" : "Add Inspo Account"}</div>
              <button onClick={() => setOpenAccountModal(false)} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={18}/></button>
            </div>
            <div style={{ display:"grid", gap:12 }}>
              <div><label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Name</label><input className="input" placeholder="e.g. Lazy Millionaire" value={accountForm.title} onChange={e => setAccountForm((f:any) => ({ ...f, title:e.target.value }))}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div><label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Handle</label><input className="input" placeholder="@handle" value={accountForm.account_handle} onChange={e => setAccountForm((f:any) => ({ ...f, account_handle:e.target.value }))}/></div>
                <div><label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>My Brand</label><select className="input" value={accountForm.my_brand} onChange={e => setAccountForm((f:any) => ({ ...f, my_brand:e.target.value }))}>{BRANDS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}</select></div>
              </div>
              <div><label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Instagram URL</label><input className="input" placeholder="https://instagram.com/..." value={accountForm.account_url} onChange={e => setAccountForm((f:any) => ({ ...f, account_url:e.target.value }))}/></div>
              <div><label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Category</label><select className="input" value={accountForm.category} onChange={e => setAccountForm((f:any) => ({ ...f, category:e.target.value }))}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Why I Follow</label><textarea className="input" rows={2} placeholder="What draws you to this account?" value={accountForm.why_follow} onChange={e => setAccountForm((f:any) => ({ ...f, why_follow:e.target.value }))}/></div>
              <div><label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>What to Pull From Them</label><textarea className="input" rows={2} placeholder="Hook style, aesthetic, editing, tone..." value={accountForm.what_to_pull} onChange={e => setAccountForm((f:any) => ({ ...f, what_to_pull:e.target.value }))}/></div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setOpenAccountModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveAccount} disabled={saving}>{saving ? "Saving..." : editAccount ? "Update" : "Add Account"}</button>
            </div>
          </div>
        </div>
      )}

      {openStudy && (
        <div className="modal-overlay" onClick={() => setOpenStudy(null)}>
          <div className="modal" style={{ maxWidth:640 }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <div style={{ fontFamily:"Georgia,serif", fontSize:22 }}>Study + Recreate</div>
                <div style={{ fontSize:12, color:"#9A9188", marginTop:2 }}>{openStudy.title} ({openStudy.account_handle})</div>
              </div>
              <button onClick={() => setOpenStudy(null)} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={18}/></button>
            </div>
            <div style={{ display:"grid", gap:12 }}>
              <div>
                <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Paste Their Caption / Post Copy</label>
                <textarea className="input" rows={5} placeholder="Paste the post caption, hook, or copy you want to study and recreate..." value={studyText} onChange={e => setStudyText(e.target.value)}/>
              </div>
              <div>
                <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:8 }}>Recreate For These Brands</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {BRANDS.map(b => (
                    <button key={b.id} onClick={() => toggleBrand(b.id)} style={{ fontSize:12, padding:"6px 14px", borderRadius:100, border:"1px solid", borderColor:studyBrands.includes(b.id) ? b.color : "#EDE8E1", background:studyBrands.includes(b.id) ? b.color : "transparent", color:studyBrands.includes(b.id) ? "#fff" : "#9A9188", cursor:"pointer", fontFamily:"Jost,sans-serif" }}>
                      {b.id}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" onClick={runStudy} disabled={studyLoading || !studyText} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <Sparkles size={14}/> {studyLoading ? "AI is studying..." : "Generate Recreations"}
              </button>

              {studyResult && studyResult.breakdown && (
                <div>
                  <div style={{ background:"#F5F1EC", borderRadius:8, padding:"12px 14px", marginBottom:16 }}>
                    <div style={{ fontFamily:"Georgia,serif", fontSize:14, marginBottom:10 }}>Post Breakdown</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      {[["Hook Structure", studyResult.breakdown.hook_structure],["Copy Framework", studyResult.breakdown.copy_framework],["Emotional Trigger", studyResult.breakdown.emotional_trigger],["CTA Strategy", studyResult.breakdown.cta_strategy]].map(([label, val]) => (
                        <div key={label}>
                          <div style={{ fontSize:9, textTransform:"uppercase", color:"#B8B0A5", marginBottom:2 }}>{label}</div>
                          <div style={{ fontSize:11, color:"#444140" }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {studyResult.recreations?.map((r: any) => {
                    const brand = BRANDS.find(b => b.id === r.brand);
                    return (
                      <div key={r.brand} style={{ background:"var(--color-background-primary)", border:"0.5px solid #EDE8E1", borderRadius:8, padding:"12px 14px", marginBottom:10, borderLeft:`3px solid ${brand?.color||"#B89A5A"}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                          <span style={{ fontSize:11, fontWeight:500, color:brand?.color||"#B89A5A", textTransform:"uppercase", letterSpacing:"0.06em" }}>{r.brand} - {brand?.label}</span>
                          <button onClick={() => saveToIdeas(r.caption, r.brand)} style={{ fontSize:11, padding:"4px 10px", borderRadius:6, background:saveSuccess===r.brand?"#2C9D6A":"#B89A5A22", color:saveSuccess===r.brand?"#fff":"#B89A5A", border:`0.5px solid ${saveSuccess===r.brand?"#2C9D6A":"#B89A5A44"}`, cursor:"pointer" }}>
                            {saveSuccess === r.brand ? "Saved to Ideas!" : "Save to Ideas"}
                          </button>
                        </div>
                        {r.hook && <div style={{ fontSize:12, fontWeight:500, color:"#1A1917", marginBottom:6, fontStyle:"italic" }}>"{r.hook}"</div>}
                        <div style={{ fontSize:12, color:"#444140", lineHeight:1.6 }}>{r.caption}</div>
                        {r.why_it_works && <div style={{ fontSize:11, color:"#9A9188", marginTop:8, borderTop:"0.5px solid #EDE8E1", paddingTop:8 }}>Why it works: {r.why_it_works}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
