"use client";
import{useEffect,useState}from"react";
import{supabase}from"@/lib/supabase";
import{ChevronLeft,ChevronRight,X,Plus,Pencil,Trash2}from"lucide-react";
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW=["SUN","MON","TUE","WED","THU","FRI","SAT"];
const ET=["Live Training","Webinar","Live Q&A","Workshop","Masterclass","Challenge","Other"];
const PL=["Instagram","TikTok","YouTube","Zoom","Other"];
const BR=[{code:"AC",color:"#2C2C2A"},{code:"DCA",color:"#C8432A"},{code:"DES",color:"#185FA5"},{code:"OOG",color:"#B89A5A"},{code:"LLL",color:"#888480"}];
function ef(){return{title:"",event_type:"Live Training",event_date:"",event_time:"",platform:"Instagram",topic:"",cta:"",manychat_keyword:"",my_brand:"AC",status:"Scheduled",notes:""};}
export default function CalendarPage(){
  const now=new Date();
  const[year,setYear]=useState(now.getFullYear());
  const[month,setMonth]=useState(now.getMonth());
  const[posts,setPosts]=useState<any[]>([]);
  const[shoots,setShoots]=useState<any[]>([]);
  const[launches,setLaunches]=useState<any[]>([]);
  const[lives,setLives]=useState<any[]>([]);
  const[selected,setSelected]=useState<any>(null);
  const[liveOpen,setLiveOpen]=useState(false);
  const[editingLive,setEditingLive]=useState<any>(null);
  const[form,setForm]=useState<any>(ef());
  const[saving,setSaving]=useState(false);
  useEffect(()=>{load();},[year,month]);
  async function load(){
    const s=`${year}-${String(month+1).padStart(2,"0")}-01`;
    const e=`${year}-${String(month+1).padStart(2,"0")}-31`;
    const[p,sh,la,li]=await Promise.all([
      supabase.from("posts").select("id,caption,scheduled_date,platform,status,media_url,thumbnail_url,reel_cover_url").gte("scheduled_date",s).lte("scheduled_date",e),
      supabase.from("shoots").select("id,name,shoot_date,status").gte("shoot_date",s).lte("shoot_date",e),
      supabase.from("launches").select("id,name,launch_date,status").gte("launch_date",s).lte("launch_date",e),
      supabase.from("live_events").select("*").gte("event_date",s).lte("event_date",e),
    ]);
    setPosts(p.data||[]);setShoots(sh.data||[]);setLaunches(la.data||[]);setLives(li.data||[]);
  }
  function prevMonth(){if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);}
  function nextMonth(){if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);}
  const first=new Date(year,month,1).getDay();
  const days=new Date(year,month+1,0).getDate();
  const cells=Array.from({length:first+days},(_,i)=>i<first?null:i-first+1);
  const today=now.getFullYear()===year&&now.getMonth()===month?now.getDate():null;
  function dayItems(d:number){
    const ds=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return{posts:posts.filter(p=>p.scheduled_date===ds),shoots:shoots.filter(s=>s.shoot_date===ds),launches:launches.filter(l=>l.launch_date===ds),lives:lives.filter(l=>l.event_date===ds)};
  }
  async function saveLive(){
    if(!form.title||!form.event_date)return;setSaving(true);
    const p={title:form.title,event_type:form.event_type,event_date:form.event_date,event_time:form.event_time||null,platform:form.platform,topic:form.topic||null,cta:form.cta||null,manychat_keyword:form.manychat_keyword||null,my_brand:form.my_brand,status:form.status,notes:form.notes||null};
    if(editingLive){await supabase.from("live_events").update(p).eq("id",editingLive.id);}else{await supabase.from("live_events").insert(p);}
    setSaving(false);setLiveOpen(false);setEditingLive(null);load();
  }
  async function deleteLive(id:string){if(!confirm("Delete?"))return;await supabase.from("live_events").delete().eq("id",id);setSelected(null);load();}
  function openEditLive(l:any){setEditingLive(l);setForm({title:l.title||"",event_type:l.event_type||"Live Training",event_date:l.event_date||"",event_time:l.event_time||"",platform:l.platform||"Instagram",topic:l.topic||"",cta:l.cta||"",manychat_keyword:l.manychat_keyword||"",my_brand:l.my_brand||"AC",status:l.status||"Scheduled",notes:l.notes||""});setLiveOpen(true);}
  return(<div style={{maxWidth:1100}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
      <h1 style={{fontFamily:"Georgia,serif",fontSize:34,fontWeight:400}}>Content Calendar</h1>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setEditingLive(null);setForm(ef());setLiveOpen(true);}} className="btn btn-primary" style={{fontSize:12}}><Plus size={13}/> Schedule Live</button>
        <button onClick={prevMonth} style={{background:"none",border:"none",cursor:"pointer",padding:6}}><ChevronLeft size={18}/></button>
        <span style={{fontFamily:"Georgia,serif",fontSize:18,minWidth:140,textAlign:"center"}}>{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} style={{background:"none",border:"none",cursor:"pointer",padding:6}}><ChevronRight size={18}/></button>
      </div>
    </div>
    <div style={{display:"flex",gap:16,marginBottom:16,fontSize:12,color:"#7D7470"}}>
      <span><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:"#B89A5A",marginRight:5}}/>Posts</span>
      <span><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:"#185FA5",marginRight:5}}/>Shoots</span>
      <span><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:"#C8432A",marginRight:5}}/>Launches</span>
      <span><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:"#2C9D6A",marginRight:5}}/>Lives</span>
    </div>
    <div className="card" style={{padding:0,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:"0.5px solid #EDE8E1"}}>
        {DOW.map(d=><div key={d} style={{padding:"10px 0",textAlign:"center",fontSize:11,color:"#9A9188",fontWeight:500,letterSpacing:"0.05em"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
        {cells.map((d,i)=>{
          const items=d?dayItems(d):{posts:[],shoots:[],launches:[],lives:[]};
          const isToday=d===today;
          return(<div key={i} style={{minHeight:100,borderRight:i%7!==6?"0.5px solid #EDE8E1":"none",borderBottom:"0.5px solid #EDE8E1",padding:"8px 6px"}}>
            {d&&<>
              <div style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:isToday?"#1A1917":"transparent",color:isToday?"#FDFCFA":"#444140",fontSize:12,fontWeight:isToday?600:400,marginBottom:4}}>{d}</div>
              {items.launches.map(l=><div key={l.id} onClick={()=>setSelected({type:"launch",...l})} style={{fontSize:10,padding:"2px 5px",borderRadius:3,background:"#C8432A22",color:"#C8432A",marginBottom:2,cursor:"pointer",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{l.name}</div>)}
              {items.shoots.map(s=><div key={s.id} onClick={()=>setSelected({type:"shoot",...s})} style={{fontSize:10,padding:"2px 5px",borderRadius:3,background:"#185FA522",color:"#185FA5",marginBottom:2,cursor:"pointer",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</div>)}
              {items.lives.map(l=><div key={l.id} onClick={()=>setSelected({type:"live",...l})} style={{fontSize:10,padding:"2px 5px",borderRadius:3,background:"#2C9D6A22",color:"#2C9D6A",marginBottom:2,cursor:"pointer",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{l.title}</div>)}
              {items.posts.map(p=><div key={p.id} onClick={()=>setSelected({type:"post",...p})} style={{fontSize:10,padding:"2px 5px",borderRadius:3,background:"#B89A5A22",color:"#B89A5A",marginBottom:2,cursor:"pointer",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.caption?.slice(0,25)||"Post"}</div>)}
            </>}
          </div>);
        })}
      </div>
    </div>
    {selected&&(<div className="modal-overlay" onClick={()=>setSelected(null)}>
      <div className="modal" style={{maxWidth:440}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:20}}>{selected.type==="post"?"Post":selected.type==="shoot"?"Shoot":selected.type==="live"?"Live Event":"Launch"}</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {selected.type==="live"&&<button onClick={()=>{openEditLive(selected);setSelected(null);}} style={{background:"none",border:"none",cursor:"pointer",color:"#B89A5A"}}><Pencil size={14}/></button>}
            {selected.type==="live"&&<button onClick={()=>deleteLive(selected.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#B8B0A5"}}><Trash2 size={14}/></button>}
            <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer"}}><X size={18}/></button>
          </div>
        </div>
        {selected.type==="post"&&(<div style={{display:"grid",gap:8}}>
          {{(selected.reel_cover_url||selected.thumbnail_url||selected.media_url)&&<img src={selected.reel_cover_url||selected.thumbnail_url||selected.media_url} style={{width:"100%",height:180,objectFit:"cover",borderRadius:8}}/>}
          <div style={{fontSize:13,color:"#444140"}}>{selected.caption||"No caption"}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:"#EDE8E1",color:"#7D7470"}}>{selected.platform}</span>
            <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:"#EDE8E1",color:"#7D7470"}}>{selected.status}</span>
            <span style={{fontSize:10,color:"#9A9188"}}>{selected.scheduled_date}</span>
          </div>
        </div>)}
        {selected.type==="shoot"&&(<div style={{display:"grid",gap:8}}><div style={{fontSize:15,fontWeight:500}}>{selected.name}</div><div style={{display:"flex",gap:6}}><span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:"#185FA522",color:"#185FA5"}}>{selected.status}</span><span style={{fontSize:10,color:"#9A9188"}}>{selected.shoot_date}</span></div></div>)}
        {selected.type==="launch"&&(<div style={{display:"grid",gap:8}}><div style={{fontSize:15,fontWeight:500}}>{selected.name}</div><div style={{display:"flex",gap:6}}><span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:"#C8432A22",color:"#C8432A"}}>{selected.status}</span><span style={{fontSize:10,color:"#9A9188"}}>{selected.launch_date}</span></div></div>)}
        {selected.type==="live"&&(<div style={{display:"grid",gap:8}}>
          <div style={{fontSize:15,fontWeight:500}}>{selected.title}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:"#2C9D6A22",color:"#2C9D6A"}}>{selected.event_type}</span>
            <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:"#EDE8E1",color:"#7D7470"}}>{selected.platform}</span>
            <span style={{fontSize:10,color:"#9A9188"}}>{selected.event_date}{selected.event_time?" Â· "+selected.event_time:""}</span>
          </div>
          {selected.topic&&<div><div style={{fontSize:9,textTransform:"uppercase",color:"#B8B0A5",marginBottom:2}}>Topic</div><div style={{fontSize:12,color:"#444140"}}>{selected.topic}</div></div>}
          {selected.cta&&<div><div style={{fontSize:9,textTransform:"uppercase",color:"#B8B0A5",marginBottom:2}}>CTA</div><div style={{fontSize:12,color:"#444140"}}>{selected.cta}</div></div>}
          {selected.manychat_keyword&&<div><div style={{fontSize:9,textTransform:"uppercase",color:"#B8B0A5",marginBottom:2}}>ManyChat Keyword</div><div style={{fontSize:12,color:"#444140",fontWeight:500}}>{selected.manychat_keyword}</div></div>}
          {selected.notes&&<div><div style={{fontSize:9,textTransform:"uppercase",color:"#B8B0A5",marginBottom:2}}>Notes</div><div style={{fontSize:12,color:"#7D7470"}}>{selected.notes}</div></div>}
        </div>)}
      </div>
    </div>)}
    {liveOpen&&(<div className="modal-overlay" onClick={()=>setLiveOpen(false)}>
      <div className="modal" style={{maxWidth:560}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:22}}>{editingLive?"Edit Live Event":"Schedule Live Event"}</div>
          <button onClick={()=>setLiveOpen(false)} style={{background:"none",border:"none",cursor:"pointer"}}><X size={18}/></button>
        </div>
        <div style={{display:"grid",gap:12}}>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Title</label><input className="input" value={form.title} onChange={e=>setForm((f:any)=>({...f,title:e.target.value}))} placeholder="e.g. Free Webinar: How to Create a Course in 24hrs"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Type</label><select className="input" value={form.event_type} onChange={e=>setForm((f:any)=>({...f,event_type:e.target.value}))}>{ET.map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Platform</label><select className="input" value={form.platform} onChange={e=>setForm((f:any)=>({...f,platform:e.target.value}))}>{PL.map(p=><option key={p}>{p}</option>)}</select></div>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Brand</label><select className="input" value={form.my_brand} onChange={e=>setForm((f:any)=>({...f,my_brand:e.target.value}))}>{BR.map(b=><option key={b.code} value={b.code}>{b.code}</option>)}</select></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Date</label><input className="input" type="date" value={form.event_date} onChange={e=>setForm((f:any)=>({...f,event_date:e.target.value}))}/></div>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Time</label><input className="input" value={form.event_time} onChange={e=>setForm((f:any)=>({...f,event_time:e.target.value}))} placeholder="e.g. 7:30 PM EST"/></div>
          </div>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Topic</label><textarea className="input" rows={2} value={form.topic} onChange={e=>setForm((f:any)=>({...f,topic:e.target.value}))} placeholder="What are you covering?"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>CTA</label><input className="input" value={form.cta} onChange={e=>setForm((f:any)=>({...f,cta:e.target.value}))} placeholder="Comment LIVE, DM link..."/></div>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>ManyChat Keyword</label><input className="input" value={form.manychat_keyword} onChange={e=>setForm((f:any)=>({...f,manychat_keyword:e.target.value}))} placeholder="e.g. digital stream"/></div>
          </div>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Notes</label><textarea className="input" rows={2} value={form.notes} onChange={e=>setForm((f:any)=>({...f,notes:e.target.value}))} placeholder="Any prep notes..."/></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}>
          <button className="btn btn-ghost" onClick={()=>setLiveOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={saveLive} disabled={saving}>{saving?"Saving...":editingLive?"Update":"Schedule"}</button>
        </div>
      </div>
    </div>)}
  </div>);
}
