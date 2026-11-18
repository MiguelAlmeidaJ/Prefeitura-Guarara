import {NextResponse} from 'next/server';
import {readComunicadoCover} from '../../../../lib/comunicado-covers';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(_req:Request,{params}:{params:Promise<{arquivo:string}>}){
 const {arquivo}=await params;
 const file=await readComunicadoCover(arquivo);
 if(!file)return NextResponse.json({error:'Capa não encontrada'},{status:404});
 return new NextResponse(new Uint8Array(file.bytes),{headers:{'Content-Type':file.mime,'Cache-Control':'public, max-age=86400, immutable','X-Content-Type-Options':'nosniff'}});
}
