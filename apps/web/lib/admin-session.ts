import {cookies} from 'next/headers';
export const COOKIE_NAME='guarara_admin_session';
export function apiBase(){return process.env.API_URL||'http://127.0.0.1:3007';}
export async function getAdminUser():Promise<{id:string;nome:string;papel:string}|null>{
 const token=(await cookies()).get(COOKIE_NAME)?.value;
 if(!token)return null;
 try{
  const response=await fetch(apiBase()+'/api/admin/me',{headers:{Authorization:'Bearer '+token},cache:'no-store'});
  return response.ok?await response.json():null;
 }catch{return null;}
}
