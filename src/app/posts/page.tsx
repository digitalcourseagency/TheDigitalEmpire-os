"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, X, Star, Pencil, Trash2, ExternalLink, Upload, Image, Video, Layout, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";

const BRANDS = [
  { id: "20e8bb0e-29fd-492e-ad91-2beb239e4b0f", label: "Ash Couture", code: "AC", color: "#2C2C2A" },
  { id: "caa9919a-5fe0-4e67-844a-fd75f3170516", label: "DCA", code: "DCA", color: "#C8432A" },
  { id: "ba48df91-58dc-4471-93f4-1c2a9ba69d35", label: "Digital Expert School", code: "DES", color: "#185FA5" },
  { id: "f4aec731-0842-493e-b17f-56e5265318ac", label: "Opulent Outreach", code: "OOG", color: "#B89A5A" },
  { id: "a80ef03f-697b-47da-9c73-81b9b4d2717e", label: "Lux Leisure", code: "LLL", color: "#888480" },
];
const STATUSES = ["Draft","Scripted","Filmed","Editing","Scheduled","Posted"];
const TYPES = ["Reel","Carousel","Static","Story","TikTok","YouTube Short","Email","Other"];
const STATUS_COLORS: Record<string,string> = {
  Draft:"#B8B0A5", Scripted:"#185FA5", Filmed:"#B89A5A", Editing:"#C8432A", Scheduled:"#7B5EA7", Posted:"#2C9D6A"
};

