"use client";
import{useEffect,useState}from"react";
import{supabase}from"@/lib/supabase";
import{Plus,X,ArrowUpCircle,Trash2}from"lucide-react";
const BRANDS=[{id:'20e8bb0e-29fd-492e-ad91-2beb239e4b0f',abbr:'AC',color:'#2C2C2A'},{id:'caa9919a-5fe0-4e67-844a-fd75f3170516',abbr:'DCA',color:'#C8432A'},{id:'ba48df91-58dc-4471-93f4-1c2a9ba69d35',abbr:'DES',color:'#185FA5'},{id:'a80ef03f-697b-47da-9c73-81b9b4d2717e',abbr:'LLL',color:'#888480'},{id:'f4aec731-0842-493e-b17f-56e5265318ac',abbr:'OOG',color:'#B89A5A'},{id:'41d737ec-4a5a-425c-9f1e-ad509988c3d8',abbr:'TDI',color:'#534AB7'}];
const URGENCY_ORDER=['Hot','This Week','Soon','Someday'];
const URGENCY_COLOR:Record<string,string>={Hot:'#FEE2E2','This Week':'#FEF3C7',Soon:'#DBEAFE',Someday:'#F3F4F6'};
const URGENCY_TEXT:Record<string,string>={Hot:'#991B1B','This Week':'#92400E',Soon:'#1E40AF',Someday:'#6B7280'};
function empty(){return{title:'',brand_id:'',content_type:'Reel',urgency:'Soon',notes:'',type:'Video'};}
export default function IdeasPage(){
  const[data,setData]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[open,setOpen]=useState(false);
  const[form,setForm]=useState<any>(empty());
  const[saving,setSaving]=useState(false);
  useEffect(()=>{load();},[]);
  async function load(){const{data:d}=await supabase.from('ideas').select('*').order('created_at',{ascending:false});setData(d||[]);setLoading(false);}
  async function save(){if(!form.title)return;setSaving(true);await supabase.from('ideas').insert({title:form.title,brand_id:form.brand_id||null,content_type:form.content_type||null,urgency:form.urgency,notes:form.notes||null,type:form.type||null,status:'Idea'});setSaving(false);setOpen(false);setForm(empty());load();}
  async function del(id:string){await supabase.from('ideas').delete().eq('id',id);load();}
  async function promote(idea:any){
    await supabase.from('posts').insert({title:idea.title,brand_id:idea.brand_id||null,content_type:idea.content_type||null,platform:'Instagram',status:'Draft',hook:idea.notes||null});
    await supabase.from('ideas').update({status:'Promoted'}).eq('id',idea.id);
    load();
    alert('Promoted to Posts!');
  }
  const grouped=URGENCY_ORDER.reduce((acc,u)=>{acc[u]=data.filter(i=>i.urgency===u&&i.status!=='Promoted');return acc;},{} as Record<string,any[]>);
  return(
    <div style={{maxWidth:1100}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
        <div><h1 style={{fontFamily:'Georgia,serif',fontSize:34,fontWeight:400}}>Ideas Bank</h1><div style={{fontSize:13,color:'#9A9188',marginTop:2}}>{data.filter(i=>i.status!=='Promoted').length} ideas</div></div>
        <button className="btn btn-primary" onClick={()=>setOpen(true)}><Plus size={14}/> Capture Idea</button>
      </div>
      {loading?<div className="skeleton" style={{height:300}}/>:data.length===0?(<div style={{textAlign:'center',padding:'64px 0'}}><div style={{fontSize:13,color:'#9A9188',marginBottom:12}}>No ideas yet.</div><button className="btn btn-primary" onClick={()=>setOpen(true)}>Capture First Idea</button></div>):(
        <div style={{display:'flex',flexDirection:'column',gap:24}}>
          {URGENCY_ORDER.map(u=>grouped[u]?.length>0&&(
            <div key={u}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                <span style={{fontSize:11,padding:'3px 12px',borderRadius:100,background:URGENCY_COLOR[u],color:URGENCY_TEXT[u],fontWeight:500}}>{u}</span>
                <span style={{fontSize:12,color:'#9A9188'}}>{grouped[u].length}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
                {grouped[u].map((idea:any)=>{const brand=BRANDS.find(b=>b.id===idea.brand_id);return(<div key={idea.id} className="card"><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}><span style={{fontWeight:500,fontSize:14,flex:1,marginRight:8}}>{idea.title}</span>{brand&&<span style={{fontSize:10,padding:'2px 6px',borderRadius:100,background:brand.color+'22',color:brand.color,flexShrink:0}}>{brand.abbr}</span>}</div>{idea.content_type&&<div style={{fontSize:11,color:'#9A9188',marginBottom:6}}>{idea.content_type}</div>}{idea.notes&&<div style={{fontSize:12,color:'#7D7470',marginBottom:10,fontStyle:'italic'}}>{idea.notes}</div>}<div style={{display:'flex',gap:6,marginTop:'auto'}}><button onClick={()=>promote(idea)} style={{background:'none',border:'none',cursor:'pointer',color:'#B89A5A',fontSize:11,display:'flex',alignItems:'center',gap:4,padding:0}}><ArrowUpCircle size={13}/>Promote to Post</button><button onClick={()=>del(idea.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#B8B0A5',marginLeft:'auto'}}><Trash2 size={13}/></button></div></div>);})}
              </div>
            </div>
          ))}
        </div>
      )}
      {open&&<div className="modal-overlay" onClick={()=>setOpen(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><div style={{fontFamily:'Georgia,serif',fontSize:22}}>Capture Idea</div><button onClick={()=>setOpen(false)} style={{background:'none',border:'none',cursor:'pointer'}}><X size={18}/></button></div><div style={{display:'grid',gap:12}}><div><label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9A9188',display:'block',marginBottom:4}}>Idea Title *</label><input className="input" placeholder="What's the idea?" value={form.title} onChange={e=>setForm((f:any)=>({...f,title:e.target.value}))}/></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><div><label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9A9188',display:'block',marginBottom:4}}>Brand</label><select className="input" value={form.brand_id} onChange={e=>setForm((f:any)=>({...f,brand_id:e.target.value}))}><option value="">Select brand</option>{BRANDS.map(b=>(<option key={b.id} value={b.id}>{b.abbr}</option>))}</select></div><div><label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9A9188',display:'block',marginBottom:4}}>Urgency</label><select className="input" value={form.urgency} onChange={e=>setForm((f:any)=>({...f,urgency:e.target.value}))}>{URGENCY_ORDER.map(u=>(<option key={u}>{u}</option>))}</select></div><div><label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9A9188',display:'block',marginBottom:4}}>Content Type</label><select className="input" value={form.content_type} onChange={e=>setForm((f:any)=>({...f,content_type:e.target.value}))}>{['Reel','Carousel','Static','Story','Live','Short','Video'].map(t=>(<option key={t}>{t}</option>))}</select></div></div><div><label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9A9188',display:'block',marginBottom:4}}>Notes</label><textarea className="input" rows={3} placeholder="Details, angles, hooks..." value={form.notes} onChange={e=>setForm((f:any)=>({...f,notes:e.target.value}))}/></div></div><div style={{display:'flex',gap:10,marginTop:20,justifyContent:'flex-end'}}><button className="btn btn-ghost" onClick={()=>setOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving...':'Save'}</button></div></div></div>}
    </div>
  );
}