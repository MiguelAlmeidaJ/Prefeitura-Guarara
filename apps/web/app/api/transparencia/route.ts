import {NextResponse} from 'next/server';
export async function GET(){
 try{
  const api=process.env.API_URL||'http://127.0.0.1:3007';
  const response=await fetch(api+'/api/transparencia',{cache:'no-store'});
  if(!response.ok)return NextResponse.json({error:'Serviço indisponível'},{status:502});
  return NextResponse.json(await response.json(),{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Serviço indisponível'},{status:502});}
}
