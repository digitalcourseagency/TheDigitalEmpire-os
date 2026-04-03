"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
const BRANDS=[{id:"20e8bb0e-29fd-492e-ad91-2beb239e4b0f",name:"Ash Couture",abbr:"AC",color:"#2C2C2A"},{id:"caa9919a-5fe0-4e67-844a-fd75f3170516",name:"Digital Course Agency",abbr:"DCA",color:"#C8432A"},{id:"ba48df91-58dc-4471-93f4-1c2a9ba69d35",name:"Digital Expert School",abbr:"DES",color:"#185FA5"},{id:"a80ef03f-697b-47da-9c73-81b9b4d2717e",name:"Lux Leisure Lifestyle",abbr:"LLL",color:"#888480"},{id:"f4aec731-0842-493e-b17f-56e5265318ac",name:"Opulent Outreach Group",abbr:"OOG",color:"#B89A5A"},{id:"41d737ec-4a5a-425c-9f1e-ad509988c3d8",name:"TikTok Digital Income",abbr:"TDI",color:"#534AB7"}];
export default function DashboardPage(){
  const [postCount,setPostCount]=useState(0);
  const [ideaCount,setIdeaCount]=useState(0);
  const [revenue,setRevenue]=useState(0);
  const [recentPosts,setRecentPosts]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    async function load(){
      const [{count:pc},{count:ic},{data:posts},{data:calls}]=await Promise.all([
        supabase.from('posts').select('id',{count:'exact',head:true}),
        supabase.from('ideas').select('id',{count:'exact',head:true}),
        supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(5),
        supabase.from('calls').select('revenue').eq('outcome','Closed'),
      ]);
      setPostCount(pc||0);
      setIdeaCount(ic||0);
      setRecentPosts(posts||[]);
      setRevenue((calls||[]).reduce((s:number,c:any)=>s+(c.revenue||0),0));
      setLoading(false);
    }
    load();
  },[]);
  const today=new Date();
  const greeting=today.getHours()<12?'Good morning':today.getHours()<17?'Good afternoon':'Good evening';
  if(loading) return <div style={{display:'flex',flexDirection:'column',gap:20}}><div className="skeleton" style={{height:32,width:280}}/><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>{[1,2,3,4].map(i=><div key={i} className="skeleton" style={{height:100}}/>)}</div></div>;
  return(
    <div style={{maxWidth:1100,animation:'slideUp 0.4s ease'}}>
      <div style={{marginBottom:32}}>
        <div style={{fontSize:13,color:'#9A9188',marginBottom:4}}>{today.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</div>
        <h1 className="font-display" style={{fontSize:36,color:'#1A1917',fontWeight:400}}>{greeting}, Ash ✦</h1>
        <p style={{fontSize:14,color:'#7D7470',marginTop:4}}>Your content empire, at a glance.</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
        {[{label:'Posts Created',value:postCount,color:'#B89A5A'},{label:'Ideas Banked',value:ideaCount,color:'#2C2C2A'},{label:'Revenue Closed',value:'$'+revenue.toLocaleString(),color:'#C8432A'},{label:'Brands Active',value:BRANDS.length,color:'#185FA5'}].map(s=>(
          <div key={s.label} className="card" style={{borderTop:'3px solid '+s.color}}>
            <div style={{fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',color:'#9A9188',marginBottom:8}}>{s.label}</div>
            <div className="font-display" style={{fontSize:32,color:'#1A1917',lineHeight:1}}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid #F7F4F0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div className="font-display" style={{fontSize:18}}>Recent Posts</div>
          <Link href="/posts" style={{fontSize:12,color:'#B89A5A',textDecoration:'none',display:'flex',alignItems:'center',gap:4}}>All posts <ArrowRight size={12}/></Link>
        </div>
        {recentPosts.length===0?(
          <div style={{padding:'32px 20px',textAlign:'center'}}><div style={{fontSize:13,color:'#9A9188',marginBottom:12}}>No posts yet. Start creating.</div><Link href="/posts" className="btn btn-primary" style={{fontSize:12}}>Add First Post</Link></div>
        ):(
          <table className="data-table"><thead><tr><th>Title</th><th>Brand</th><th>Status</th><th>Platform</th></tr></thead>
          <tbody>{recentPosts.map(p=>{const brand=BRANDS.find(b=>b.id===p.brand_id);return(<tr key={p.id}><td style={{maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.title}</td><td>{brand&&<span className="brand-pill" style={{background:brand.color+'22',color:brand.color}}>{brand.abbr}</span>}</td><td><span style={{fontSize:11,padding:'2px 8px',borderRadius:100,background:'#EDE8E1',color:'#7D7470'}}>{p.status}</span></td><td style={{fontSize:12,color:'#9A9188'}}>{p.platform||'—'}</td></tr>);})}
          </tbody></table>
        )}
      </div>
    </div>
  );
}