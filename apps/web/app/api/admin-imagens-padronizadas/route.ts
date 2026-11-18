import {NextResponse} from 'next/server';
import {getAdminUser} from '../../../lib/admin-session';
import {getStandardCover,saveStandardCover} from '../../../lib/standard-images';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const max=4*1024*1024;
function signature(b:Buffer){
 if(b.length>=8&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'image/png';
 if(b.length>=3&&b.subarray(0,3).equals(Buffer.from([255,216,255])))return 'image/jpeg';
 if(b.length>=12&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP')return 'image/webp';
 return null;
}
function originMatches(req:Request){
 const host=req.headers.get('host'),origin=req.headers.get('origin');
 try{const parsed=origin?new URL(origin):null;return Boolean(parsed&&host&&parsed.host.toLowerCase()===host.toLowerCase()&&(parsed.protocol==='http:'||parsed.protocol==='https:'));}catch{return false;}
}
export async function GET(){
 const user=await getAdminUser();
 if(!user)return NextResponse.json({error:'Não autenticado'},{status:401});
 return NextResponse.json({capaComunicados:await getStandardCover()},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(req:Request){
 if(!originMatches(req))return NextResponse.json({error:'Origem não autorizada'},{status:403});
 const user=await getAdminUser();
 if(!user)return NextResponse.json({error:'Não autenticado'},{status:401});
 if(user.papel!=='ADMINISTRADOR'&&user.papel!=='GESTOR')return NextResponse.json({error:'Permissão insuficiente'},{status:403});
 const length=Number(req.headers.get('content-length')||0);
 if(length>max+65536)return NextResponse.json({error:'Imagem maior que 4 MB'},{status:413});
 try{
  const form=await req.formData(),file=form.get('arquivo');
  if(!(file instanceof File)||file.size<12||file.size>max)return NextResponse.json({error:'Selecione uma imagem com até 4 MB'},{status:400});
  const bytes=Buffer.from(await file.arrayBuffer()),mime=signature(bytes);
  if(!mime)return NextResponse.json({error:'Use uma imagem PNG, JPG ou WebP'},{status:400});
  const cover=await saveStandardCover(bytes,mime);
  return NextResponse.json({capaComunicados:cover},{headers:{'Cache-Control':'no-store'}});
 }catch(error){console.error('[imagens padronizadas]',error);return NextResponse.json({error:'Falha no armazenamento da imagem'},{status:500});}
}
