"use client";
import {useActionState} from "react";
import {submitTimeEntry,type ActionResult} from "./actions";
const initial:ActionResult={ok:false,message:""};
export function TimeEntryForm({jobs}:{jobs:{id:string,title:string}[]}){
 const [state,action,pending]=useActionState(submitTimeEntry,initial);
 if(!jobs.length)return <p>Du behöver ett tilldelat uppdrag för att kunna rapportera tid.</p>;
 return <form action={action} style={{display:"grid",gap:12,maxWidth:440}}>
 <label>Uppdrag<select name="job_id" required style={field}>{jobs.map(j=><option key={j.id} value={j.id}>{j.title}</option>)}</select></label>
 <label>Datum<input type="date" name="day" required style={field}/></label>
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
 <label>Start<input type="time" name="start" required style={field}/></label>
 <label>Slut<input type="time" name="end" required style={field}/></label>
 </div>
 <label>Obetald rast (minuter)<input type="number" name="break_minutes" min="0" max="600" step="1" defaultValue="30" required style={field}/></label>
 <label>Kommentar (valfritt)<textarea name="comment" maxLength={500} rows={2} style={field}/></label>
 <button className="btn blue" disabled={pending}>{pending?"Skickar…":"Skicka tidrapport"}</button>
 {state.message&&<p role="status">{state.message}</p>}
 </form>;
}
const field={display:"block",padding:12,border:"1px solid #ddd",borderRadius:10,marginTop:8,width:"100%"} as const;
