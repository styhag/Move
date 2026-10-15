import {NextResponse,type NextRequest} from "next/server";
import {createServerClient} from "@supabase/ssr";
// Refresh session cookies before rendering protected pages.
// Does not grant access to any Move business data.
export async function middleware(request:NextRequest){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return NextResponse.next({request});
 let response=NextResponse.next({request});
 const client=createServerClient(url,key,{cookies:{
  getAll(){return request.cookies.getAll()},
  setAll(items){items.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});items.forEach(({name,value,options})=>response.cookies.set(name,value,options))}
 }});
 await client.auth.getUser();
 return response;
}
export const config={matcher:["/app/:path*"]};
