import {NextResponse} from 'next/server';
import {assetBytes,readSiteIdentity,type Kind} from '../../../../lib/site-identity';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const fallbackIcon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1A2E4A"/><text x="32" y="45" fill="white" font-family="Arial" font-size="42" text-anchor="middle" font-weight="bold">G</text></svg>';
export async function GET(_req:Request,{params}:{params:Promise<{kind:string}>}){
 const {kind}=await params;
 if(kind!=='logo'&&kind!=='favicon')return NextResponse.json({error:'Imagem inválida'},{status:404});
 const found=await assetBytes(kind as Kind);
 if(!found){
  if(kind==='favicon')return new NextResponse(fallbackIcon,{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  return NextResponse.json({error:'Logo não cadastrada'},{status:404});
 }
 return new NextResponse(new Uint8Array(found.bytes),{headers:{'Content-Type':found.mime,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
