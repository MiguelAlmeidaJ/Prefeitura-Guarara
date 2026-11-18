import {NextResponse} from 'next/server';
import {getAdminUser} from '../../../../lib/admin-session';
import {readSiteIdentity,writeIdentity,type Kind} from '../../../../lib/site-identity';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const maxSize=2*1024*1024;
function detect(buffer:Buffer):string|null{
 if(buffer.length>=8&&buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'image/png';
 if(buffer.length>=3&&buffer.subarray(0,3).equals(Buffer.from([255,216,255])))return 'image/jpeg';
 if(buffer.length>=12&&buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP')return 'image/webp';
 if(buffer.length>=6&&buffer.subarray(0,4).equals(Buffer.from([0,0,1,0])))return 'image/x-icon';
 return null;
}
function sameOrigin(req:Request){
 const origin=req.headers.get('origin'),host=req.headers.get('host');
 try{const url=origin?new URL(origin):null;return Boolean(url&&host&&url.host.toLowerCase()===host.toLowerCase()&&(url.protocol==='http:'||url.protocol==='https:'));}catch{return false;}
}
export async function GET(){
 const user=await getAdminUser();
 if(!user)return NextResponse.json({error:'Não autenticado'},{status:401});
 return NextResponse.json(await readSiteIdentity(),{headers:{'Cache-Control':'no-store'}});
}
export async function POST(req:Request){
 if(!sameOrigin(req))return NextResponse.json({error:'Origem não autorizada'},{status:403});
 const user=await getAdminUser();
 if(!user)return NextResponse.json({error:'Não autenticado'},{status:401});
 if(!['ADMINISTRADOR','GESTOR'].includes(user.papel))return NextResponse.json({error:'Sem permissão'},{status:403});
 const length=Number(req.headers.get('content-length')||0);
 if(length>maxSize+65536)return NextResponse.json({error:'Arquivo muito grande (máximo 2 MB)'},{status:413});
 try{
  const form=await req.formData();
  const rawKind=form.get('tipo');
  const rawFile=form.get('arquivo');
  if(rawKind!=='logo'&&rawKind!=='favicon')return NextResponse.json({error:'Tipo inválido'},{status:400});
  if(!(rawFile instanceof File))return NextResponse.json({error:'Selecione uma imagem'},{status:400});
  if(rawFile.size<12||rawFile.size>maxSize)return NextResponse.json({error:'A imagem deve ter até 2 MB'},{status:413});
  const buffer=Buffer.from(await rawFile.arrayBuffer());
  const mime=detect(buffer);
  if(!mime||(rawKind==='logo'&&mime==='image/x-icon'))return NextResponse.json({error:'Formato inválido. Logo: PNG, JPG ou WebP. Favicon: PNG, JPG, WebP ou ICO'},{status:400});
  const next=await writeIdentity(rawKind as Kind,buffer,mime);
  return NextResponse.json(next,{headers:{'Cache-Control':'no-store'}});
 }catch(error){
  console.error('[identidade] falha ao salvar imagem',error);
  return NextResponse.json({error:'Não foi possível salvar a imagem. Verifique as permissões da pasta de armazenamento.'},{status:500});
 }
}
