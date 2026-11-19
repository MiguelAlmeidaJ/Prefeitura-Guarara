import {NextResponse} from 'next/server';
import {getHomeBannerBytes} from '../../../lib/standard-images';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){
 const image=await getHomeBannerBytes();
 if(!image)return NextResponse.json({error:'Banner não configurado'},{status:404,headers:{'Cache-Control':'no-store'}});
 return new NextResponse(new Uint8Array(image.bytes),{headers:{'Content-Type':image.mime,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
