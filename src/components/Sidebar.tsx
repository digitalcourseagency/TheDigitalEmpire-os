"use client";
import{useState}from"react";
import Link from"next/link";
import{usePathname}from"next/navigation";
import{LayoutDashboard,FileText,Lightbulb,BarChart2,Hash,Camera,TrendingUp,BookOpen,CalendarDays,Target,Rocket,Sparkles,Grid,BookMarked,Handshake}from"lucide-react";
const brands=[{code:"AC",label:"Ash Couture",color:"#2C2C2A"},{code:"DCA",label:"Digital Course Agency",color:"#C8432A"},{code:"DES",label:"Digital Expert School",color:"#185FA5"},{code:"OOG",label:"Opulent Outreach Group",color:"#B89A5A"},{code:"LLL",label:"Lux Leisure Lifestyle",color:"#888480"}];
const nav=[
  {href:"/dashboard",icon:LayoutDashboard,label:"Dashboard"},
  {href:"/posts",icon:FileText,label:"Posts"},
  {href:"/calendar",icon:CalendarDays,label:"Calendar"},
  {href:"/ideas",icon:Lightbulb,label:"Ideas"},
  {href:"/launches",icon:Rocket,label:"Launches"},
  {href:"/goals",icon:Target,label:"Goals"},
  {href:"/analytics",icon:BarChart2,label:"Analytics"},
  {href:"/keywords",icon:Hash,label:"Keywords"},
  {href:"/shoots",icon:Camera,label:"Shoots"},
  {href:"/trending",icon:TrendingUp,label:"Trending"},
  {href:"/series",icon:BookOpen,label:"Series"},
  {href:"/inspo",icon:Sparkles,label:"Inspo Vault"},
  {href:"/grid",icon:Grid,label:"Grid Preview"},
  {href:"/substack",icon:BookMarked,label:"Substack"},
  {href:"/brand-deals",icon:Handshake,label:"Brand Deals"},
];
export default function Sidebar(){
  const path=usePathname();
  const[brand,setBrand]=useState("AC");
  const active=brands.find(b=>b.code===brand)||brands[0];
  return(
    <aside style={{width:220,minHeight:"100vh",background:"#FDFCFA",borderRight:"0.5px solid #EDE8E1",display:"flex",flexDirection:"column",flexShrink:0}}>
      <div style={{padding:"20px 16px 12px"}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:15,color:"#1A1917",marginBottom:2}}>Ash Couture</div>
        <div style={{fontSize:10,color:"#9A9188",letterSpacing:"0.05em",textTransform:"uppercase"}}>Content OS</div>
      </div>
      <div style={{padding:"8px 12px 12px"}}>
        <select value={brand} onChange={e=>setBrand(e.target.value)} style={{width:"100%",fontSize:11,padding:"6px 8px",borderRadius:8,border:"0.5px solid #EDE8E1",background:"#F5F1EC",color:active.color,fontWeight:500,cursor:"pointer",appearance:"none"}}>
          {brands.map(b=><option key={b.code} value={b.code} style={{color:b.color}}>{b.code} · {b.label}</option>)}
        </select>
      </div>
      <nav style={{flex:1,padding:"4px 8px",overflowY:"auto"}}>
        {nav.map(({href,icon:Icon,label})=>{
          const isActive=path===href||(href!=="/dashboard"&&path.startsWith(href));
          return(
            <Link key={href} href={href} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,marginBottom:1,background:isActive?"#EDE8E1":"transparent",color:isActive?"#1A1917":"#7D7470",fontSize:12,fontWeight:isActive?500:400,textDecoration:"none",transition:"all 0.1s"}}>
              <Icon size={15} style={{flexShrink:0,color:isActive?active.color:"#B8B0A5"}}/>
              {label}
            </Link>
          );
        })}
      </nav>
      <div style={{padding:"12px 16px",borderTop:"0.5px solid #EDE8E1"}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:active.color,display:"inline-block",marginRight:6}}/>
        <span style={{fontSize:10,color:"#9A9188"}}>{active.label}</span>
      </div>
    </aside>
  );
}
