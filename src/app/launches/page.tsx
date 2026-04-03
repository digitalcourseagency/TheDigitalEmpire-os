"use client";
import{useEffect,useState}from"react";
import{supabase}from"@/lib/supabase";
import{Plus}from"lucide-react";
export default function Page(){
  const[data,setData]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{supabase.from("launches").select("*").order("created_at",{ascending:false}).then(({data:d})=>{setData(d||[]);setLoading(false);});},[]);
  return(
    <div style={{maxWidth:1100,animation:"slideUp 0.4s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
        <div><h1 className="font-display" style={{fontSize:34,fontWeight:400}}>Launches</h1><div style={{fontSize:13,color:"#9A9188",marginTop:2}}>{data.length} launches tracked</div></div>
        <button className="btn btn-primary"><Plus size={14}/> Plan Launch</button>
      </div>
      {loading?<div className="skeleton" style={{height:200}}/>:data.length===0?(
        <div style={{textAlign:"center",padding:"64px 0"}}><div style={{fontSize:13,color:"#9A9188"}}>No launches yet. Start planning.</div></div>
      ):(
        <div style={{display:"grid",gap:12}}>{data.map((l:any)=>(<div key={l.id} className="card"><div style={{fontWeight:500,fontSize:15}}>{l.name}</div><div style={{fontSize:12,color:"#9A9188",marginTop:4}}>{l.status} {l.revenue_goal?'· Goal: $'+l.revenue_goal.toLocaleString():''}</div></div>))}</div>
      )}
    </div>
  );
}