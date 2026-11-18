import {NextResponse} from 'next/server';
export const dynamic='force-dynamic';
export async function GET(){
 try{const base=process.env.API_URL||'http://127.0.0.1:3007';
 const response=await fetch(base+'/api/comunicados',{cache:'no-store'});
 if(!response.ok)return NextResponse.json({error:'Serviço indisponível'},{status:502});
 return NextResponse.json(await response.json(),{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Serviço indisponível'},{status:502});}
}
