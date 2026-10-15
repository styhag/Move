"use client";
import {useActionState} from "react";
import {submitMaterial,type ActionResult} from "./actions";
const initial:ActionResult={ok:false,message:""};
const field={display:"block",padding:12,border:"1px solid #ddd",borderRadius:10,marginTop:8,width:"100%"} as const;
export function MaterialForm({jobs,materials}:{jobs:{id:string,title:string}[],materials:{id:string,name:string,unit:string}[]}){
 const[state,action,pending]=useActionState(submitMaterial,initial);
 if(!jobs.length)return <p>Du behöver ett tilldelat uppdrag för att registrera material.</p>;
 if(!materials.length)return <p>Materialkatalogen är tom. Administratören behöver lägga till material.</p>;
 return <form action={action} style={{display:"grid",gap:12,maxWidth:440}}>
 <label>Uppdrag<select name="job_id" style={field} required>{jobs.map(j=><option key={j.id} value={j.id}>{j.title}</option>)}</select></label>
 <label>Material<select name="material_id" style={field} required>{materials.map(m=><option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}</select></label>
 <label>Antal<input name="quantity" type="number" min="0.01" max="10000" step="any" defaultValue="1" required style={field}/></label>
 <button className="btn blue" disabled={pending}>{pending?"Sparar…":"Registrera material"}</button>
 {state.message&&<p role="status">{state.message}</p>}
 </form>;
}
