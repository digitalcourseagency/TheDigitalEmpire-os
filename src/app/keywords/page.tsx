"use client";
import{useEffect,useState}from"react";
import{supabase}from"@/lib/supabase";
import{Plus,X,Zap}from"lucide-react";
const BRANDS=[{id:'20e8bb0e-29fd-492e-ad91-2beb239e4b0f',abbr:'AC',color:'#2C2C2A'},{id:'caa9919a-5fe0-4e67-844a-fd75f3170516',abbr:'DCA',color:'#C8432A'},{id:'ba48df91-58dc-4471-93f4-1c2a9ba69d35',abbr:'DES',color:'#185FA5'},{id:'a80ef03f-697b-47da-9c73-81b9b4d2717e',abbr:'LLL',color:'#888480'},{id:'f4aec731-0842-493e-b17f-56e5265318ac',abbr:'OOG',color:'#B89A5A'},{id:'41d737ec-4a5a-425c-9f1e-ad509988c3d8',abbr:'TDI',color:'#534AB7'}];
export default function Page(){
  const[data,setData]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[open,setOpen]=useState(false);
  const[form,setForm]=useState({keyword:'',brand_id:'',destination:'',destination_url:'',purpose:'',active:true});
  const[saving,setSaving]=useState(false);
  useEffect(()=>{load();},[]);
  async function load(){const{data:d}=await supabase.from('keywords').select('*').order('triggers_total',{ascending:false});setData(d||[]);setLoading(false);}
  async function save(){
    if(!form.keyword)return;
    setSaving(true);
    await supabase.from('keywords').insert({keyword:form.keyword,brand_id:form.brand_id||null,destination:form.destination||null,destination_url:form.destination_url||null,purpose:form.purpose||null,active:form.active,triggers_this_week:0,triggers_total:0});
    setSaving(false);setOpen(false);setForm({keyword:'',brand_id:'',destination:'',destination_url:'',purpose:'',active:true});load();
  }
  return(
    <div style={{maxWidth:900}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
        <div><h1 style={{fontFamily:'Georgia,serif',fontSize:34,fontWeight:400}}>ManyChat Keywords</h1><div style={{fontSize:13,color:'#9A9188',marginTop:2}}>{data.filter(k=>k.active).length} active</div></div>
        <button className="btn btn-primary" onClick={()=>setOpen(true)}><Plus size={14}/> Add Keyword</button>
      </div>
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        {loading?<div style={{padding:24}}><div className="skeleton" style={{height:40}}/></div>:data.length===0?(<div style={{textAlign:'center',padding:'48px 0'}}><Zap size={32} color="#B8B0A5" style={{margin:'0 auto 12px'}}/><div style={{fontSize:13,color:'#9A9188',marginBottom:12}}>No keywords yet.</div><button className="btn btn-primary" onClick={()=>setOpen(true)}>Add First Keyword</button></div>):(<table className="data-table"><thead><tr><th>Keyword</th><th>Destination</th><th>This Week</th><th>Total</th><th>Status</th></tr></thead><tbody>{data.map((k:any)=>(<tr key={k.id}><td style={{fontWeight:500}}>{k.keyword}</td><td style={{fontSize:12,color:'#7D7470'}}>{k.destination||'—'}</td><td>{k.triggers_this_week||0}</td><td>{k.triggers_total||0}</td><td><span style={{fontSize:11,padding:'3px 10px',borderRadius:100,background:k.active?'#D1FAE5':'#EDE8E1',color:k.active?'#065F46':'#9A9188'}}>{k.active?'Active':'Inactive'}</span></td></tr>))}</tbody></table>)}
      </div>
      {open&&<div className="modal-overlay" onClick={()=>setOpen(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><div style={{fontFamily:'Georgia,serif',fontSize:22}}>Add Keyword</div><button onClick={()=>setOpen(false)} style={{background:'none',border:'none',cursor:'pointer'}}><X size={18}/></button></div><div style={{display:'grid',gap:12}}><div><label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9A9188',display:'block',marginBottom:4}}>Keyword *</label><input className="input" placeholder="digital stream" value={form.keyword} onChange={e=>setForm(f=>({...f,keyword:e.target.value}))}/></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><div><label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9A9188',display:'block',marginBottom:4}}>Brand</label><select className="input" value={form.brand_id} onChange={e=>setForm(f=>({...f,brand_id:e.target.value}))}><option value="">Select brand</option>{BRANDS.map(b=>(<option key={b.id} value={b.id}>{b.abbr}</option>))}</select></div><div><label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9A9188',display:'block',marginBottom:4}}>Destination</label><input className="input" placeholder="DM Flow / Link" value={form.destination} onChange={e=>setForm(f=>({...f,destination:e.target.value}))}/></div></div><div><label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9A9188',display:'block',marginBottom:4}}>Destination URL</label><input className="input" placeholder="https://..." value={form.destination_url} onChange={e=>setForm(f=>({...f,destination_url:e.target.value}))}/></div><div><label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9A9188',display:'block',marginBottom:4}}>Purpose</label><input className="input" placeholder="Free class signup" value={form.purpose} onChange={e=>setForm(f=>({...f,purpose:e.target.value}))}/></div><div style={{display:'flex',alignItems:'center',gap:10}}><input type="checkbox" id="active" checked={form.active} onChange={e=>setForm(f=>({...f,active:e.target.checked}))}/><label htmlFor="active" style={{fontSize:13,color:'#444140'}}>Active</label></div></div><div style={{display:'flex',gap:10,marginTop:20,justifyContent:'flex-end'}}><button className="btn btn-ghost" onClick={()=>setOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving...':'Save'}</button></div></div></div>}
    </div>
  );
}