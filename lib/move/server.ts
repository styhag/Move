import "server-only";
import {cookies} from "next/headers";
import {createServerClient} from "@supabase/ssr";
import {redirect} from "next/navigation";
export async function moveSession(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)redirect("/login");
 const jar=await cookies();
 const supabase=createServerClient(url,key,{cookies:{getAll(){return jar.getAll()},setAll(){/* refreshed in middleware */}}});
 const {data:{user},error}=await supabase.auth.getUser();
 if(error||!user)redirect("/login");
 return {supabase,user};
}
