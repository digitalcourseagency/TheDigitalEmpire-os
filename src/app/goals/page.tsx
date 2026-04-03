"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus } from "lucide-react";
export default function GoalsPage(){
  const [weeklies,setWeeklies]=useState<any[]>([]);
  const [quarterly,setQuarterly]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [showWeekly,setShowWeekly]=useState(false);
  const [form,setForm]=useState<any>({});
  const [saving,setSaving]=useState(false);
  async function load(){setLoading(true);const[{data:wg},{data:qg}]=await Promise.all([supabase.from('weekly_goals').select('*').order('week_of',{ascending:false}).limit(8),supabase.from('quarterly_goals').select('*').order('year',{ascending:false}).limit(1).maybeSingle()]);setWeeklies(wg||[]);setQuarterly(qg||null);setLoading(false);}
  useEffect(()=>{load();},[]);
  async function save(){setSaving(true);if(form.id)await supabase.from('weekly_goals').update(form).eq('id',form.id);else await supabase.from('weekly_goals').insert(form);setSaving(false);setShowWeekly(false);load();}
  const current=weeklies[0];
  function Progress({label,actual,target,color}:{label:string;actual:number;target:number;color:string}){
    const pct=target>0?Math.min(100,Math.round((actual/target)*100)):0;
    return(<div style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:12}}><span style={{color:'#444140'}}>{label}</span><span style={{color:'#9A9188'}}>{actual}/{target}</span></div><div className="progress-bar"><div className="progress-fill" style={{width:pct+'%',background:color}}/></div></div>);
  }
  return(
    <div style={{maxWidth:1100,animation:'slideUp 0.4s ease'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28}}>
        <h1 className="font-display" style={{fontSize:34,fontWeight:400}}>Goals & Tracking</h1>
        <button className="btn btn-primary" onClick={()=>{setForm({week_of:new Date().toISOString().split('T')[0],ac_posts_target:5,ac_posts_actual:0,dca_posts_target:3,dca_posts_actual:0,tiktok_posts_target:7,tiktok_posts_actual:0,strategy_calls_target:8,strategy_calls_actual:0,webinars_target:2,webinars_actual:0,revenue_target:0,revenue_actual:0,posting_streak:0});setShowWeekly(true);}}><Plus size={14}/> New Week</button>
      </div>
      {loading?<div style={{display:'grid',gap:16}}>{[1,2].map(i=><div key={i} className="skeleton" style={{height:200}}/>)}</div>:(
        <div>
          {quarterly&&<div className="card" style={{marginBottom:24,borderTop:'3px solid #B89A5A'}}>
            <div className="font-display" style={{fontSize:20,marginBottom:20}}>Q{quarterly.quarter} {quarterly.year} Goals</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16}}>
              <Progress label="Revenue" actual={quarterly.revenue_actual||0} target={quarterly.revenue_target||0} color="#B89A5A"/>
              <Progress label="IG Followers" actual={quarterly.ig_followers_actual||0} target={quarterly.ig_followers_target||0} color="#2C2C2A"/>
              <Progress label="DCA Clients" actual={quarterly.dca_clients_actual||0} target={quarterly.dca_clients_target||0} color="#C8432A"/>
              <Progress label="TikTok Followers" actual={quarterly.tiktok_followers_actual||0} target={quarterly.tiktok_followers_target||0} color="#534AB7"/>
            </div>
          </div>}
          {current&&<div className="card" style={{marginBottom:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div><div className="font-display" style={{fontSize:20}}>This Week</div><div style={{fontSize:12,color:'#9A9188'}}>Week of {new Date(current.week_of).toLocaleDateString('en-US',{month:'long',day:'numeric'})}</div></div>
              <button className="btn btn-ghost" onClick={()=>{setForm(current);setShowWeekly(true);}} style={{fontSize:12}}>Update</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
              <Progress label="AC Posts" actual={current.ac_posts_actual||0} target={current.ac_posts_target||0} color="#2C2C2A"/>
              <Progress label="DCA Posts" actual={current.dca_posts_actual||0} target={current.dca_posts_target||0} color="#C8432A"/>
              <Progress label="TikTok Posts" actual={current.tiktok_posts_actual||0} target={current.tiktok_posts_target||0} color="#534AB7"/>
              <Progress label="Strategy Calls" actual={current.strategy_calls_actual||0} target={current.strategy_calls_target||0} color="#B89A5A"/>
              <Progress label="Webinars" actual={current.webinars_actual||0} target={current.webinars_target||0} color="#185FA5"/>
              <Progress label="Revenue" actual={current.revenue_actual||0} target={current.revenue_target||0} color="#B89A5A"/>
            </div>
          </div>}
          {weeklies.length===0&&!quarterly&&<div style={{textAlign:'center',padding:'64px 0'}}><div style={{fontSize:13,color:'#9A9188',marginBottom:16}}>No goals set yet.</div><button className="btn btn-primary" onClick={()=>setShowWeekly(true)}>Set This Week's Goals</button></div>}
        </div>
      )}
      {showWeekly&&<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowWeekly(false)}><div className="modal" style={{maxWidth:500}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><div className="font-display" style={{fontSize:22}}>{form.id?'Edit Week':'New Weekly Plan'}</div><button onClick={()=>setShowWeekly(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:'#9A9188'}}>×</button></div>
        <div style={{marginBottom:12}}><label style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9A9188',display:'block',marginBottom:4}}>Week of</label><input className="input" type="date" value={form.week_of||''} onChange={e=>setForm({...form,week_of:e.target.value})} style={{width:160}}/></div>
        {[{label:'AC Posts',tk:'ac_posts_target',ak:'ac_posts_actual'},{label:'DCA Posts',tk:'dca_posts_target',ak:'dca_posts_actual'},{label:'TikTok Posts',tk:'tiktok_posts_target',ak:'tiktok_posts_actual'},{label:'Strategy Calls',tk:'strategy_calls_target',ak:'strategy_calls_actual'},{label:'Webinars',tk:'webinars_target',ak:'webinars_actual'}].map(({label,tk,ak})=>(
          <div key={tk} style={{display:'grid',gridTemplateColumns:'1fr 80px 80px',gap:8,alignItems:'center',marginBottom:8}}>
            <span style={{fontSize:13,color:'#444140'}}>{label}</span>
            <input className="input" type="number" value={form[tk]||0} onChange={e=>setForm({...form,[tk]:Number(e.target.value)})} style={{textAlign:'center'}}/>
            <input className="input" type="number" value={form[ak]||0} onChange={e=>setForm({...form,[ak]:Number(e.target.value)})} style={{textAlign:'center'}}/>
          </div>
        ))}
        <div style={{display:'flex',gap:10,marginTop:20,justifyContent:'flex-end'}}>
          <button className="btn btn-ghost" onClick={()=>setShowWeekly(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving...':'Save Week'}</button>
        </div>
      </div></div>}
    </div>
  );
}