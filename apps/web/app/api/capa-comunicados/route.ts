import {NextResponse} from 'next/server';
import {getCoverBytes} from '../../../lib/standard-images';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){
 const cover=await getCoverBytes();
 if(!cover)return NextResponse.json({error:'Capa padrão não configurada'},{status:404,headers:{'Cache-Control':'no-store'}});
 return new NextResponse(new Uint8Array(cover.bytes),{headers:{'Content-Type':cover.mime,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
