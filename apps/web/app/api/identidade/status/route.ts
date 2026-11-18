import {NextResponse} from 'next/server';
import {readSiteIdentity} from '../../../../lib/site-identity';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){
 const assets=await readSiteIdentity();
 return NextResponse.json({logo:assets.logo?{version:assets.logo.version}:null,favicon:assets.favicon?{version:assets.favicon.version}:null},{headers:{'Cache-Control':'no-store'}});
}
