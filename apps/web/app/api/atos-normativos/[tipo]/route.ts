import {NextRequest,NextResponse} from 'next/server';
const types=new Set(['leis','decretos','portarias']);
export async function GET(_req:NextRequest,{params}:{params:Promise<{tipo:string}>}){
 const {tipo}=await params;
 if(!types.has(tipo))return NextResponse.json({error:'Tipo inválido'},{status:404});
 try{const api=process.env.API_URL||'http://127.0.0.1:3007';
 const response=await fetch(api+'/api/atos-normativos/'+tipo,{cache:'no-store'});
 if(!response.ok)return NextResponse.json({error:'Serviço indisponível'},{status:502});
 return NextResponse.json(await response.json(),{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Serviço indisponível'},{status:502});}
}
