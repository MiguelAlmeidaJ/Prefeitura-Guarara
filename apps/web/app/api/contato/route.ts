import {NextResponse} from 'next/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 const contentType=request.headers.get('content-type')||'';
 if(!contentType.includes('application/json'))return NextResponse.json({error:'Formato não aceito'},{status:415});
 if(Number(request.headers.get('content-length')||0)>12000)return NextResponse.json({error:'Mensagem muito longa'},{status:413});
 try{
  const body=await request.json();
  const api=process.env.API_URL||'http://127.0.0.1:3007';
  const response=await fetch(api+'/api/contato',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});
  if(!response.ok){
   const error=response.status===429?'Muitas mensagens enviadas. Tente novamente em alguns minutos.':response.status===400?'Confira os campos obrigatórios e tente novamente.':'Não foi possível registrar a mensagem. Tente novamente mais tarde.';
   return NextResponse.json({error},{status:response.status>=500?502:response.status});
  }
  return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Serviço indisponível. Tente novamente mais tarde.'},{status:502});}
}
