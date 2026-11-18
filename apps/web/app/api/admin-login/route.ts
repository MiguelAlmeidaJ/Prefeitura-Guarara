import {NextResponse} from 'next/server';
import {COOKIE_NAME,apiBase} from '../../../lib/admin-session';
export async function POST(req:Request){
 try{
  const body=await req.json() as {email?:unknown;senha?:unknown;remember?:unknown};
  if(typeof body?.email!=='string'||typeof body?.senha!=='string'||body.email.length>254||body.senha.length>256)return NextResponse.json({error:'Dados inválidos'},{status:400});
  const response=await fetch(apiBase()+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:body.email,senha:body.senha}),cache:'no-store'});
  if(!response.ok)return NextResponse.json({error:'Credenciais inválidas'},{status:response.status===401?401:502});
  const result=await response.json() as {accessToken:string};
  if(typeof result.accessToken!=='string'||!result.accessToken)return NextResponse.json({error:'Sessão inválida'},{status:502});
  const out=NextResponse.json({ok:true});
  out.cookies.set(COOKIE_NAME,result.accessToken,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production'&&process.env.COOKIE_SECURE!=='false',path:'/',...(body.remember===true?{maxAge:60*60*8}:{})});
  out.headers.set('Cache-Control','no-store');
  return out;
 }catch{return NextResponse.json({error:'API indisponível'},{status:502});}
}
