"use client";
import {useActionState} from "react";
import {reviewTimeEntry,type ActionResult} from "./actions";
const initial:ActionResult={ok:false,message:""};
export function ReviewForm({entryId}:{entryId:string}){
 const[state,action,pending]=useActionState(reviewTimeEntry,initial);
 return <form action={action} style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
 <input type="hidden" name="entry_id" value={entryId}/>
 <button className="btn blue" name="decision" value="approved" disabled={pending}>Godkänn</button>
 <button className="btn" name="decision" value="rejected" disabled={pending}>Avvisa</button>
 {state.message&&<small role="status">{state.message}</small>}
 </form>;
}
