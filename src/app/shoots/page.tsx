"use client";
import{useEffect,useState}from"react";
import{supabase}from"@/lib/supabase";
import{Plus,Camera}from"lucide-react";
export default function Page(){
  const[data,setData]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{supabase.from("shoots").select("*").order("shoot_date",{ascending:true}).then(({data:d})=>{setData(d||[]);setLoading(false);});},[]);
  const STATUS_COLOR:Record<string,string>={Planned:"#EDE8E1",Confirmed:"#FEF3C7",Shooting:"#DBEAFE",Editing:"#E0E7FF",Complete:"#D1FAE5"};
  return(
    <div style={{maxWidth:1000,animation:"slideUp 0.4s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div><h1 className="font-display" style={{fontSize:34,fontWeight:400}}>Content Shoots</h1><div style={{fontSize:13,color:"#9A9188",marginTop:2}}>{data.length} shoots</div></div>
        <button className="btn btn-primary"><Plus size={14}/> Plan Shoot</button>
      </div>
      {loading?<div className="skeleton" style={{height:200}}/>:data.length===0?(
        <div style={{textAlign:"center",padding:"64px 0"}}><Camera size={32} color="#B8B0A5" style={{margin:"0 auto 12px"}}/><div style={{fontSize:13,color:"#9A9188"}}>No shoots planned yet.</div></div>
      ):(
        <div style={{display:"grid",gap:12}}>{data.map((s:any)=>(<div key={s.id} className="card" style={{borderLeft:"4px solid #B89A5A"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><span style={{fontSize:15,fontWeight:500}}>{s.name}</span><span style={{fontSize:11,padding:"2px 8px",borderRadius:100,background:STATUS_COLOR[s.status||"Planned"]||"#EDE8E1",color:"#7D7470",marginLeft:10}}>{s.status}</span></div>{s.shoot_date&&<div style={{fontSize:12,color:"#9A9188"}}>{new Date(s.shoot_date).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</div>}</div>{s.theme&&<div style={{fontSize:12,color:"#7D7470",marginTop:6}}>{s.theme}</div>}</div>))}
        </div>
      )}
    </div>
  );
}