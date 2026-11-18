import {NextRequest,NextResponse} from 'next/server';
const allowed=new Set(['comissionados','efetivos','contratados']);
export async function GET(_req:NextRequest,{params}:{params:Promise<{categoria:string}>}){
 const {categoria}=await params;
 if(!allowed.has(categoria))return NextResponse.json({error:'Categoria inválida'},{status:404});
 try{
  const base=process.env.API_URL||'http://127.0.0.1:3007';
  const response=await fetch(base+'/api/folha-pagamento/'+categoria,{cache:'no-store'});
  if(!response.ok)return NextResponse.json({error:'Serviço indisponível'},{status:502});
  return NextResponse.json(await response.json(),{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Serviço indisponível'},{status:502});}
}
