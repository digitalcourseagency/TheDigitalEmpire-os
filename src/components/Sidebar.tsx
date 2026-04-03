"use client";
import Link from"next/link";
import{usePathname}from"next/navigation";
import{LayoutDashboard,FileText,Lightbulb,BarChart2,Target,Zap,Rocket,Camera,BookOpen,Flame,TrendingUp,Users,Calendar}from"lucide-react";
const nav=[
  {href:'/dashboard',label:'Dashboard',icon:LayoutDashboard},
  {href:'/calendar',label:'Calendar',icon:Calendar},
  {href:'/posts',label:'Posts',icon:FileText},
  {href:'/ideas',label:'Ideas',icon:Lightbulb},
  {href:'/analytics',label:'Analytics',icon:BarChart2},
  {href:'/goals',label:'Goals',icon:Target},
  {href:'/launches',label:'Launches',icon:Rocket},
  {href:'/keywords',label:'Keywords',icon:Zap},
  {href:'/shoots',label:'Shoots',icon:Camera},
  {href:'/inspo',label:'Inspo',icon:Flame},
  {href:'/trending',label:'Trending',icon:TrendingUp},
  {href:'/series',label:'Series',icon:BookOpen},
  {href:'/calls',label:'Sales Calls',icon:Users},
];
export default function Sidebar(){
  const pathname=usePathname();
  return(
    <aside style={{width:220,minHeight:'100vh',background:'#FDFCFA',borderRight:'1px solid #EDE8E1',padding:'24px 12px',display:'flex',flexDirection:'column',gap:4,flexShrink:0}}>
      <div style={{padding:'4px 12px 20px'}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:22,letterSpacing:'0.04em',color:'#1A1917',lineHeight:1.1}}>Ash Couture</div>
        <div style={{fontSize:10,letterSpacing:'0.14em',textTransform:'uppercase',color:'#9A9188',marginTop:2}}>Content OS</div>
      </div>
      <nav style={{display:'flex',flexDirection:'column',gap:2}}>
        {nav.map(({href,label,icon:Icon})=>(
          <Link key={href} href={href} className={`sidebar-link ${pathname===href||pathname.startsWith(href+'/')?'active':''}`}>
            <Icon size={15} strokeWidth={1.5}/>{label}
          </Link>
        ))}
      </nav>
      <div style={{marginTop:'auto',padding:'16px 12px 4px'}}>
        <div style={{fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:'#B8B0A5',marginBottom:8}}>Brands</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {[{color:'#2C2C2A',label:'AC'},{color:'#C8432A',label:'DCA'},{color:'#185FA5',label:'DES'},{color:'#888480',label:'LLL'},{color:'#B89A5A',label:'OOG'},{color:'#534AB7',label:'TDI'}].map(b=>(
            <div key={b.label} style={{width:24,height:24,borderRadius:'50%',background:b.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,color:'white',fontWeight:600}}>{b.label}</div>
          ))}
        </div>
      </div>
    </aside>
  );
}