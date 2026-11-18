import {NextResponse} from 'next/server';
import {getAdminUser} from '../../../lib/admin-session';
import {saveComunicadoCover} from '../../../lib/comunicado-covers';
export const runtime='nodejs';
export const dynamic='force-dynamic';
function mime(b:Buffer){
 if(b.length>=8&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'image/png';
 if(b.length>=3&&b.subarray(0,3).equals(Buffer.from([255,216,255])))return 'image/jpeg';
 if(b.length>=12&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP')return 'image/webp';
 return null;
}
export async function POST(req:Request){
 const host=req.headers.get('host'),origin=req.headers.get('origin');
 let allowed=false;
 try{const u=origin?new URL(origin):null;allowed=!!(host&&u&&u.host.toLowerCase()===host.toLowerCase()&&['http:','https:'].includes(u.protocol));}catch{}
 if(!allowed)return NextResponse.json({error:'Origem não autorizada'},{status:403});
 const user=await getAdminUser();
 if(!user)return NextResponse.json({error:'Não autenticado'},{status:401});
 if(!['ADMINISTRADOR','GESTOR','EDITOR'].includes(user.papel))return NextResponse.json({error:'Sem permissão'},{status:403});
 if(Number(req.headers.get('content-length')||0)>4*1024*1024+65536)return NextResponse.json({error:'Imagem maior que 4 MB'},{status:413});
 try{
  const data=await req.formData(),image=data.get('arquivo');
  if(!(image instanceof File)||image.size<12||image.size>4*1024*1024)return NextResponse.json({error:'Imagem deve ter até 4 MB'},{status:400});
  const buffer=Buffer.from(await image.arrayBuffer()),type=mime(buffer);
  if(!type)return NextResponse.json({error:'Somente PNG, JPG e WebP são aceitos'},{status:400});
  const file=await saveComunicadoCover(buffer,type);
  return NextResponse.json({arquivo:file},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('[capa comunicado]',e);return NextResponse.json({error:'Falha ao salvar a capa'},{status:500});}
}
