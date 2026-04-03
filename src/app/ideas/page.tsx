"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus } from "lucide-react";
const BRANDS=[{id:"20e8bb0e-29fd-492e-ad91-2beb239e4b0f",name:"Ash Couture",abbr:"AC",color:"#2C2C2A"},{id:"caa9919a-5fe0-4e67-844a-fd75f3170516",name:"Digital Course Agency",abbr:"DCA",color:"#C8432A"},{id:"ba48df91-58dc-4471-93f4-1c2a9ba69d35",name:"Digital Expert School",abbr:"DES",color:"#185FA5"},{id:"a80ef03f-697b-47da-9c73-81b9b4d2717e",name:"Lux Leisure Lifestyle",abbr:"LLL",color:"#888480"},{id:"f4aec731-0842-493e-b17f-56e5265318ac",name:"Opulent Outreach Group",abbr:"OOG",color:"#B89A5A"},{id:"41d737ec-4a5a-425c-9f1e-ad509988c3d8",name:"TikTok Digital Income",abbr:"TDI",color:"#534AB7"}];
const URGENCY_COLOR:Record<string,string>={High:"#C8432A",Medium:"#B89A5A",Low:"#9A9188"};
export default function IdeasPage(){
  const [ideas,setIdeas]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [showModal,setShowModal]=useState(false);
  const [form,setForm]=useState<any>({urgency:'Medium',status:'Idea'});
  const [saving,setSaving]=useState(false);
  async function load(){setLoading(true);const{data}=await supabase.from('ideas').select('*').order('created_at',{ascending:false});setIdeas(data||[]);setLoading(false);}
  useEffect(()=>{load();},[]);
  async function save(){setSaving(true);if(form.id)await supabase.from('ideas').update(form).eq('id',form.id);else await supabase.from('ideas').insert(form);setSaving(false);setShowModal(false);load();}
  const grouped:Record<string,any[]>={};
  ideas.forEach(i=>{const k=i.urgency||'Medium';if(!grouped[k])grouped[k]=[];grouped[k].push(i);});
  return(
    <div style={{maxWidth:1100,animation:'slideUp 0.4s ease'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28}}>
        <div><h1 className="font-display" style={{fontSize:34,fontWeight:400}}>Ideas Bank</h1><div style={{fontSize:13,color:'#9A9188',marginTop:2}}>{ideas.length} ideas captured</div></div>
        <button className="btn btn-primary" onClick={()=>{setForm({urgency:'Medium',status:'Idea'});setShowModal(true);}}><Plus size={14}/> Capture Idea</button>
      </div>
      {loading?<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>{[1,2,3,4,5,6].map(i=><div key={i} className="skeleton" style={{height:100}}/>)}</div>:ideas.length===0?(
        <div style={{textAlign:'center',padding:'64px 0'}}><div style={{fontSize:14,color:'#9A9188',marginBottom:16}}>No ideas yet. Start capturing.</div><button className="btn btn-primary" onClick={()=>{setForm({urgency:'Medium',status:'Idea'});setShowModal(true);}}>Capture First Idea</button></div>
      ):(
        <div>{['High','Medium','Low'].map(urgency=>{const items=grouped[urgency];if(!items||items.length===0)return null;return(
          <div key={urgency} style={{marginBottom:28}}>
            <div style={{fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',color:URGENCY_COLOR[urgency],fontWeight:500,marginBottom:12}}>{urgency} Urgency <span style={{color:'#B8B0A5'}}>({items.length})</span></div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
              {items.map(idea=>{const brand=BRANDS.find(b=>b.id===idea.brand_id);return(
                <div key={idea.id} className="card" style={{borderLeft:'3px solid '+URGENCY_COLOR[urgency]}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{fontSize:13,fontWeight:400,flex:1}}>{idea.title}</span>
                    <button onClick={()=>{setForm(idea);setShowModal(true);}} style={{background:'none',border:'none',cursor:'pointer',fontSize:12,color:'#B89A5A',fontFamily:'var(--font-jost)',marginLeft:8}}>Edit</button>
                  </div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {brand&&<span className="brand-pill" style={{background:brand.color+'20',color:brand.color}}>{brand.abbr}</span>}
                    {idea.type&&<span style={{fontSize:11,color:'#9A9188'}}>{idea.type}</span>}
                  </div>
                  {idea.notes&&<div style={{fontSize:12,color:'#7D7470',marginTop:8,lineHeight:1.5}}>{idea.notes}</div>}
                </div>
              );}}
            </div>
          </div>
        );}}
        </div>
      )}
      {showModal&&<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}><div className="modal">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><div className="font-display" style={{fontSize:22}}>{form.id?'Edit Idea':'Capture Idea'}</div><button onClick={()=>setShowModal(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:'#9A9188'}}>×</button></div>
        <div style={{display:'grid',gap:12}}>
          <input className="input" placeholder="What's the idea? *" value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <select className="input" value={form.brand_id||''} onChange={e=>setForm({...form,brand_id:e.target.value})}><option value="">— Brand —</option>{BRANDS.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
            <select className="input" value={form.urgency||'Medium'} onChange={e=>setForm({...form,urgency:e.target.value})}><option>High</option><option>Medium</option><option>Low</option></select>
          </div>
          <textarea className="input" rows={3} placeholder="Any context or details..." value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} style={{resize:'vertical'}}/>
        </div>
        <div style={{display:'flex',gap:10,marginTop:20,justifyContent:'flex-end'}}>
          <button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving||!form.title}>{saving?'Saving...':'Save Idea'}</button>
        </div>
      </div></div>}
    </div>
  );
}