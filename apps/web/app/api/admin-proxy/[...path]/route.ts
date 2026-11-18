import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {COOKIE_NAME,apiBase} from '../../../../lib/admin-session';

async function proxy(req:Request,ctx:{params:Promise<{path:string[]}>}){
 const {path}=await ctx.params;
 if(!path.length||path[0]!=='admin'||path.some(segment=>!segment||segment==='..'))return NextResponse.json({error:'Rota inválida'},{status:404});
 const token=(await cookies()).get(COOKIE_NAME)?.value;
 if(!token)return NextResponse.json({error:'Não autenticado'},{status:401});
 try{
  const target=apiBase()+'/api/'+path.map(encodeURIComponent).join('/');
  const response=await fetch(target,{method:req.method,headers:{Authorization:'Bearer '+token,...(req.method==='GET'?{}:{'Content-Type':'application/json'})},body:['POST','PATCH','PUT'].includes(req.method)?await req.text():undefined,cache:'no-store'});
  return new NextResponse(response.status===204?null:await response.text(),{status:response.status,headers:{'Content-Type':response.headers.get('Content-Type')||'application/json','Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'API indisponível'},{status:502});}
}
export {proxy as GET,proxy as POST,proxy as PATCH,proxy as DELETE};
