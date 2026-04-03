"use client";
import{useEffect,useState}from"react";
import{supabase}from"@/lib/supabase";
import{Plus,Zap}from"lucide-react";
export default function Page(){
  const[data,setData]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{supabase.from("keywords").select("*").order("triggers_total",{ascending:false}).then(({data:d})=>{setData(d||[]);setLoading(false);});},[]);
  return(
    <div style={{maxWidth:900,animation:"slideUp 0.4s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div><h1 className="font-display" style={{fontSize:34,fontWeight:400}}>ManyChat Keywords</h1><div style={{fontSize:13,color:"#9A9188",marginTop:2}}>{data.filter(k=>k.active).length} active</div></div>
        <button className="btn btn-primary"><Plus size={14}/> Add Keyword</button>
      </div>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        {loading?<div style={{padding:24}}><div className="skeleton" style={{height:40}}/></div>:data.length===0?(
          <div style={{textAlign:"center",padding:"48px 0"}}><Zap size={32} color="#B8B0A5" style={{margin:"0 auto 12px"}}/><div style={{fontSize:13,color:"#9A9188"}}>No keywords yet.</div></div>
        ):(
          <table className="data-table"><thead><tr><th>Keyword</th><th>Destination</th><th>This Week</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>{data.map((k:any)=>(<tr key={k.id}><td style={{fontWeight:500}}>{k.keyword}</td><td style={{fontSize:12,color:"#7D7470"}}>{k.destination||'—'}</td><td>{k.triggers_this_week||0}</td><td>{k.triggers_total||0}</td><td><span style={{fontSize:11,padding:"3px 10px",borderRadius:100,background:k.active?"#D1FAE5":"#EDE8E1",color:k.active?"#065F46":"#9A9188"}}>{k.active?"Active":"Inactive"}</span></td></tr>))}
          </tbody></table>
        )}
      </div>
    </div>
  );
}