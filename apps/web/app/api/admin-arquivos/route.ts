import {NextResponse} from 'next/server';
import {getAdminUser} from '../../../lib/admin-session';
import {MAX_DOCUMENT_SIZE,saveDocument} from '../../../lib/document-storage';
export const runtime='nodejs';
export const dynamic='force-dynamic';
function validOrigin(req:Request){
 const origin=req.headers.get('origin'),host=req.headers.get('host');
 try{const url=origin?new URL(origin):null;return Boolean(url&&host&&url.host.toLowerCase()===host.toLowerCase()&&['https:','http:'].includes(url.protocol));}catch{return false;}
}
export async function POST(req:Request){
 if(!validOrigin(req))return NextResponse.json({error:'Origem não autorizada'},{status:403});
 const user=await getAdminUser();
 if(!user)return NextResponse.json({error:'Sessão expirada'},{status:401});
 if(!['ADMINISTRADOR','GESTOR','EDITOR'].includes(user.papel))return NextResponse.json({error:'Sem permissão para enviar arquivos'},{status:403});
 if(Number(req.headers.get('content-length')||0)>MAX_DOCUMENT_SIZE+65536)return NextResponse.json({error:'Tamanho máximo: 15 MB'},{status:413});
 try{
  const form=await req.formData(),file=form.get('arquivo');
  if(!(file instanceof File))return NextResponse.json({error:'Selecione um arquivo'},{status:400});
  if(file.size<8||file.size>MAX_DOCUMENT_SIZE)return NextResponse.json({error:'Arquivo deve ter até 15 MB'},{status:400});
  const key=await saveDocument(Buffer.from(await file.arrayBuffer()),file.name);
  return NextResponse.json({url:new URL('/api/arquivos/'+key,req.url).toString(),nome:file.name},{status:201,headers:{'Cache-Control':'no-store'}});
 }catch(e){if(e instanceof Error&&e.message==='Formato de arquivo inválido')return NextResponse.json({error:'Formato ou conteúdo inválido. Aceitos: PDF, Office e imagens PNG/JPG/WebP.'},{status:400});console.error('[upload arquivo]',e);return NextResponse.json({error:'Não foi possível armazenar o arquivo'},{status:500});}
}
