"use client";
import {useActionState} from "react";
import {setAvailability,type ActionResult} from "./actions";
const initial:ActionResult={ok:false,message:""};
export function AvailabilityForm(){const[state,action,pending]=useActionState(setAvailability,initial);
return <form action={action} style={{display:"grid",gap:12,maxWidth:400}}>
<label>Datum<input name="date" type="date" required defaultValue={new Date().toISOString().slice(0,10)} style={{display:"block",padding:12,border:"1px solid #ddd",borderRadius:10,marginTop:8,width:"100%"}}/></label>
<label>Kan du arbeta?<select name="status" style={{display:"block",padding:12,border:"1px solid #ddd",borderRadius:10,marginTop:8,width:"100%"}}><option value="available">Ja, tillgänglig</option><option value="unavailable">Nej, inte tillgänglig</option></select></label>
<button className="btn blue" disabled={pending}>{pending?"Sparar…":"Spara tillgänglighet"}</button>
{state.message&&<p role="status">{state.message}</p>}</form>}
