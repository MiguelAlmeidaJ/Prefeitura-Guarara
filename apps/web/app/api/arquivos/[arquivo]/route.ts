import {NextResponse} from 'next/server';
import {readDocument} from '../../../../lib/document-storage';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(_req:Request,{params}:{params:Promise<{arquivo:string}>}){
 const {arquivo}=await params;
 const file=await readDocument(arquivo);
 if(!file)return NextResponse.json({error:'Arquivo não encontrado'},{status:404});
 return new NextResponse(new Uint8Array(file.bytes),{headers:{
  'Content-Type':file.type,
  'Content-Disposition':(file.ext==='pdf'||['png','jpg','webp'].includes(file.ext)?'inline':'attachment')+'; filename="'+arquivo+'"',
  'X-Content-Type-Options':'nosniff',
  'Content-Security-Policy':"default-src 'none'; sandbox",
  'Cache-Control':'public, max-age=86400, immutable'
 }});
}
