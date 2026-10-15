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
