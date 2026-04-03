"use client";
import{useEffect,useState}from"react";
import{supabase}from"@/lib/supabase";
import{Plus,X,TrendingUp}from"lucide-react";
export default function Page(){
  const[data,setData]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[open,setOpen]=useState(false);
  const[form,setForm]=useState({sound_name:'',artist:'',platform:'TikTok',trend_type:'Sound',topic:'',notes:'',priority:'Medium'});
  const[saving,setSaving]=useState(false);
  useEffect(()=>{load();},[]);
  async function load(){const{data:d}=await supabase.from('trending').select('*').order('created_at',{ascending:false});setData(d||[]);setLoading(false);}
  async function save(){
    if(!form.sound_name)return;
    setSaving(true);
    await supabase.from('trending').insert({sound_name:form.sound_name,artist:form.artist||null,platform:form.platform,trend_type:form.trend_type,topic:form.topic||null,notes:form.notes||null,priority:form.priority,status:'Active'});
    setSaving(false);setOpen(false);setForm({sound_name:'',artist:'',platform:'TikTok',trend_type:'Sound',topic:'',notes:'',priority:'Medium'});load();
  }
  return(
    <div style={{maxWidth:1000}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
        <div><h1 style={{fontFamily:'Georgia,serif',fontSize:34,fontWeight:400}}>Trending</h1><div style={{fontSize:13,color:'#9A9188',marginTop:2}}>{data.length} tracked</div></div>
        <button className="btn btn-primary" onClick={()=>setOpen(true)}><Plus size={14}/> Log Sound</button>
      </div>
      {loading?<div className="skeleton" style={{height:200}}/>:data.length===0?(<div style={{textAlign:'center',padding:'64px 0'}}><TrendingUp size={32} color="#B8B0A5" style={{margin:'0 auto 12px'}}/><div style={{fontSize:13,color:'#9A9188',marginBottom:12}}>No trends logged yet.</div><button className="btn btn-primary" onClick={()=>setOpen(true)}>Log First Sound</button></div>):(<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:12}}>{data.map((t:any)=>(<div key={t.id} className="card"><div style={{fontWeight:500,fontSize:13,marginBottom:4}}>{t.sound_name}</div><div style={{fontSize:11,color:'#9A9188'}}>{t.platform}{t.artist?' · '+t.artist:''}</div>{t.notes&&<div style={{fontSize:11,color:'#7D7470',marginTop:6,fontStyle:'italic'}}>{t.notes}</div>}</div>))}</div>)}
      {open&&<div className="modal-overlay" onClick={()=>setOpen(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><div style={{fontFamily:'Georgia,serif',fontSize:22}}>Log Sound / Trend</div><button onClick={()=>setOpen(false)} style={{background:'none',border:'none',cursor:'pointer'}}><X size={18}/></button></div><div style={{display:'grid',gap:12}}><div><label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9A9188',display:'block',marginBottom:4}}>Sound / Trend Name *</label><input className="input" placeholder="Espresso - Sabrina Carpenter" value={form.sound_name} onChange={e=>setForm(f=>({...f,sound_name:e.target.value}))}/></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><div><label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9A9188',display:'block',marginBottom:4}}>Platform</label><select className="input" value={form.platform} onChange={e=>setForm(f=>({...f,platform:e.target.value}))}><option>TikTok</option><option>Instagram</option><option>YouTube</option></select></div><div><label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9A9188',display:'block',marginBottom:4}}>Type</label><select className="input" value={form.trend_type} onChange={e=>setForm(f=>({...f,trend_type:e.target.value}))}><option>Sound</option><option>Format</option><option>Topic</option><option>Challenge</option></select></div><div><label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9A9188',display:'block',marginBottom:4}}>Artist</label><input className="input" placeholder="Artist name" value={form.artist} onChange={e=>setForm(f=>({...f,artist:e.target.value}))}/></div><div><label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9A9188',display:'block',marginBottom:4}}>Priority</label><select className="input" value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}><option>High</option><option>Medium</option><option>Low</option></select></div></div><div><label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9A9188',display:'block',marginBottom:4}}>Notes</label><textarea className="input" rows={2} placeholder="Content idea using this sound..." value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div></div><div style={{display:'flex',gap:10,marginTop:20,justifyContent:'flex-end'}}><button className="btn btn-ghost" onClick={()=>setOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving...':'Save'}</button></div></div></div>}
    </div>
  );
}