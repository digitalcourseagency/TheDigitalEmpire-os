"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus } from "lucide-react";
const BRANDS=[{id:"20e8bb0e-29fd-492e-ad91-2beb239e4b0f",name:"Ash Couture",abbr:"AC",color:"#2C2C2A"},{id:"caa9919a-5fe0-4e67-844a-fd75f3170516",name:"Digital Course Agency",abbr:"DCA",color:"#C8432A"},{id:"ba48df91-58dc-4471-93f4-1c2a9ba69d35",name:"Digital Expert School",abbr:"DES",color:"#185FA5"},{id:"a80ef03f-697b-47da-9c73-81b9b4d2717e",name:"Lux Leisure Lifestyle",abbr:"LLL",color:"#888480"},{id:"f4aec731-0842-493e-b17f-56e5265318ac",name:"Opulent Outreach Group",abbr:"OOG",color:"#B89A5A"},{id:"41d737ec-4a5a-425c-9f1e-ad509988c3d8",name:"TikTok Digital Income",abbr:"TDI",color:"#534AB7"}];
const STATUSES=["Idea","Scripted","Filmed","Edited","Scheduled","Live"];
const PLATFORMS=["Instagram","TikTok","YouTube","Substack","Facebook"];
const STATUS_COLOR:Record<string,string>={Idea:"#EDE8E1",Scripted:"#FEF3C7",Filmed:"#DBEAFE",Edited:"#E0E7FF",Scheduled:"#D1FAE5",Live:"#B89A5A22"};
const STATUS_TEXT:Record<string,string>={Idea:"#7D7470",Scripted:"#92400E",Filmed:"#1E40AF",Edited:"#3730A3",Scheduled:"#065F46",Live:"#7A6535"};
export default function PostsPage(){
  const [posts,setPosts]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [filterBrand,setFilterBrand]=useState('');
  const [filterStatus,setFilterStatus]=useState('');
  const [search,setSearch]=useState('');
  const [showModal,setShowModal]=useState(false);
  const [form,setForm]=useState<any>({status:'Idea'});
  const [saving,setSaving]=useState(false);
  async function load(){setLoading(true);const{data}=await supabase.from('posts').select('*').order('created_at',{ascending:false});setPosts(data||[]);setLoading(false);}
  useEffect(()=>{load();},[]);
  async function save(){setSaving(true);if(form.id)await supabase.from('posts').update(form).eq('id',form.id);else await supabase.from('posts').insert(form);setSaving(false);setShowModal(false);load();}
  const filtered=posts.filter(p=>{if(filterBrand&&p.brand_id!==filterBrand)return false;if(filterStatus&&p.status!==filterStatus)return false;if(search&&!p.title.toLowerCase().includes(search.toLowerCase()))return false;return true;});
  return(
    <div style={{maxWidth:1100,animation:'slideUp 0.4s ease'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28}}>
        <div><h1 className="font-display" style={{fontSize:34,fontWeight:400}}>Posts</h1><div style={{fontSize:13,color:'#9A9188',marginTop:2}}>{posts.length} total posts</div></div>
        <button className="btn btn-primary" onClick={()=>{setForm({status:'Idea'});setShowModal(true);}}><Plus size={14}/> New Post</button>
      </div>
      <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <input className="input" style={{width:200}} placeholder="Search posts..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select className="input" style={{width:160}} value={filterBrand} onChange={e=>setFilterBrand(e.target.value)}><option value="">All Brands</option>{BRANDS.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
        <select className="input" style={{width:140}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="">All Statuses</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
      </div>
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        {loading?<div style={{padding:32}}>{[1,2,3].map(i=><div key={i} className="skeleton" style={{height:40,marginBottom:8}}/>)}</div>:filtered.length===0?(
          <div style={{textAlign:'center',padding:'48px 24px'}}><div style={{fontSize:13,color:'#9A9188',marginBottom:12}}>No posts found.</div><button className="btn btn-primary" onClick={()=>{setForm({status:'Idea'});setShowModal(true);}}>Add Your First Post</button></div>
        ):(
          <table className="data-table"><thead><tr><th>Title</th><th>Brand</th><th>Status</th><th>Platform</th><th>Type</th><th>Date</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
          <tbody>{filtered.map(p=>{const brand=BRANDS.find(b=>b.id===p.brand_id);return(<tr key={p.id}><td style={{maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.title}</td><td>{brand&&<span className="brand-pill" style={{background:brand.color+'20',color:brand.color}}>{brand.abbr}</span>}</td><td><span style={{fontSize:11,padding:'3px 8px',borderRadius:100,background:STATUS_COLOR[p.status||'Idea']||'#EDE8E1',color:STATUS_TEXT[p.status||'Idea']||'#7D7470'}}>{p.status}</span></td><td style={{fontSize:12,color:'#7D7470'}}>{p.platform||'—'}</td><td style={{fontSize:12,color:'#7D7470'}}>{p.content_type||'—'}</td><td style={{fontSize:12,color:'#9A9188'}}>{p.publish_date?new Date(p.publish_date).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'—'}</td><td><div style={{display:'flex',gap:6,justifyContent:'flex-end'}}><button onClick={()=>{setForm(p);setShowModal(true);}} style={{background:'none',border:'none',cursor:'pointer',fontSize:12,color:'#B89A5A',fontFamily:'var(--font-jost)'}}>Edit</button></div></td></tr>);})}
          </tbody></table>
        )}
      </div>
      {showModal&&<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}><div className="modal" style={{maxWidth:560}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><div className="font-display" style={{fontSize:22}}>{form.id?'Edit Post':'New Post'}</div><button onClick={()=>setShowModal(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:'#9A9188'}}>×</button></div>
        <div style={{display:'grid',gap:12}}>
          <input className="input" placeholder="Title *" value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <select className="input" value={form.brand_id||''} onChange={e=>setForm({...form,brand_id:e.target.value})}><option value="">— Brand —</option>{BRANDS.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
            <select className="input" value={form.status||'Idea'} onChange={e=>setForm({...form,status:e.target.value})}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <select className="input" value={form.platform||''} onChange={e=>setForm({...form,platform:e.target.value})}><option value="">— Platform —</option>{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select>
            <input className="input" type="date" value={form.publish_date||''} onChange={e=>setForm({...form,publish_date:e.target.value})}/>
          </div>
          <input className="input" placeholder="Hook" value={form.hook||''} onChange={e=>setForm({...form,hook:e.target.value})}/>
          <textarea className="input" rows={3} placeholder="Caption..." value={form.caption||''} onChange={e=>setForm({...form,caption:e.target.value})} style={{resize:'vertical'}}/>
        </div>
        <div style={{display:'flex',gap:10,marginTop:20,justifyContent:'flex-end'}}>
          <button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving||!form.title}>{saving?'Saving...':'Save Post'}</button>
        </div>
      </div></div>}
    </div>
  );
}