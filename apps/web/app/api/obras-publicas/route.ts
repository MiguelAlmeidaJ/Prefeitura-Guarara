import {NextResponse} from 'next/server';
const api=process.env.API_URL||'http://127.0.0.1:3007';
export async function GET(){
 try{
  const response=await fetch(api+'/api/obras-publicas',{cache:'no-store'});
  if(!response.ok)return NextResponse.json({error:'Serviço indisponível'},{status:502});
  return NextResponse.json(await response.json(),{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Serviço indisponível'},{status:502});}
}
