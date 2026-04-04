"use client";
import{useEffect,useState,useRef}from"react";
import{supabase}from"@/lib/supabase";
import{Plus,X,Pencil,Trash2,Star,ExternalLink,Upload,Image,Video,ChevronLeft,ChevronRight}from"lucide-react";
const PLATFORMS=["Instagram","TikTok","YouTube","Facebook","LinkedIn","Substack","Other"];
const TYPES=["Reel","Carousel","Static","Story","YouTube Short","YouTube Long","Other"];
const STATUSES=["Draft","Scripted","Filmed","Edited","Scheduled","Published"];
const BR=[{code:"AC",color:"#2C2C2A"},{code:"DCA",color:"#C8432A"},{code:"DES",color:"#185FA5"},{code:"OOG",color:"#B89A5A"},{code:"LLL",color:"#888480"}];
const SC:Record<string,string>={Draft:"#B8B0A5",Scripted:"#7B5EA7",Filmed:"#185FA5",Edited:"#B89A5A",Scheduled:"#C8432A",Published:"#2C9D6A"};
function ef(){return{title:"",hook:"",caption:"",platform:"Instagram",content_type:"Reel",status:"Draft",scheduled_date:"",my_brand:"AC",cta_keyword:"",manychat_keyword:"",drive_link:"",topic:"",cover_headline:""};}
export default function PostsPage(){
  const[posts,setPosts]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[open,setOpen]=useState(false);
  const[editing,setEditing]=useState<any>(null);
  const[form,setForm]=useState<any>(ef());
  const[saving,setSaving]=useState(false);
  const[fStatus,setFStatus]=useState("all");
  const[fPlatform,setFPlatform]=useState("all");
  const[fBrand,setFBrand]=useState("all");
  const[uploading,setUploading]=useState(false);
  const[uploadingCover,setUploadingCover]=useState(false);
  const[mediaUrls,setMediaUrls]=useState<string[]>([]);
  const[mediaType,setMediaType]=useState<string>("image");
  const[coverUrl,setCoverUrl]=useState<string>("");
  const[slideIdx,setSlideIdx]=useState(0);
  const fileRef=useRef<HTMLInputElement>(null);
  const coverRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{load();},[]);
  async function load(){const{data}=await supabase.from("posts").select("*").order("created_at",{ascending:false});setPosts(data||[]);setLoading(false);}
  async function uploadFiles(files:FileList,isCover=false){
    if(isCover){setUploadingCover(true);}else{setUploading(true);}
    const urls:string[]=[];
    for(const file of Array.from(files)){
      const ext=file.name.split(".").pop();
      const path=`${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const{data,error}=await supabase.storage.from("post-media").upload(path,file,{upsert:true});
      if(!error&&data){
        const{data:pub}=supabase.storage.from("post-media").getPublicUrl(data.path);
        urls.push(pub.publicUrl);
        if(!isCover)setMediaType(file.type.startsWith("video")?"video":"image");
      }
    }
    if(isCover){setCoverUrl(urls[0]||"");setUploadingCover(false);}
    else{setMediaUrls(prev=>[...prev,...urls]);setUploading(false);}
  }
  async function save(){if(!form.title&&!form.caption)return;stSaving(true);
    const isCarousel=mediaUrls.length>1;
    const p={title:form.title||null,hook:form.hook||null,caption:form.caption||null,platform:form.platform,content_type:form.content_type,status:form.status,scheduled_date:form.scheduled_date||null,my_brand:form.my_brand,cta_keyword:form.cta_keyword||null,manychat_keyword:form.manychat_keyword||null,drive_link:form.drive_link||null,topic:form.topic||null,cover_headline:form.cover_headline||null,media_url:mediaUrls[0]||null,media_type:mediaType||null,thumbnail_url:coverUrl||null,reel_cover_url:coverUrl||null,is_carousel:isCarousel,carousel_slide_count:isCarousel?mediaUrls.length:null};
    if(editing){await supabase.from("posts").update(p).eq("id",editing.id);}
    else{await supabase.from("posts").insert(p);}
    setSaving(false);setOpen(false);setEditing(null);resetForm();load();}
  function resetForm(){setForm(ef());setMediaUrls([]);setCoverUrl("");setMediaType("image");setSlideIdx(0);}
  function editPost(post:any){setEditing(post);setForm({title:post.title||"",hook:post.hook||"",caption:post.caption||"",platform:post.platform||"Instagram",content_type:post.content_type||"Reel",status:post.status||"Draft",scheduled_date:post.scheduled_date||"",my_brand:post.my_brand||"AC",cta_keyword:post.cta_keyword||"",manychat_keyword:post.manychat_keyword||"",drive_link:post.drive_link||"",topic:post.topic||"",cover_headline:post.cover_headline||""});setMediaUrls(post.media_url?[post.media_url]:[]);setCoverUrl(post.reel_cover_url||post.thumbnail_url||"");setMediaType(post.media_type||"image");setOpen(true);}
  async function deletePost(id:string){if(!confirm("Delete?"))return;fawait supabase.from("posts").delete().eq("id",id);load();}
  async function toggleStar(post:any){await supabase.from("posts").update({top_performer:!post.top_performer}).eq("id",post.id);load();}
  const fil=posts.filter(p=>(fStatus==="all"||p.status===fStatus)&&(fPlatform==="all"||p.platform===fPlatform)&&(fBrand==="all"||p.my_brand===fBrand));
  const isReel=form.content_type==="Reel"||form.content_type==="YouTube Short"||form.content_type==="YouTube Long";
  const isCarouselType=form.content_type==="Carousel";
  return(<div style={{maxWidth:1100}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
      <div><h1 style={{fontFamily:"Georgia,serif",fontSize:34,fontWeight:400}}>Posts</h1><div style={{fontSize:13,color:"#9A9188",marginTop:2}}>Plan, upload, and track all your content</div></div>
      <button className="btn btn-primary" onClick={()=>{setEditing(null);resetForm();setOpen(true);}}><Plus size={14}/> New Post</button>
    </div>
    <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
      <select className="input" style={{width:"auto",fontSize:12}} value={fStatus} onChange={e=>setFStatus(e.target.value)}><option value="all">All Statuses</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
      <select className="input" style={{width:"auto",fontSize:12}} value={fPlatform} onChange={e=>setFPlatform(e.target.value)}><option value="all">All Platforms</option>{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select>
      <select className="input" style={{width:"auto",fontSize:12}} value={fBrand} onChange={e=>setFBrand(e.target.value)}><option value="all">All Brands</option>{BR.map(b=><option key={b.code} value={b.code}>{b.code}</option>)}</select>
      <div style={{marginLeft:"auto",fontSize:12,color:"#9A9188",alignSelf:"center"}}>{fil.length} posts</div>
    </div>
    {loading?<div className="skeleton" style={{height:300}}/>:(      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {fil.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:"48px 0",color:"#9A9188",fontSize:13}}>No posts yet. Create your first post.</div>}
        {fil.map(post=>{
          const b=BR.find(x=>x.code===post.my_brand);
          const thumb=post.reel_cover_url||post.thumbnail_url||post.media_url;
          return(<div key={post.id} className="card" style={{padding:0,overflow:"hidden"}}>
            {thumb&&<div style={{position:"relative",height:200,background:"#EDE8E1"}}>
              {post.media_type==="video"&&!post.reel_cover_url?\n                <video src={thumb} style={{width:"100%",height:"100%",objectFit:"cover"}} muted/>:\n                <img src={thumb} style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
              {post.is_carousel&&<div style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.6)",color:"#fff",fontSize:10,padding:"2px 6px",borderRadius:4}}>{post.carousel_slide_count} slides</div>}
              {post.media_type==="video"&&<div style={{position:"absolute",top:8,left:8,background:"rgba(0,0,0,0.6)",color:"#fff",fontSize:10,padding:"2px 6px",borderRadius:4}}>â–¶ Video</div>}
            </div>}
            {!thumb&&<div style={{height:80,background:"#F5F1EC",display:"flex",alignItems:"center",justifyContent:"center"}}><Image size={24} style={{color:"#B8B0A5"}}/></div>}
            <div style={{padding:"12px 14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:b?.color||"#B89A5A"}}/>
                <span style={{fontSize:13,fontWeight:500,color:"#1A1917",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{post.title||post.caption?.slice(0,40)||"Untitled"}</span>
                <button onClick={()=>toggleStar(post)} style={{background:"none",border:"none",cursor:"pointer",color:post.top_performer?"#B89A5A":"#D4CFC9",padding:0}}><Star size={13} fill={post.top_performer?"#B89A5A":"none"}/></button>
              </div>
              {post.hook&&<div style={{fontSize:11,color:"#7D7470",marginBottom:6,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>"{post.hook}"</div>}
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                <span style={{fontSize:10,padding:"2px 7px",borderRadius:100,background:(SC[post.status]||"#B8B0A5")+"22",color:SC[post.status]||"#B8B0A5"}}>{post.status}</span>
                <span style={{fontSize:10,padding:"2px 7px",borderRadius:100,background:"#EDE8E1",color:"#7D7470"}}>{post.platform}</span>
                <span style={{fontSize:10,padding:"2px 7px",borderRadius:100,background:"#EDE8E1",color:"#7D7470"}}>{post.content_type}</span>
                {post.scheduled_date&&<span style={{fontSize:10,color:"#9A9188"}}>{new Date(post.scheduled_date+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>}
              </div>
              <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                {post.drive_link&&<a href={post.drive_link} target="_blank" rel="noopener noreferrer" style={{color:"#B89A5A"}}><ExternalLink size={13}/></a>}
                <button onClick={()=>editPost(post)} style={{background:"none",border:"none",cursor:"pointer",color:"#B89A5A"}}><Pencil size={13}/></button>
                <button onClick={()=>deletePost(post.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#B8B0A5"}}><Trash2 size={13}/></button>
              </div>
            </div>
          </div>);
        })}
      </div>
    )}
    {open&&(<div className="modal-overlay" onClick={()=>{setOpen(false);resetForm();}}>
      <div className="modal" style={{maxWidth:680}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:22}}>{editing?"Edit Post":"New Post"}</div>
          <button onClick={()=>{setOpen(false);resetForm();}} style={{background:"none",border:"none",cursor:"pointer"}}><X size={18}/></button>
        </div>
        <div style={{display:"grid",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Platform</label><select className="input" value={form.platform} onChange={e=>setForm((f:any)=>({...f,platform:e.target.value}))}>{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select></div>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Type</label><select className="input" value={form.content_type} onChange={e=>setForm((f:any)=>({...f,content_type:e.target.value}))}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Status</label><select className="input" value={form.status} onChange={e=>setForm((f:any)=>({...f,status:e.target.value}))}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Brand</label><select className="input" value={form.my_brand} onChange={e=>setForm((f:any)=>({...f,my_brand:e.target.value}))}>{BR.map(b=><option key={b.code} value={b.code}>{b.code}</option>)}</select></div>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Scheduled Date</label><input className="input" type="date" value={form.scheduled_date} onChange={e=>setForm((f:any)=>({...f,scheduled_date:e.target.value}))}/></div>
          </div>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Title</label><input className="input" value={form.title} onChange={e=>setForm((f:any)=>({...f,title:e.target.value}))} placeholder="Post title or concept"/></div>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Hook</label><input className="input" value={form.hook} onChange={e=>setForm((f:any)=>({...f,hook:e.target.value}))} placeholder="Opening line that stops the scroll"/></div>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Caption</label><textarea className="input" rows={3} value={form.caption} onChange={e=>setForm((f:any)=>({...f,caption:e.target.value}))} placeholder="Full caption with hashtags..."/></div>
          {((isReel||isCarouselType))&&<div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Cover Headline {isReel?"(Reel Cover Text)":"(Slide 1 Headline)"}</label><input className="input" value={form.cover_headline} onChange={e=>setForm((f:any)=>({...f,cover_headline:e.target.value}))} placeholder="Text shown on the cover..."/></div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>CTA Keyword</label><input className="input" value={form.cta_keyword} onChange={e=>setForm((f:any)=>({...f,cta_keyword:e.target.value}))} placeholder="Comment COURSE..."/></div>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>ManyChat Keyword</label><input className="input" value={form.manychat_keyword} onChange={e=>setForm((f:any)=>({...f,manychat_keyword:e.target.value}))} placeholder="digital stream"/></div>
          </div>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Topic / Series</label><input className="input" value={form.topic} onChange={e=>setForm((f:any)=>({...f,topic:e.target.value}))} placeholder="Content series or theme"/></div>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Google Drive Link</label><input className="input" value={form.drive_link} onChange={e=>setForm((f:any)=>({...f,drive_link:e.target.value}))} placeholder="https://drive.google.com/..."/></div>
          <div>
            <label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:8}}>{isCarouselType?"Carousel Slides (upload multiple)":"Media"}</label>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple={isCarouselType} style={{display:"none"}} onChange={e=>e.target.files&&uploadFiles(e.target.files)}/>
            {mediaUrls.length>0&&(
              <div style={{marginBottom:10}}>
                {isCarouselType?(
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
                    {mediaUrls.map((url,i)=><div key={i} style={{position:"relative",width:80,height:80}}>
                      <img src={url} style={{width:80,height:80,objectFit:"cover",borderRadius:6}}/>
                      <button onClick={()=>setMediaUrls(prev=>prev.filter((_,j)=>j!‹Ïi))} style={{position:"absolute",top:-4,right:-4,background:"#C8432A",border:"none",borderRadius:"50%",width:16,height:16,cursor:"pointer",color:"#fff",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}><X size={9}/></button>
                    </div>)}
                  </div>
                ):(
                  <div style={{position:"relative",height:160,borderRadius:8,overflow:"hidden",marginBottom:8}}>
                    {mediaType==="video"?<video src={mediaUrls[0]} style={{width:"100%",height:"100%",objectFit:"cover"}} controls/>:<img src={mediaUrls[0]} style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
                    <button onClick={()=>setMediaUrls([])} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.6)",border:"none",borderRadius:"50%",width:24,height:24,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={12}/></button>
                  </div>
                )}
              </div>
            )}
            <button onClick={()=>fileRef.current?.click()} className="btn btn-ghost" style={{width:"100%",fontSize:12}} disabled={uploading}>
              {uploading?"Uploading...":<><Upload size={13}/> {isCarouselType?"Add Slides":"Upload Media"}</>}
            </button>
            {mediaUrls.length>0&&isCarouselType&&<div style={{fontSize:11,color:"#9A9188",textAlign:"center",marginTop:4}}>{mediaUrls.length} slide{mediaUrls.length>1?"s":""} added</div>}
          </div>
          {isReel&&<div>
            <label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:8}}>Reel Cover Image</label>
            <input ref={coverRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files&&uploadFiles(e.target.files,true)}/>
            {coverUrl?(<div style={{position:"relative",height:120,borderRadius:8,overflow:"hidden",marginBottom:8}}>
              <img src={coverUrl} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <button onClick={()=>setCoverUrl("")} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.6)",border:"none",borderRadius:"50%",width:24,height:24,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={12}/></button>
            </div>):null}
            <button onClick={()=>coverRef.current?.click()} className="btn btn-ghost" style={{width:"100%",fontSize:12}} disabled={uploadingCover}>
              {uploadingCover?"Uploading...":<><Image size={13}/> {coverUrl?"Replace Cover":"Upload Reel Cover"}</>}
            </button>
          </div>}
        </div>
        <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}>
          <button className="btn btn-ghost" onClick={()=>{setOpen(false);resetForm();}}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?"Saving...":editing?"Update":"Save Post"}</button>
        </div>
      </div>
    </div>)}
  </div>);
}
