"use client";
import{useEffect,useState}from"react";
import{supabase}from"@/lib/supabase";
import{Plus,X,Pencil,Trash2,ExternalLink,ChevronDown,ChevronUp}from"lucide-react";
const DT=["Gifted","Paid Partnership","Affiliate","Ambassador","Trade","Collab","Other"];
const DST=["Outreach","Negotiating","Contract Sent","Active","Completed","Declined","Expired"];
const PL=["Instagram","TikTok","YouTube","Substack","All","Other"];
const BR=[{code:"AC",color:"#2C2C2A"},{code:"DCA",color:"#C8432A"},{code:"DES",color:"#185FA5"},{code:"OOG",color:"#B89A5A"},{code:"LLL",color:"#888480"}];
const SC:Record<string,string>={Outreach:"#B8B0A5",Negotiating:"#185FA5","Contract Sent":"#7B5EA7",Active:"#2C9D6A",Completed:"#B89A5A",Declined:"#C8432A",Expired:"#B8B0A5"};
function ef(){return{brand_name:"",contact_name:"",contact_email:"",platform:"Instagram",deal_type:"Gifted",status:"Outreach",value:"",deliverables:"",deadline:"",notes:"",contract_url:"",my_brand:"AC"};}
export default function BrandDealsPage(){
  const[deals,setDeals]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[open,setOpen]=useState(false);
  const[editing,setEditing]=useState<any>(null);
  const[form,setForm]=useState<any>(ef());
  const[saving,setSaving]=useState(false);
  const[expanded,setExpanded]=useState<string|null>(null);
  const[fSt,setFSt]=useState("all");
  const[fBr,setFBr]=useState("all");
  useEffect(()=>{load();},[]);
  async function load(){const{data}=await supabase.from("brand_deals").select("*").order("created_at",{ascending:false});setDeals(data||[]);setLoading(false);}
  async function save(){if(!form.brand_name)return;setSaving(true);const p={brand_name:form.brand_name,contact_name:form.contact_name||null,contact_email:form.contact_email||null,platform:form.platform,deal_type:form.deal_type,status:form.status,value:form.value?parseFloat(form.value):null,deliverables:form.deliverables||null,deadline:form.deadline||null,notes:form.notes||null,contract_url:form.contract_url||null,my_brand:form.my_brand};if(editing){await supabase.from("brand_deals").update(p).eq("id",editing.id);}else{await supabase.from("brand_deals").insert(p);}setSaving(false);setOpen(false);setEditing(null);load();}
  async function del(id:string){if(!confirm("Delete?"))return;await supabase.from("brand_deals").delete().eq("id",id);load();}
  function edit(deal:any){setEditing(deal);setForm({brand_name:deal.brand_name||"",contact_name:deal.contact_name||"",contact_email:deal.contact_email||"",platform:deal.platform||"Instagram",deal_type:deal.deal_type||"Gifted",status:deal.status||"Outreach",value:deal.value?.toString()||"",deliverables:deal.deliverables||"",deadline:deal.deadline||"",notes:deal.notes||"",contract_url:deal.contract_url||"",my_brand:deal.my_brand||"AC"});setOpen(true);}
  const fil=deals.filter(d=>(fSt==="all"||d.status===fSt)&&(fBr==="all"||d.my_brand===fBr));
  const earned=fil.filter(d=>d.status==="Active"||d.status==="Completed").reduce((s,d)=>s+(d.value||0),0);
  const pipeline=fil.filter(d=>["Outreach","Negotiating","Contract Sent"].includes(d.status)).reduce((s,d)=>s+(d.value||0),0);
  return(<div style={{maxWidth:1100}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
      <div><h1 style={{fontFamily:"Georgia,serif",fontSize:34,fontWeight:400}}>Brand Deals</h1><div style={{fontSize:13,color:"#9A9188",marginTop:2}}>Track partnerships, gifted collabs, and affiliate deals</div></div>
      <button className="btn btn-primary" onClick={()=>{setEditing(null);setForm(ef());setOpen(true);}}><Plus size={14}/> New Deal</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
      {([["Total",fil.length,"#1A1917"],["Earned","$"+earned.toLocaleString(),"#2C9D6A"],["Pipeline","$"+pipeline.toLocaleString(),"#B89A5A"],["Pending",fil.filter(d=>d.status==="Contract Sent").length+" contracts","#7B5EA7"]]as any[]).map(([l,v,c])=>(<div key={l} className="card" style={{textAlign:"center"}}><div style={{fontSize:24,fontFamily:"Georgia,serif",color:c,fontWeight:400}}>{v}</div><div style={{fontSize:11,color:"#9A9188",marginTop:2}}>{l}</div></div>))}
    </div>
    <div style={{display:"flex",gap:10,marginBottom:20}}>
      <select className="input" style={{width:"auto",fontSize:12}} value={fSt} onChange={e=>setFSt(e.target.value)}><option value="all">All Statuses</option>{DST.map(s=><option key={s}>{s}</option>)}</select>
      <select className="input" style={{width:"auto",fontSize:12}} value={fBr} onChange={e=>setFBr(e.target.value)}><option value="all">All Brands</option>{BR.map(b=><option key={b.code} value={b.code}>{b.code}</option>)}</select>
      <div style={{marginLeft:"auto",fontSize:12,color:"#9A9188",alignSelf:"center"}}>{fil.length} deals</div>
    </div>
    {loading?<div className="skeleton" style={{height:300}}/>:(
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {fil.length===0&&<div style={{textAlign:"center",padding:"48px 0",color:"#9A9188",fontSize:13}}>No brand deals yet.</div>}
        {fil.map(deal=>{const isExp=expanded===deal.id;const b=BR.find(x=>x.code===deal.my_brand);return(
          <div key={deal.id} className="card" style={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"14px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:b?.color||"#B89A5A"}}/>
                    <span style={{fontSize:14,fontWeight:500,color:"#1A1917"}}>{deal.brand_name}</span>
                    {deal.value&&<span style={{fontSize:12,color:"#2C9D6A",fontFamily:"Georgia,serif"}}>${deal.value.toLocaleString()}</span>}
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:(SC[deal.status]||"#B8B0A5")+"22",color:SC[deal.status]||"#B8B0A5"}}>{deal.status}</span>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:"#EDE8E1",color:"#7D7470"}}>{deal.deal_type}</span>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:"#EDE8E1",color:"#7D7470"}}>{deal.platform}</span>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:"#EDE8E1",color:"#7D7470"}}>{deal.my_brand}</span>
                    {deal.contact_name&&<span style={{fontSize:10,color:"#9A9188"}}>{deal.contact_name}</span>}
                    {deal.deadline&&<span style={{fontSize:10,color:"#9A9188"}}>Due {new Date(deal.deadline).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>}
                  </div>
                </div>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  {deal.contract_url&&<a href={deal.contract_url} target="_blank" rel="noopener noreferrer" style={{color:"#B89A5A"}}><ExternalLink size={13}/></a>}
                  <button onClick={()=>edit(deal)} style={{background:"none",border:"none",cursor:"pointer",color:"#B89A5A"}}><Pencil size={13}/></button>
                  <button onClick={()=>del(deal.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#B8B0A5"}}><Trash2 size={13}/></button>
                  <button onClick={()=>setExpanded(isExp?null:deal.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#B8B0A5"}}>{isExp?<ChevronUp size={14}/>:<ChevronDown size={14}/>}</button>
                </div>
              </div>
            </div>
            {isExp&&(<div style={{borderTop:"0.5px solid #EDE8E1",padding:"12px 16px",background:"#FDFCFA",display:"grid",gap:10}}>
              {deal.deliverables&&<div><div style={{fontSize:9,textTransform:"uppercase",color:"#B8B0A5",marginBottom:2}}>Deliverables</div><div style={{fontSize:12,color:"#444140",whiteSpace:"pre-line"}}>{deal.deliverables}</div></div>}
              {deal.contact_email&&<div><div style={{fontSize:9,textTransform:"uppercase",color:"#B8B0A5",marginBottom:2}}>Contact</div><div style={{fontSize:12,color:"#444140"}}>{deal.contact_name} · {deal.contact_email}</div></div>}
              {deal.notes&&<div><div style={{fontSize:9,textTransform:"uppercase",color:"#B8B0A5",marginBottom:2}}>Notes</div><div style={{fontSize:12,color:"#7D7470"}}>{deal.notes}</div></div>}
            </div>)}
          </div>
        );})}
      </div>
    )}
    {open&&(<div className="modal-overlay" onClick={()=>setOpen(false)}>
      <div className="modal" style={{maxWidth:580}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:22}}>{editing?"Edit Deal":"New Brand Deal"}</div>
          <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",cursor:"pointer"}}><X size={18}/></button>
        </div>
        <div style={{display:"grid",gap:12}}>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Brand / Company</label><input className="input" value={form.brand_name} onChange={e=>setForm((f:any)=>({...f,brand_name:e.target.value}))} placeholder="Fashion Nova, Revolve, Amazon..."/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Contact Name</label><input className="input" value={form.contact_name} onChange={e=>setForm((f:any)=>({...f,contact_name:e.target.value}))} placeholder="Their name"/></div>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Contact Email</label><input className="input" value={form.contact_email} onChange={e=>setForm((f:any)=>({...f,contact_email:e.target.value}))} placeholder="name@brand.com"/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Type</label><select className="input" value={form.deal_type} onChange={e=>setForm((f:any)=>({...f,deal_type:e.target.value}))}>{DT.map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Platform</label><select className="input" value={form.platform} onChange={e=>setForm((f:any)=>({...f,platform:e.target.value}))}>{PL.map(p=><option key={p}>{p}</option>)}</select></div>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Status</label><select className="input" value={form.status} onChange={e=>setForm((f:any)=>({...f,status:e.target.value}))}>{DST.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>My Brand</label><select className="input" value={form.my_brand} onChange={e=>setForm((f:any)=>({...f,my_brand:e.target.value}))}>{BR.map(b=><option key={b.code} value={b.code}>{b.code}</option>)}</select></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Value ($)</label><input className="input" type="number" value={form.value} onChange={e=>setForm((f:any)=>({...f,value:e.target.value}))} placeholder="0"/></div>
            <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Deadline</label><input className="input" type="date" value={form.deadline} onChange={e=>setForm((f:any)=>({...f,deadline:e.target.value}))}/></div>
          </div>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Deliverables</label><textarea className="input" rows={3} value={form.deliverables} onChange={e=>setForm((f:any)=>({...f,deliverables:e.target.value}))} placeholder="Reels, Stories, posts..."/></div>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Notes</label><textarea className="input" rows={2} value={form.notes} onChange={e=>setForm((f:any)=>({...f,notes:e.target.value}))} placeholder="Terms, usage rights, exclusivity..."/></div>
          <div><label style={{fontSize:11,textTransform:"uppercase",color:"#9A9188",display:"block",marginBottom:4}}>Contract URL</label><input className="input" value={form.contract_url} onChange={e=>setForm((f:any)=>({...f,contract_url:e.target.value}))} placeholder="https://drive.google.com/..."/></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}>
          <button className="btn btn-ghost" onClick={()=>setOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?"Saving...":editing?"Update":"Add Deal"}</button>
        </div>
      </div>
    </div>)}
  </div>);
}
