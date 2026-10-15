"use server";
import {revalidatePath} from "next/cache";
import {moveSession} from "@/lib/move/server";
export type ActionResult={ok:boolean,message:string};
export async function setAvailability(_prev:ActionResult,form:FormData):Promise<ActionResult>{
 const {supabase,user}=await moveSession();
 const date=String(form.get("date")||"");
 const status=String(form.get("status")||"");
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!["available","unavailable"].includes(status))return {ok:false,message:"Kontrollera datum och status."};
 const {data:members,error:memberError}=await supabase.schema("move").from("memberships").select("id,organization_id").eq("user_id",user.id).limit(2);
 if(memberError)return {ok:false,message:"Move-schemat är ännu inte tillgängligt via API. Kontakta administratören."};
 if(!members?.length)return {ok:false,message:"Ditt konto är inte anslutet till ett Move-företag."};
 if(members.length!==1)return {ok:false,message:"Välj organisation innan du registrerar tillgänglighet."};
 const member=members[0];
 const {error}=await supabase.schema("move").from("employee_availability").upsert({organization_id:member.organization_id,employee_id:member.id,day:date,status},{onConflict:"employee_id,day"});
 if(error)return {ok:false,message:"Kunde inte spara tillgänglighet. Försök igen."};
 revalidatePath("/app");return {ok:true,message:"Din tillgänglighet har sparats."};
}


export async function submitTimeEntry(_prev:ActionResult,form:FormData):Promise<ActionResult>{
 const {supabase,user}=await moveSession();
 const jobId=String(form.get("job_id")||"");
 const day=String(form.get("day")||"");
 const start=String(form.get("start")||"");
 const end=String(form.get("end")||"");
 const breakMinutes=Number(form.get("break_minutes")||0);
 const comment=String(form.get("comment")||"").trim().slice(0,500);
 if(!/^[0-9a-f-]{36}$/i.test(jobId)||!/^\d{4}-\d{2}-\d{2}$/.test(day)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(start)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(end)||!Number.isInteger(breakMinutes)||breakMinutes<0||breakMinutes>600)return {ok:false,message:"Kontrollera uppdrag, tider och rast."};
 const [sh,sm]=start.split(":").map(Number),[eh,em]=end.split(":").map(Number);
 const minutes=(eh*60+em)-(sh*60+sm);
 if(minutes<=0||minutes>16*60||breakMinutes>=minutes)return {ok:false,message:"Sluttiden måste vara senare än starttiden och rasten kortare än passet. Nattpass registreras separat."};
 const {data:members,error:memberError}=await supabase.schema("move").from("memberships").select("id,organization_id").eq("user_id",user.id).limit(2);
 if(memberError||members?.length!==1)return {ok:false,message:"Ditt Move-medlemskap kunde inte verifieras."};
 const member=members[0];
 const {data:assignment,error:assignmentError}=await supabase.schema("move").from("job_assignments").select("id").eq("organization_id",member.organization_id).eq("employee_id",member.id).eq("job_id",jobId).maybeSingle();
 if(assignmentError||!assignment)return {ok:false,message:"Du är inte tilldelad det här uppdraget."};
 // Stockholm timezone offsets are determined for each date, including DST transitions.
 const offset=(date:string,time:string)=>{const utc=new Date(date+"T"+time+":00Z");const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Stockholm",timeZoneName:"shortOffset"}).formatToParts(utc);const zone=parts.find(p=>p.type==="timeZoneName")?.value||"GMT+1";const match=zone.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);const n=match?(Number(match[2])*60+Number(match[3]||0))*(match[1]==="+"?1:-1):60;return new Date(utc.getTime()-n*60000).toISOString()};
 const startsAt=offset(day,start),endsAt=offset(day,end);
 const {error}=await supabase.schema("move").from("time_entries").insert({organization_id:member.organization_id,employee_id:member.id,job_id:jobId,work_type:"job",starts_at:startsAt,ends_at:endsAt,unpaid_break_minutes:breakMinutes,comment,status:"submitted"});
 if(error)return {ok:false,message:"Tidrapporten kunde inte sparas. Kontrollera uppgifterna och försök igen."};
 revalidatePath("/app");return {ok:true,message:"Tidrapporten är inskickad för attest."};
}


export async function submitMaterial(_prev:ActionResult,form:FormData):Promise<ActionResult>{
 const {supabase,user}=await moveSession();
 const jobId=String(form.get("job_id")||""),materialId=String(form.get("material_id")||"");
 const quantity=Number(form.get("quantity"));
 if(!/^[0-9a-f-]{36}$/i.test(jobId)||!/^[0-9a-f-]{36}$/i.test(materialId)||!Number.isFinite(quantity)||quantity<=0||quantity>10000)return {ok:false,message:"Kontrollera uppdrag, material och antal."};
 const {data:members,error}=await supabase.schema("move").from("memberships").select("id,organization_id").eq("user_id",user.id).limit(2);
 if(error||members?.length!==1)return {ok:false,message:"Ditt Move-medlemskap kunde inte verifieras."};
 const member=members[0];
 const {error:saveError}=await supabase.schema("move").from("job_material_entries").insert({organization_id:member.organization_id,job_id:jobId,material_id:materialId,reported_by:member.id,quantity});
 if(saveError)return {ok:false,message:"Kunde inte registrera material. Kontrollera att du är tilldelad uppdraget."};
 revalidatePath("/app");return {ok:true,message:"Materialet har registrerats."};
}
export async function reviewTimeEntry(_prev:ActionResult,form:FormData):Promise<ActionResult>{
 const {supabase,user}=await moveSession();
 const entryId=String(form.get("entry_id")||""),status=String(form.get("decision")||"");
 if(!/^[0-9a-f-]{36}$/i.test(entryId)||!["approved","rejected"].includes(status))return {ok:false,message:"Ogiltig attestering."};
 const {data:members,error}=await supabase.schema("move").from("memberships").select("organization_id,role").eq("user_id",user.id).limit(2);
 if(error||members?.length!==1||!["owner","admin","manager"].includes(members[0].role))return {ok:false,message:"Du saknar behörighet att attestera."};
 const {data, error:saveError}=await supabase.schema("move").from("time_entries").update({status}).eq("id",entryId).eq("organization_id",members[0].organization_id).eq("status","submitted").select("id").maybeSingle();
 if(saveError||!data)return {ok:false,message:"Rapporten kunde inte attesteras eller har redan hanterats."};
 revalidatePath("/app");return {ok:true,message:status==="approved"?"Rapporten är godkänd.":"Rapporten är avvisad."};
}
