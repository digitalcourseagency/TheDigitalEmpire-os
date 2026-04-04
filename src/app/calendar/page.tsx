"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, ChevronRight, Grid3X3 } from "lucide-react";
import { useRouter } from "next/navigation";

const BRANDS: Record<string,{color:string,code:string}> = {
  "20e8bb0e-29fd-492e-ad91-2beb239e4b0f": { color:"#2C2C2A", code:"AC" },
  "caa9919a-5fe0-4e67-844a-fd75f3170516": { color:"#C8432A", code:"DCA" },
  "ba48df91-58dc-4471-93f4-1c2a9ba69d35": { color:"#185FA5", code:"DES" },
  "f4aec731-0842-493e-b17f-56e5265318ac": { color:"#B89A5A", code:"OOG" },
  "a80ef03f-697b-47da-9c73-81b9b4d2717e": { color:"#888480", code:"LLL" },
};
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function CalendarPage() {
  const router = useRouter();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [posts, setPosts] = useState<any[]>([]);
  const [shoots, setShoots] = useState<any[]>([]);
  const [launches, setLaunches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPost, setHoveredPost] = useState<any>(null);
  const [hoverPos, setHoverPos] = useState({ x:0, y:0 });

  useEffect(() => { loadAll(); }, [year, month]);

  async function loadAll() {
    const start = `${year}-${String(month+1).padStart(2,"0")}-01`;
    const lastDay = new Date(year, month+1, 0).getDate();
    const end = `${year}-${String(month+1).padStart(2,"0")}-${String(lastDay).padStart(2,"0")}`;
    const [{ data: p }, { data: s }, { data: l }] = await Promise.all([
      supabase.from("posts").select("id,title,scheduled_date,brand_id,status,type,thumbnail_url,is_carousel,hook").gte("scheduled_date", start).lte("scheduled_date", end),
      supabase.from("shoots").select("id,name,shoot_date,status").gte("shoot_date", start).lte("shoot_date", end),
      supabase.from("launches").select("id,name,launch_date,end_date,brand_id,status").gte("launch_date", start).lte("launch_date", end),
    ]);
    setPosts(p || []);
    setShoots(s || []);
    setLaunches(l || []);
    setLoading(false);
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y-1); setMonth(11); }
    else setMonth(m => m-1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y+1); setMonth(0); }
    else setMonth(m => m+1);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells: (number|null)[] = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];
  while (cells.length % 7 !== 0) cells.push(null);

  function dateStr(day: number) {
    return `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  }
  function postsForDay(day: number) {
    const d = dateStr(day);
    return posts.filter(p => p.scheduled_date === d);
  }
  function shootsForDay(day: number) {
    const d = dateStr(day);
    return shoots.filter(s => s.shoot_date === d);
  }
  function launchesForDay(day: number) {
    const d = dateStr(day);
    return launches.filter(l => l.launch_date <= d && (!l.end_date || l.end_date >= d));
  }

  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div style={{ maxWidth:1100 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:34, fontWeight:400 }}>Calendar</h1>
          <div style={{ fontSize:13, color:"#9A9188", marginTop:2 }}>Posts, shoots, and launches at a glance</div>
        </div>
        <button className="btn btn-ghost" onClick={() => router.push("/grid")} style={{ display:"flex", alignItems:"center", gap:6 }}>
          <Grid3X3 size={14}/> Grid Preview
        </button>
      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <button onClick={prevMonth} style={{ background:"none", border:"none", cursor:"pointer", padding:"6px 10px", borderRadius:8, color:"#9A9188" }}><ChevronLeft size={18}/></button>
        <div style={{ fontFamily:"Georgia,serif", fontSize:22 }}>{MONTHS[month]} {year}</div>
        <button onClick={nextMonth} style={{ background:"none", border:"none", cursor:"pointer", padding:"6px 10px", borderRadius:8, color:"#9A9188" }}><ChevronRight size={18}/></button>
      </div>

      <div style={{ display:"flex", gap:16, marginBottom:12 }}>
        {[["#B89A5A","Post"],["#7B5EA7","Shoot"],["#2C9D6A","Launch"]].map(([c,l]) => (
          <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#9A9188" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:c }}/>
            {l}
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", border:"0.5px solid #EDE8E1", borderRadius:12, overflow:"hidden" }}>
        {DAYS.map(d => (
          <div key={d} style={{ padding:"8px 10px", fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", color:"#9A9188", borderBottom:"0.5px solid #EDE8E1", textAlign:"center", background:"#FDFCFA" }}>{d}</div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} style={{ minHeight:100, background:"#FDFCFA", borderRight:idx%7!==6?"0.5px solid #EDE8E1":"none", borderBottom:"0.5px solid #EDE8E1" }}/>;
          const dayPosts = postsForDay(day);
          const dayShoots = shootsForDay(day);
          const dayLaunches = launchesForDay(day);
          return (
            <div key={`d-${day}-${idx}`} style={{ minHeight:100, padding:"6px 6px 4px", borderRight:idx%7!==6?"0.5px solid #EDE8E1":"none", borderBottom:"0.5px solid #EDE8E1", background:isToday(day)?"#FFF8F0":"var(--color-background-primary)" }}>
              <div style={{ fontSize:12, fontWeight:isToday(day)?700:400, color:isToday(day)?"#B89A5A":"#1A1917", marginBottom:4, width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"50%", background:isToday(day)?"#B89A5A22":"transparent" }}>{day}</div>

              {dayLaunches.map(l => (
                <div key={l.id} style={{ fontSize:9, padding:"1px 5px", borderRadius:4, background:"#2C9D6A22", color:"#2C9D6A", marginBottom:2, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>🚀 {l.name}</div>
              ))}

              {dayShoots.map(s => (
                <div key={s.id} style={{ fontSize:9, padding:"1px 5px", borderRadius:4, background:"#7B5EA722", color:"#7B5EA7", marginBottom:2, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>📷 {s.name}</div>
              ))}

              {dayPosts.map(post => {
                const brand = BRANDS[post.brand_id];
                return (
                  <div
                    key={post.id}
                    onClick={() => router.push(`/posts?highlight=${post.id}`)}
                    onMouseEnter={e => {
                      setHoveredPost(post);
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setHoverPos({ x: rect.left, y: rect.top });
                    }}
                    onMouseLeave={() => setHoveredPost(null)}
                    style={{ fontSize:9, padding:"2px 5px", borderRadius:4, background:(brand?.color||"#B89A5A")+"22", color:brand?.color||"#B89A5A", marginBottom:2, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", cursor:"pointer", borderLeft:`2px solid ${brand?.color||"#B89A5A"}` }}
                  >
                    {post.title}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {hoveredPost && (
        <div style={{ position:"fixed", top:Math.max(hoverPos.y - 130, 10), left:Math.min"hoverPos.x + 10, window.innerWidth - 260), width:240, background:"var(--color-background-primary)", border:"0.5px solid #EDE8E1", borderRadius:10, padding:"10px 12px", boxShadow:"0 8px 24px rgba(0,0,0,0.12)", zIndex:999, pointerEvents:"none" }}>
          <div style={{ fontSize:12, fontWeight:500, color:"#1A1917", marginBottom:4 }}>{hoveredPost.title}</div>
          {hoveredPost.hook && <div style={{ fontSize:11, color:"#7D7470", fontStyle:"italic", marginBottom:6 }}>"{hoveredPost.hook.slice(0,80)}{hoveredPost.hook.length>80?"...":""}"</div>}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <span style={{ fontSize:10, padding:"1px 6px", borderRadius:100, background:"#EDE8E1", color:"#7D7470" }}>{hoveredPost.type}</span>
            <span style={{ fontSize:10, padding:"1px 6px", borderRadius:100, background:"#EDE8E1", color:"#7D7470" }}>{hoveredPost.status}</span>
            {hoveredPost.is_carousel && <span style={{ fontSize:10, padding:"1px 6px", borderRadius:100, background:"#185FA522", color:"#185FA5" }}>Carousel</span>}
          </div>
          <div style={{ fontSize:10, color:"#B89A5A", marginTop:6 }}>Click to view post →</div>
        </div>
      )}
    </div>
  );
}
