import {moveSession} from "@/lib/move/server";
import {AvailabilityForm} from "./availability-form";
import {TimeEntryForm} from "./time-entry-form";
import {MaterialForm} from "./material-form";
import {ReviewForm} from "./review-form";
export const dynamic="force-dynamic";
export default async function AppHome(){
 const {supabase,user}=await moveSession();
 const {data:members,error}=await supabase.schema("move").from("memberships").select("id,organization_id,full_name,role").eq("user_id",user.id).limit(2);
 const member=members?.length===1?members[0]:null;
 const {data:jobs}=member?await supabase.schema("move").from("jobs").select("id,title,scheduled_start,scheduled_end,origin_address,status").eq("organization_id",member.organization_id).order("scheduled_start",{ascending:true}).limit(10):{data:null};
 const {data:assignments}=member?await supabase.schema("move").from("job_assignments").select("job_id").eq("employee_id",member.id):{data:null};
 const assignedIds=new Set((assignments||[]).map(a=>a.job_id));
 const assignedJobs=(jobs||[]).filter(j=>assignedIds.has(j.id));
 const {data:materials}=member?await supabase.schema("move").from("materials").select("id,name,unit").eq("organization_id",member.organization_id).eq("active",true):{data:null};
 const isAdmin=!!member&&["owner","admin","manager"].includes(member.role);
 const {data:pending}=isAdmin?await supabase.schema("move").from("time_entries").select("id,starts_at,unpaid_break_minutes").eq("organization_id",member!.organization_id).eq("status","submitted").limit(30):{data:null};
 const {data:entries}=member?await supabase.schema("move").from("time_entries").select("id,starts_at,ends_at,status").eq("employee_id",member.id).order("starts_at",{ascending:false}).limit(5):{data:null};
 return <main className="shell" style={{maxWidth:880}}>
 <header className="top"><div className="logo">move<span>.</span></div><a className="pill" href="/">Visa design-demo</a></header>
 <p className="muted">PERSONALPORTAL · INLOGGAD</p><h1>Hej{member?", "+member.full_name.split(" ")[0]:""}.</h1><p style={{marginBottom:24}}>Inloggad som {user.email}</p>
 {error?<article className="card"><h2>Databasanslutning väntar</h2><p>Move-schemat måste först aktiveras för säkert API-bruk. Inga andra projekts uppgifter exponeras.</p></article>:
 !member?<article className="card"><h2>Väntar på inbjudan</h2><p>Ditt konto är inloggat men ännu inte kopplat till någon Move-organisation. En administratör behöver lägga till dig.</p></article>:
 <div className="grid">
 <article className="card wide"><h2>Mina uppdrag</h2>{jobs?.length?jobs.map(j=><div className="line" key={j.id}><div><strong>{j.title}</strong><p className="muted">{new Date(j.scheduled_start).toLocaleString("sv-SE",{dateStyle:"medium",timeStyle:"short",timeZone:"Europe/Stockholm"})} · {j.origin_address||"Adress ej angiven"}</p></div><span className="status">{j.status}</span></div>):<p>Inga tilldelade uppdrag.</p>}</article>
 <article className="card"><h2>Min tillgänglighet</h2><AvailabilityForm/></article>
 <article className="card wide"><h2>Rapportera tid</h2><TimeEntryForm jobs={assignedJobs.map(j=>({id:j.id,title:j.title}))}/></article>
 <article className="card wide"><h2>Rapportera material</h2><MaterialForm jobs={assignedJobs.map(j=>({id:j.id,title:j.title}))} materials={materials||[]}/></article>
 {isAdmin&&<article className="card wide"><h2>Attestera tidrapporter</h2>{pending?.length?pending.map(e=><div key={e.id} className="line"><div><strong>{new Date(e.starts_at).toLocaleString("sv-SE")}</strong><p className="muted">Rast: {e.unpaid_break_minutes} min</p></div><ReviewForm entryId={e.id}/></div>):<p>Inga rapporter väntar på attest.</p>}</article>}
 <article className="card wide"><h2>Mina senaste tidrapporter</h2>{entries?.length?entries.map(e=><div className="line" key={e.id}><span>{new Date(e.starts_at).toLocaleDateString("sv-SE")}</span><span className="status">{e.status}</span></div>):<p>Inga rapporter ännu.</p>}</article>
 </div>}
 </main>;
}
