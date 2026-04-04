"use client";
import{useEffect,useState}from"react";
import{supabase}from"@/lib/supabase";
import{Plus,X,Pencil,Trash2,ChevronDown,ChevronUp}from"lucide-react";
const ST=["Draft","Outlined","Written","Edited","Scheduled","Published"];
const CA=["Digital CEO","NYC Life","Business Strategy","Behind the Brand","Content & Creativity","Personal","Tutorial","Luxury Lifestyle","Other"];
const SC:Record<string,string>={Draft:"#B8B0A5",Outlined:"#185FA5",Written:"#B89A5A",Edited:"#7B5EA7",Scheduled:"#C8432A",Published:"#2C9D6A"};
const BR=[{code:"AC",color:"#2C2C2A"},{code:"DCA",color:"#C8432A"},{code:"DES",color:"#185FA5"},{code:"OOG",color:"#B89A5A"},{code:"LLL",color:"#888480"}];
function ef(){return{title:"",subtitle:"",status:"Draft",category:"Digital CEO",scheduled_date:"",hook:"",outline:"",body:"",cta:"",tags:"",my_brand:"AC",is_paid_only:false};}
export default function SubstackPage(){
  const[posts,setPosts]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[open,setOpen]=useState(false);
  const[editing,setEditing]=useState<any>(null);
  const[form,setForm]=useState<any>(ef());
  const[saving,setSaving]=useState(false);
  const[expanded,setExpanded]=useState<string|null>(null);
  const[fSt,setFSt]=useState("all");
  const[fBr,setFBr]=useState("all");
  useEffect(()=>{load();},[]);
  async function load(){const{data}=await supabase.from("substack_posts").select("*").order("scheduled_date",{ascending:true,nullsFirst:false}).order("created_at",{ascending:false});setPosts(data||[]);setLoading(false);}
  async function save(){if(!form.title)return;setSaving(true);const p={title:form.title,subtitle:form.subtitle||null,status:form.status,category:form.category,scheduled_date:form.scheduled_date||null,hook:form.hook||null,outline:form.outline||null,body:form.body||null,cta:form.cta||null,tags:form.tags||null,my_brand:form.my_brand,is_paid_only:form.is_paid_only};if(editing){await supabase.from("substack_posts").update(p).eq("id",editing.id);}else{await supabase.from("substack_posts").insert(p);}setSaving(false);setOpen(false);setEditing(null);load();}
  async function del(id:string){if(!confirm("Delete?"))return;await supabase.from("substack_posts").delete().eq("id",id);load();}
  function edit(post:any){setEditing(post);setForm({title:post.title||"",subtitle:post.subtitle||"",status:post.status||"Draft",category:post.category||"Digital CEO",scheduled_date:post.scheduled_date||"",hook:post.hook||"",outline:post.outline||"",body:post.body||"",cta:post.cta||"",tags:post.tags||"",my_brand:post.my_brand||"AC",is_paid_only:post.is_paid_only||false});setOpen(true);}
  const fil=posts.filter(p=>(fSt==="all"||p.status===fSt)&&(fBr==="all"||p.my_brand===fBr));
  const stats={total:posts.length,pub:posts.filter(p=>p.status==="Published").length,sch:posts.filter(p=>p.status==="Scheduled").length,wip:posts.filter(p=>["Draft","Outlined","Written","Edited"].includes(p.status)).length};
  return(<div style={{maxWidth:1100}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
      <div><h1 style={{fontFamily:"Georgia,serif",fontSize:34,fontWeight:400}}>Substack</h1><div style={{fontSize:13,color:"#9A9188",marginTop:2}}>Plan and write your newsletter content</div></div>
      <button className="btn btn-primary" onClick={()=>{setEditing(null);setForm(ef());setOpen(true);}}><Plus size={14}/> New Post</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
      {([["Total",stats.total,"#1A1917"],["Published",stats.pub,"#2C9D6A"],["Scheduled",stats.sch,"#C8432A"],["In Progress",stats.wip,"#B89A5A"]]as any[]).map(([l,v,c])=>(<div key={l} className="card" style={{textAlign:"center"}}><div style={{fontSize:28,fontFamily:"Georgia,serif",color:c}}>{v}</div><div style={{fontSize:11,color:"#9A9188",marginTop:2}}>{l}</div></div>))}
    </div>
    <div style={{display:"flex",gap:10,marginBottom:20}}>
      <select className="input" style={{width:"auto",fontSize:12}} value={fSt} onChange={e=>setFSt(e.target.value)}><option value="all">All Statuses</option>{ST.map(s=><option key={s}>{s}</option>)}</select>
      <select className="input" style={{width:"auto",fontSize:12}} value={fBr} onChange={e=>setFBr(e.target.value)}><option value="all">All Brands</option>{BR.map(b=><option key={b.code} value={b.code}>{b.code}</option>)}</select>
      <div style={{marginLeft:"auto",fontSize:12,color:"#9A9188",alignSelf:"center"}}>{fil.length} posts</div>
    </div>
    {loading?<div className="skeleton" style={{height:300}}/>:(
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {fil.length===0&&<div style={{textAlign:"center",padding:"48px 0",color:"#9A9188",fontSize:13}}>No Substack posts yet.</div>}
        {fil.map(post=>{const isExp=expanded===post.id;const b=BR.find(x=>x.code===post.my_brand);return(
          <div key={post.id} className="card" style={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"14px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:b?.color||"#B89A5A"}}/>
                    <span style={{fontSize:14,fontWeight:500,color:"#1A1917"}}>{post.title}</span>
                    {post.is_paid_only&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:100,background:"#B89A5A22",color:"#B89A5A"}}>Paid</span>}
                  </div>
                  {post.subtitle&&<div style={{fontSize:12,color:"#7D7470",marginBottom:6,fontStyle:"italic"}}>{post.subtitle}</div>}
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:(SC[post.status]||"#B8B0A5")+"22",color:SC[post.status]||"#B8B0A5"}}>{post.status}</span>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:"#EDE8E1",color:"#7D7470"}}>{post.category}</span>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:"#EDE8E1",color:"#7D7470"}}>{post.my_brand}</span>
                    {post.scheduled_date&&<span style={{fontSize:10,color:"#9A9188"}}>{new Date(post.scheduled_date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>}
                  </div>
                </div>
                <div style={{display:"flex",gap:4}}>
                  <button onClick={()=>edit(post)} style={{background:"none",border:"none",cursor:"pointer",color:"#B89A5A"}}><Pencil size={13}/></button>
                  <button onClick={()=>del(post.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#B8B0A5"}}><Trash2 size={13}/></button>
                  <button onClick={()=>setExpanded(isExp?null:post.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#B8B0A5"}}>{isExp?<ChevronUp size={14}/>:<ChevronDown size={14}/>}</button>
                </div>
              </div>
            </div>
            {isExp&&(<div style={{borderTop:"0.5px solid #EDE8E1",padding:"12px 16px",background:"#FDFCFA",display:"grid",gap:10}}>
              {post.hook&&<div><div style={{fontSize:9,textTransform:"uppercase",color:"#B8B0A5",marginBottom:2}}>Hook</div><div style={{fontSize:12,color:"#1A1917",fontStyle:"italic"}}>"{post.hook}"</div></div>}
              {post.outline&&<div><div style={{fontSize:9,textTransform:"uppercase",color:"#B8B0A5",marginBottom:2}}>Outline</div><div style={{fontSize:12,color:"#444140",whiteSpace:"pre-line"}}>{post.outline}</div></div>}
              {post.body&&<div><div style={{fontSize:9,textTransform:"uppercase",color:"#B8B0A5",marginBottom:2}}>Body</div><div style={{fontSize:12,color:"#444140"}}>{post.body.slice(0,400)}{post.body.length>400?"...":""}</div></div>}
              {post.cta&&<div><div style={{fontSize:9,textTransform:"uppercase",color:"#B8B0A5",marginBottom:2}}>CTA</div><div style={{fontSize:12,color:"#444140"}}>{post.cta}</div></div>}
              {post.tags&&<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{post.tags.split(",").map((t:string)=><span key={t} style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:"#EDE8E1",color:"#7D7470"}}>{t.trim()}</span>)}</div>}
            </div>)}
          </div>
        );})}
      </div>
    )}
    {open&&(<div className="modal-overlay" onClick={()=>setOpen(false)}>
      <div className="modal" style={{maxWidth:640}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:22}}>{editing?"Edit Post":"New Substack Post"}</div>
          <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",cursor:"pointer"}}><X size={18}/></button>
        </div>
        <div style={{display:"grid",gap:12}}>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Title</label><input className="input" value={form.title} onChange={e=>setForm((f:any)=>({...f,title:e.target.value}))} placeholder="e.g. How I built 3 brands while working full time"/></div>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Subtitle</label><input className="input" value={form.subtitle} onChange={e=>setForm((f:any)=>({...f,subtitle:e.target.value}))} placeholder="Short teaser"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Status</label><select className="input" value={form.status} onChange={e=>setForm((f:any)=>({...f,status:e.target.value}))}>{ST.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Category</label><select className="input" value={form.category} onChange={e=>setForm((f:any)=>({...f,category:e.target.value}))}>{CA.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Brand</label><select className="input" value={form.my_brand} onChange={e=>setForm((f:any)=>({...f,my_brand:e.target.value}))}>{BR.map(b=><option key={b.code} value={b.code}>{b.code}</option>)}</select></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Scheduled Date</label><input className="input" type="date" value={form.scheduled_date} onChange={e=>setForm((f:any)=>({...f,scheduled_date:e.target.value}))}/></div>
            <div style={{display:"flex",alignItems:"center",gap:8,paddingTop:20}}><input type="checkbox" id="paid" checked={form.is_paid_only} onChange={e=>setForm((f:any)=>({...f,is_paid_only:e.target.checked}))}/><label htmlFor="paid" style={{fontSize:12,color:"#444140",cursor:"pointer"}}>Paid only</label></div>
          </div>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Hook</label><input className="input" value={form.hook} onChange={e=>setForm((f:any)=>({...f,hook:e.target.value}))} placeholder="Opening line that pulls them in"/></div>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Outline</label><textarea className="input" rows={4} value={form.outline} onChange={e=>setForm((f:any)=>({...f,outline:e.target.value}))} placeholder="Sections, bullet points, flow..."/></div>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Body</label><textarea className="input" rows={4} value={form.body} onChange={e=>setForm((f:any)=>({...f,body:e.target.value}))} placeholder="Write your draft here..."/></div>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>CTA</label><input className="input" value={form.cta} onChange={e=>setForm((f:any)=>({...f,cta:e.target.value}))} placeholder="What do you want readers to do?"/></div>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Tags</label><input className="input" value={form.tags} onChange={e=>setForm((f:any)=>({...f,tags:e.target.value}))} placeholder="digital CEO, branding, NYC"/></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}>
          <button className="btn btn-ghost" onClick={()=>setOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?"Saving...":editing?"Update":"Save Post"}</button>
        </div>
      </div>
    </div>)}
  </div>);
}
