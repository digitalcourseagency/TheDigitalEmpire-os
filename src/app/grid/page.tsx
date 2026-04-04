"use client";
import{useEffect,useState}from"react";
import{supabase}from"@/lib/supabase";
import{useRouter}from"next/navigation";
import{ArrowLeft,RefreshCw,Instagram}from"lucide-react";
const B=[{id:"20e8bb0e-29fd-492e-ad91-2beb239e4b0f",code:"AC",color:"#2C2C2A",handle:"iamashcouture"},{id:"caa9919a-5fe0-4e67-844a-fd75f3170516",code:"DCA",color:"#C8432A",handle:"digitalcourseagency"},{id:"ba48df91-58dc-4471-93f4-1c2a9ba69d35",code:"DES",color:"#185FA5",handle:"digitalexpertschool"},{id:"f4aec731-0842-493e-b17f-56e5265318ac",code:"OOG",color:"#B89A5A",handle:"opulentoutreachgroup"},{id:"a80ef03f-697b-47da-9c73-81b9b4d2717e",code:"LLL",color:"#888480",handle:"luxleisurelifestyle"}];
const PH=["#EDE8E1","#E8E3DC","#F0EBE4","#E5E0D9","#EAE5DE"];
export default function GridPreviewPage(){
  const router=useRouter();
  const[posts,setPosts]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[brand,setBrand]=useState(B[0]);
  const[rows,setRows]=useState(3);
  const[dragging,setDragging]=useState<number|null>(null);
  const[dragOver,setDragOver]=useState<number|null>(null);
  const[saving,setSaving]=useState(false);
  useEffect(()=>{load();},[brand]);
  async function load(){
    setLoading(true);
    const{data}=await supabase.from("posts").select("id,title,thumbnail_url,media_type,status,type,scheduled_date,grid_position,is_carousel,carousel_slide_count").eq("brand_id",brand.id).order("grid_position",{ascending:true,nullsFirst:false}).order("scheduled_date",{ascending:true,nullsFirst:false}).order("created_at",{ascending:false});
    setPosts(data||[]);setLoading(false);
  }
  const gp=posts.slice(0,rows*3);
  function onDragEnd(){
    if(dragging===null||dragOver===null||dragging===dragOver){setDragging(null);setDragOver(null);return;}
    const n=[...posts];const[it]=n.splice(dragging,1);n.splice(dragOver,0,it);
    setPosts(n);setDragging(null);setDragOver(null);
  }
  async function saveOrder(){setSaving(true);await Promise.all(posts.map((p,i)=>supabase.from("posts").update({grid_position:i}).eq("id",p.id)));setSaving(false);}
  return(
    <div style={{maxWidth:1100}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>router.push("/calendar")} style={{background:"none",border:"none",cursor:"pointer",color:"#9A9188",display:"flex",alignItems:"center",gap:4,fontSize:13}}><ArrowLeft size={14}/>Calendar</button>
          <div style={{width:1,height:20,background:"#EDE8E1"}}/>
          <div><h1 style={{fontFamily:"Georgia,serif",fontSize:34,fontWeight:400}}>Grid Preview</h1><div style={{fontSize:13,color:"#9A9188",marginTop:2}}>Drag to reorder your IG feed before posting</div></div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={load} style={{background:"none",border:"none",cursor:"pointer",color:"#9A9188"}}><RefreshCw size={14}/></button>
          <button className="btn btn-ghost" onClick={saveOrder} disabled={saving}>{saving?"Saving...":"Save Order"}</button>
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",gap:6}}>{B.map(b=><button key={b.id} onClick={()=>setBrand(b)} style={{fontSize:11,padding:"5px 12px",borderRadius:100,border:"1px solid",borderColor:brand.id===b.id?b.color:"#EDE8E1",background:brand.id===b.id?b.color:"transparent",color:brand.id===b.id?"#fff":"#9A9188",cursor:"pointer"}}>{b.code}</button>)}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
          <span style={{fontSize:12,color:"#9A9188"}}>Rows:</span>
          {[3,4,5,6].map(r=><button key={r} onClick={()=>setRows(r)} style={{width:28,height:28,borderRadius:8,border:"0.5px solid",borderColor:rows===r?"#B89A5A":"#EDE8E1",background:rows===r?"#B89A5A22":"transparent",color:rows===r?"#B89A5A":"#9A9188",cursor:"pointer",fontSize:12}}>{r}</button>)}
        </div>
      </div>
      <div style={{display:"flex",gap:20}}>
        <div style={{flex:"0 0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
            <Instagram size={13} color={brand.color}/>
            <span style={{fontSize:11,color:brand.color,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>@{brand.handle}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,110px)",gap:2,background:"#EDE8E1",padding:2,borderRadius:4}}>
            {Array.from({length:rows*3}).map((_,idx)=>{
              const post=gp[idx];
              return(
                <div key={idx} draggable={!!post} onDragStart={()=>post&&setDragging(idx)} onDragEnter={()=>setDragOver(idx)} onDragOver={e=>e.preventDefault()} onDragEnd={onDragEnd} onClick={()=>post&&router.push("/posts?highlight="+post.id)} style={{width:110,height:110,position:"relative",cursor:post?"grab":"default",opacity:dragging===idx?0.4:1,outline:dragOver===idx?"2px solid "+brand.color:"none",background:PH[idx%5],overflow:"hidden"}}>
                  {post?.thumbnail_url?(post.media_type==="video"?<video src={post.thumbnail_url} style={{width:"100%",height:"100%",objectFit:"cover"}} muted/>:<img src={post.thumbnail_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>):post?(<div style={{width:"100%",height:"100%",background:PH[idx%5],display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:9,color:"#B8B0A5",textAlign:"center",padding:"0 8px"}}>{post.title?.slice(0,30)}</div></div>):null}
                  {post&&<div style={{position:"absolute",bottom:0,left:0,right:0,padding:"20px 4px 3px",background:"linear-gradient(transparent,rgba(0,0,0,0.5))",display:"flex",justifyContent:"space-between"}}><span style={{fontSize:8,color:"rgba(255,255,255,0.85)"}}>{post.type}</span>{post.is_carousel&&<span style={{fontSize:7,color:"rgba(255,255,255,0.8)"}}>⊞</span>}</div>}
                  <div style={{position:"absolute",top:3,left:3,fontSize:8,background:"rgba(0,0,0,0.4)",color:"#fff",borderRadius:3,padding:"1px 4px"}}>{idx+1}</div>
                </div>
              );
            })}
          </div>
          <div style={{fontSize:11,color:"#B8B0A5",textAlign:"center",marginTop:8}}>Drag to reorder · Click to view post</div>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:16,marginBottom:12}}>Up Next</div>
          {loading&&<div className="skeleton" style={{height:200}}/>}
          {!loading&&gp.length===0&&<div style={{fontSize:13,color:"#9A9188"}}>No posts for this brand yet.</div>}
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {gp.map((post,idx)=>(
              <div key={post.id} onClick={()=>router.push("/posts?highlight="+post.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,background:"var(--color-background-primary)",border:"0.5px solid #EDE8E1",cursor:"pointer"}}>
                <div style={{fontSize:11,color:"#B8B0A5",width:16,textAlign:"center"}}>{idx+1}</div>
                <div style={{width:36,height:36,borderRadius:4,overflow:"hidden",background:"#EDE8E1",flexShrink:0}}>
                  {post.thumbnail_url?(post.media_type==="video"?<video src={post.thumbnail_url} style={{width:"100%",height:"100%",objectFit:"cover"}} muted/>:<img src={post.thumbnail_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>):<div style={{width:"100%",height:"100%",background:PH[idx%5]}}/>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:500,color:"#1A1917",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{post.title}</div>
                  <div style={{fontSize:10,color:"#9A9188"}}>{post.type} · {post.status}{post.scheduled_date?" · "+new Date(post.scheduled_date).toLocaleDateString("en-US",{month:"short",day:"numeric"}):""}</div>
                </div>
                {post.is_carousel&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:100,background:"#185FA522",color:"#185FA5"}}>{post.carousel_slide_count}s</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