function emptyForm() {
  return { title:"", caption:"", hook:"", brand_id:BRANDS[0].id, status:"Draft", type:"Reel", platform:"Instagram", scheduled_date:"", drive_link:"", notes:"", is_carousel:false, carousel_slide_count:1 };
}
function emptySlide(n: number) {
  return { slide_number:n, headline:"", body_text:"", visual_notes:"" };
}

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editPost, setEditPost] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm());
  const [slides, setSlides] = useState<any[]>([emptySlide(1)]);
  const [saving, setSaving] = useState(false);
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [expandedPost, setExpandedPost] = useState<string|null>(null);
  const [mediaFile, setMediaFile] = useState<File|null>(null);
  const [mediaPreview, setMediaPreview] = useState<string|null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("posts").select("*, brands(label,color)").order("scheduled_date", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  }

  async function loadSlides(postId: string) {
    const { data } = await supabase.from("carousel_slides").select("*").eq("post_id", postId).order("slide_number");
    return data || [];
  }

  function openNew() {
    setEditPost(null);
    setForm(emptyForm());
    setSlides([emptySlide(1)]);
    setMediaFile(null);
    setMediaPreview(null);
    setOpenModal(true);
  }

  async function openEdit(post: any) {
    setEditPost(post);
    setForm({
      title: post.title||"", caption: post.caption||"", hook: post.hook||"",
      brand_id: post.brand_id||BRANDS[0].id, status: post.status||"Draft",
      type: post.type||"Reel", platform: post.platform||"Instagram",
      scheduled_date: post.scheduled_date||"", drive_link: post.drive_link||"",
      notes: post.notes||"", is_carousel: post.is_carousel||false,
      carousel_slide_count: post.carousel_slide_count||1,
    });
    setMediaPreview(post.media_url||null);
    setMediaFile(null);
    if (post.is_carousel) {
      const s = await loadSlides(post.id);
      setSlides(s.length > 0 ? s : [emptySlide(1)]);
    } else {
      setSlides([emptySlide(1)]);
    }
    setOpenModal(true);
  }

  function handleMediaSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  }

  function updateSlideCount(count: number) {
    const c = Math.max(1, Math.min(20, count));
    setForm((f: any) => ({ ...f, carousel_slide_count: c }));
    setSlides(prev => {
      const next = [...prev];
      while (next.length < c) next.push(emptySlide(next.length + 1));
      return next.slice(0, c);
    });
  }

  function updateSlide(idx: number, field: string, val: string) {
    setSlides(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  }

  async function save() {
    if (!form.title) return;
    setSaving(true);

    let media_url = editPost?.media_url || null;
    let media_type = editPost?.media_type || null;
    let thumbnail_url = editPost?.thumbnail_url || null;

    if (mediaFile) {
      setUploading(true);
      const ext = mediaFile.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data: up, error } = await supabase.storage.from("post-media").upload(path, mediaFile, { upsert: true });
      if (!error && up) {
        const { data: pub } = supabase.storage.from("post-media").getPublicUrl(up.path);
        media_url = pub.publicUrl;
        media_type = mediaFile.type.startsWith("video") ? "video" : "image";
        thumbnail_url = media_url;
      }
      setUploading(false);
    }

    const payload: any = {
      title: form.title, caption: form.caption||null, hook: form.hook||null,
      brand_id: form.brand_id, status: form.status, type: form.type,
      platform: form.platform, scheduled_date: form.scheduled_date||null,
      drive_link: form.drive_link||null, notes: form.notes||null,
      is_carousel: form.is_carousel, carousel_slide_count: form.is_carousel ? form.carousel_slide_count : 1,
      media_url, media_type, thumbnail_url,
    };

    let postId = editPost?.id;
    if (editPost) {
      await supabase.from("posts").update(payload).eq("id", editPost.id);
    } else {
      const { data } = await supabase.from("posts").insert(payload).select().single();
      postId = data?.id;
    }

    if (form.is_carousel && postId) {
      await supabase.from("carousel_slides").delete().eq("post_id", postId);
      const slideRows = slides.map((s, i) => ({ post_id: postId, slide_number: i+1, headline: s.headline||null, body_text: s.body_text||null, visual_notes: s.visual_notes||null }));
      await supabase.from("carousel_slides").insert(slideRows);
    }

    setSaving(false);
    setOpenModal(false);
    load();
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post?")) return;
    await supabase.from("posts").delete().eq("id", id);
    load();
  }

  async function toggleStar(post: any) {
    await supabase.from("posts").update({ is_starred: !post.is_starred }).eq("id", post.id);
    load();
  }

  const filtered = posts.filter(p =>
    (filterBrand === "all" || p.brand_id === filterBrand) &&
    (filterStatus === "all" || p.status === filterStatus) &&
    (filterType === "all" || p.type === filterType)
  );

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:34, fontWeight:400 }}>Posts</h1>
          <div style={{ fontSize:13, color:"#9A9188", marginTop:2 }}>Plan, upload, and manage all your content</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={14}/> New Post</button>
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        <select className="input" style={{ width:"auto", fontSize:12 }} value={filterBrand} onChange={e => setFilterBrand(e.target.value)}>
          <option value="all">All Brands</option>
          {BRANDS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
        <select className="input" style={{ width:"auto", fontSize:12 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="input" style={{ width:"auto", fontSize:12 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <div style={{ marginLeft:"auto", fontSize:12, color:"#9A9188", alignSelf:"center" }}>{filtered.length} posts</div>
      </div>

      {loading ? <div className="skeleton" style={{ height:300 }}/> : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {filtered.length === 0 && <div style={{ textAlign:"center", padding:"48px 0", color:"#9A9188", fontSize:13 }}>No posts yet. Hit New Post to start planning your content.</div>}
          {filtered.map(post => {
            const brand = BRANDS.find(b => b.id === post.brand_id);
            const isExpanded = expandedPost === post.id;
            return (
              <div key={post.id} className="card" style={{ padding:0, overflow:"hidden" }}>
                <div style={{ display:"flex", alignItems:"stretch", gap:0 }}>
                  {post.thumbnail_url && (
                    <div style={{ width:72, flexShrink:0, background:"#EDE8E1", position:"relative", overflow:"hidden" }}>
                      {post.media_type === "video" ? (
                        <video src={post.thumbnail_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} muted/>
                      ) : (
                        <img src={post.thumbnail_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                      )}
                      {post.is_carousel && <div style={{ position:"absolute", bottom:4, right:4, background:"rgba(0,0,0,0.6)", borderRadius:4, padding:"1px 5px", fontSize:9, color:"#fff" }}>1/{post.carousel_slide_count}</div>}
                    </div>
                  )}
                  {!post.thumbnail_url && (
                    <div style={{ width:72, flexShrink:0, background:"#EDE8E1", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {post.is_carousel ? <Layout size={20} color="#B8B0A5"/> : post.type === "Reel" || post.type === "TikTok" ? <Video size={20} color="#B8B0A5"/> : <Image size={20} color="#B8B0A5"/>}
                    </div>
                  )}
                  <div style={{ flex:1, padding:"12px 14px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                          <div style={{ width:6, height:6, borderRadius:"50%", background:brand?.color||"#B89A5A", flexShrink:0 }}/>
                          <span style={{ fontSize:14, fontWeight:500, color:"#1A1917" }}>{post.title}</span>
                          {post.is_carousel && <span style={{ fontSize:10, padding:"1px 6px", borderRadius:100, background:"#185FA522", color:"#185FA5" }}>{post.carousel_slide_count} slides</span>}
                        </div>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          <span style={{ fontSize:10, padding:"2px 8px", borderRadius:100, background:STATUS_COLORS[post.status]+"22", color:STATUS_COLORS[post.status] }}>{post.status}</span>
                          <span style={{ fontSize:10, padding:"2px 8px", borderRadius:100, background:"#EDE8E1", color:"#7D7470" }}>{post.type}</span>
                          <span style={{ fontSize:10, padding:"2px 8px", borderRadius:100, background:"#EDE8E1", color:"#7D7470" }}>{post.platform}</span>
                          {post.scheduled_date && <span style={{ fontSize:10, color:"#9A9188" }}>{new Date(post.scheduled_date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>}
                        </div>
                        {post.hook && !isExpanded && <div style={{ fontSize:11, color:"#7D7470", marginTop:4, fontStyle:"italic" }}>"{post.hook.slice(0,80)}{post.hook.length>80?"...":""}"</div>}
                      </div>
                      <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                        <button onClick={() => toggleStar(post)} style={{ background:"none", border:"none", cursor:"pointer", color:post.is_starred?"#B89A5A":"#B8B0A5" }}><Star size={14} fill={post.is_starred?"#B89A5A":"none"}/></button>
                        {post.drive_link && <a href={post.drive_link} target="_blank" rel="noopener noreferrer" style={{ color:"#B89A5A" }}><ExternalLink size={13}/></a>}
                        <button onClick={() => openEdit(post)} style={{ background:"none", border:"none", cursor:"pointer", color:"#B89A5A" }}><Pencil size={13}/></button>
                        <button onClick={() => deletePost(post.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#B8B0A5" }}><Trash2 size={13}/></button>
                        <button onClick={() => setExpandedPost(isExpanded ? null : post.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#B8B0A5" }}>
                          {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop:"0.5px solid #EDE8E1", padding:"12px 14px", background:"#FDFCFA" }}>
                    {post.hook && <div style={{ marginBottom:8 }}><div style={{ fontSize:9, textTransform:"uppercase", color:"#B8B0A5", marginBottom:2 }}>Hook</div><div style={{ fontSize:12, color:"#1A1917", fontStyle:"italic" }}>"{post.hook}"</div></div>}
                    {post.caption && <div style={{ marginBottom:8 }}><div style={{ fontSize:9, textTransform:"uppercase", color:"#B8B0A5", marginBottom:2 }}>Caption</div><div style={{ fontSize:12, color:"#444140", whiteSpace:"pre-line" }}>{post.caption}</div></div>}
                    {post.notes && <div style={{ marginBottom:8 }}><div style={{ fontSize:9, textTransform:"uppercase", color:"#B8B0A5", marginBottom:2 }}>Notes</div><div style={{ fontSize:12, color:"#7D7470" }}>{post.notes}</div></div>}
                    {post.is_carousel && <CarouselExpanded postId={post.id}/>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {openModal && (
        <div className="modal-overlay" onClick={() => setOpenModal(false)}>
          <div className="modal" style={{ maxWidth:680 }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontFamily:"Georgia,serif", fontSize:22 }}>{editPost ? "Edit Post" : "New Post"}</div>
              <button onClick={() => setOpenModal(false)} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={18}/></button>
            </div>

            <div style={{ display:"grid", gap:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Post Title</label>
                  <input className="input" placeholder="e.g. Day in my life as a NYC Digital CEO" value={form.title} onChange={e => setForm((f:any) => ({ ...f, title:e.target.value }))}/>
                </div>
                <div>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Brand</label>
                  <select className="input" value={form.brand_id} onChange={e => setForm((f:any) => ({ ...f, brand_id:e.target.value }))}>
                    {BRANDS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Status</label>
                  <select className="input" value={form.status} onChange={e => setForm((f:any) => ({ ...f, status:e.target.value }))}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Type</label>
                  <select className="input" value={form.type} onChange={e => setForm((f:any) => ({ ...f, type:e.target.value }))}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Platform</label>
                  <select className="input" value={form.platform} onChange={e => setForm((f:any) => ({ ...f, platform:e.target.value }))}>
                    <option>Instagram</option><option>TikTok</option><option>YouTube</option><option>LinkedIn</option><option>Email</option><option>All</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Scheduled Date</label>
                  <input className="input" type="date" value={form.scheduled_date} onChange={e => setForm((f:any) => ({ ...f, scheduled_date:e.target.value }))}/>
                </div>
              </div>

              <div>
                <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Hook</label>
                <input className="input" placeholder="The opening line that stops the scroll" value={form.hook} onChange={e => setForm((f:any) => ({ ...f, hook:e.target.value }))}/>
              </div>

              <div>
                <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Caption</label>
                <textarea className="input" rows={4} placeholder="Write your full caption here..." value={form.caption} onChange={e => setForm((f:any) => ({ ...f, caption:e.target.value }))}/>
              </div>

              <div>
                <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Drive / Folder Link</label>
                <input className="input" placeholder="https://drive.google.com/..." value={form.drive_link} onChange={e => setForm((f:any) => ({ ...f, drive_link:e.target.value }))}/>
              </div>

              <div>
                <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:4 }}>Notes</label>
                <textarea className="input" rows={2} placeholder="Shoot notes, editing directions, tags..." value={form.notes} onChange={e => setForm((f:any) => ({ ...f, notes:e.target.value }))}/>
              </div>

              <div>
                <label style={{ fontSize:11, textTransform:"uppercase", color:"#9A9188", display:"block", marginBottom:8 }}>Media Upload</label>
                <div onClick={() => fileRef.current?.click()} style={{ border:"1.5px dashed #EDE8E1", borderRadius:10, padding:"16px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, background:"#FDFCFA" }}>
                  {mediaPreview ? (
                    <div style={{ display:"flex", alignItems:"center", gap:12, flex:1 }}>
                      {form.media_type === "video" || (mediaFile && mediaFile.type.startsWith("video")) ? (
                        <video src={mediaPreview} style={{ width:60, height:60, objectFit:"cover", borderRadius:6 }} muted/>
                      ) : (
                        <img src={mediaPreview} alt="" style={{ width:60, height:60, objectFit:"cover", borderRadius:6 }}/>
                      )}
                      <div>
                        <div style={{ fontSize:12, color:"#1A1917", fontWeight:500 }}>Media attached</div>
                        <div style={{ fontSize:11, color:"#9A9188" }}>Click to replace</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={20} color="#B8B0A5"/>
                      <div>
                        <div style={{ fontSize:12, color:"#1A1917" }}>Upload image, graphic, or reel</div>
                        <div style={{ fontSize:11, color:"#9A9188" }}>JPG, PNG, MP4, MOV — up to 50MB</div>
                      </div>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display:"none" }} onChange={handleMediaSelect}/>
                {mediaPreview && (
                  <button onClick={() => { setMediaFile(null); setMediaPreview(null); }} style={{ fontSize:11, color:"#B8B0A5", background:"none", border:"none", cursor:"pointer", marginTop:4 }}>Remove media</button>
                )}
              </div>

              <div style={{ background:"#F5F1EC", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: form.is_carousel ? 16 : 0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <Layout size={15} color="#185FA5"/>
                    <span style={{ fontSize:13, fontWeight:500, color:"#1A1917" }}>Carousel Planner</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    {form.is_carousel && (
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:11, color:"#9A9188" }}>Slides:</span>
                        <button onClick={() => updateSlideCount(form.carousel_slide_count - 1)} style={{ width:22, height:22, borderRadius:6, border:"0.5px solid #EDE8E1", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>−</button>
                        <span style={{ fontSize:13, fontWeight:500, minWidth:20, textAlign:"center" }}>{form.carousel_slide_count}</span>
                        <button onClick={() => updateSlideCount(form.carousel_slide_count + 1)} style={{ width:22, height:22, borderRadius:6, border:"0.5px solid #EDE8E1", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>+</button>
                      </div>
                    )}
                    <button onClick={() => { const on = !form.is_carousel; setForm((f:any) => ({ ...f, is_carousel:on })); if(on && slides.length===0) setSlides([emptySlide(1)]); }} style={{ padding:"4px 12px", borderRadius:100, fontSize:12, border:"0.5px solid #185FA544", background:form.is_carousel?"#185FA5":"transparent", color:form.is_carousel?"#fff":"#185FA5", cursor:"pointer", fontFamily:"Jost,sans-serif" }}>
                      {form.is_carousel ? "On" : "Enable"}
                    </button>
                  </div>
                </div>

                {form.is_carousel && (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {slides.slice(0, form.carousel_slide_count).map((slide, idx) => (
                      <div key={idx} style={{ background:"#fff", borderRadius:8, padding:"10px 12px", border:"0.5px solid #EDE8E1" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                          <GripVertical size={12} color="#B8B0A5"/>
                          <span style={{ fontSize:11, fontWeight:600, color:"#185FA5" }}>Slide {idx+1}</span>
                        </div>
                        <div style={{ display:"grid", gap:6 }}>
                          <input className="input" style={{ fontSize:12 }} placeholder={`Slide ${idx+1} headline`} value={slide.headline||""} onChange={e => updateSlide(idx, "headline", e.target.value)}/>
                          <textarea className="input" style={{ fontSize:12 }} rows={2} placeholder="Body copy / text for this slide" value={slide.body_text||""} onChange={e => updateSlide(idx, "body_text", e.target.value)}/>
                          <input className="input" style={{ fontSize:12 }} placeholder="Visual notes (photo, graphic, style...)" value={slide.visual_notes||""} onChange={e => updateSlide(idx, "visual_notes", e.target.value)}/>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setOpenModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving||uploading}>{uploading ? "Uploading..." : saving ? "Saving..." : editPost ? "Update Post" : "Create Post"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CarouselExpanded({ postId }: { postId: string }) {
  const [slides, setSlides] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("carousel_slides").select("*").eq("post_id", postId).order("slide_number").then(({ data }) => setSlides(data||[]));
  }, [postId]);
  if (slides.length === 0) return null;
  return (
    <div style={{ marginTop:8 }}>
      <div style={{ fontSize:9, textTransform:"uppercase", color:"#B8B0A5", marginBottom:8 }}>Carousel Slides</div>
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
        {slides.map(s => (
          <div key={s.id} style={{ minWidth:160, flex:"0 0 160px", background:"#fff", border:"0.5px solid #EDE8E1", borderRadius:8, padding:"10px 12px" }}>
            <div style={{ fontSize:9, color:"#185FA5", fontWeight:600, marginBottom:4 }}>SLIDE {s.slide_number}</div>
            {s.headline && <div style={{ fontSize:12, fontWeight:500, color:"#1A1917", marginBottom:4 }}>{s.headline}</div>}
            {s.body_text && <div style={{ fontSize:11, color:"#444140", marginBottom:4 }}>{s.body_text}</div>}
            {s.visual_notes && <div style={{ fontSize:10, color:"#9A9188", fontStyle:"italic" }}>{s.visual_notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
