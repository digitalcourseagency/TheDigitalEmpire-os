"use client";
import{useEffect,useState}from"react";
import{supabase}from"@/lib/supabase";
import{Plus}from"lucide-react";
export default function Page(){
  const[data,setData]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{supabase.from("analytics").select("*").order("week_of",{ascending:false}).then(({data:d})=>{setData(d||[]);setLoading(false);});},[]);
  const latest=data[0];
  return(
    <div style={{maxWidth:1100,animation:"slideUp 0.4s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
        <div><h1 className="font-display" style={{fontSize:34,fontWeight:400}}>Analytics</h1><div style={{fontSize:13,color:"#9A9188",marginTop:2}}>Weekly performance tracking</div></div>
        <button className="btn btn-primary"><Plus size={14}/> Log Week</button>
      </div>
      {latest&&<div className="card" style={{marginBottom:24}}>
        <div className="font-display" style={{fontSize:20,marginBottom:16}}>Latest Snapshot</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
          {[{label:"IG Followers",value:latest.ig_followers?.toLocaleString()||"—"},{label:"Best Reel Views",value:latest.best_reel_views?.toLocaleString()||"—"},{label:"ManyChat DMs",value:latest.manychat_dms?.toLocaleString()||"—"},{label:"Revenue",value:latest.revenue_total?"$"+latest.revenue_total.toLocaleString():"—"}].map(s=>(<div key={s.label} style={{textAlign:"center"}}><div className="font-display" style={{fontSize:28}}>{s.value}</div><div style={{fontSize:11,color:"#9A9188",marginTop:4,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.label}</div></div>))}
        </div>
      </div>}
      {loading?<div className="skeleton" style={{height:200}}/>:data.length===0?(
        <div style={{textAlign:"center",padding:"64px 0"}}><div style={{fontSize:13,color:"#9A9188"}}>No analytics logged yet.</div></div>
      ):(
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <table className="data-table"><thead><tr><th>Week</th><th>IG Followers</th><th>Growth</th><th>Best Reel</th><th>TikTok Views</th><th>Revenue</th></tr></thead>
          <tbody>{data.map((e:any)=>(<tr key={e.id}><td style={{fontSize:12}}>{new Date(e.week_of).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</td><td>{e.ig_followers?.toLocaleString()||"—"}</td><td style={{color:(e.ig_follower_growth||0)>0?"#065F46":"#9A9188"}}>{e.ig_follower_growth?"+"+e.ig_follower_growth:"—"}</td><td>{e.best_reel_views?.toLocaleString()||"—"}</td><td>{e.tiktok_views?.toLocaleString()||"—"}</td><td style={{fontWeight:500}}>{e.revenue_total?"$"+e.revenue_total.toLocaleString():"—"}</td></tr>))}
          </tbody></table>
        </div>
      )}
    </div>
  );
}