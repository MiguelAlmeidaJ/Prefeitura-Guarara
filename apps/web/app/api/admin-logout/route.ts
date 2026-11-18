import {NextResponse} from 'next/server';
import {COOKIE_NAME} from '../../../lib/admin-session';
export async function POST(){
 const out=NextResponse.json({ok:true});
 out.cookies.set(COOKIE_NAME,'',{path:'/',httpOnly:true,maxAge:0});
 out.headers.set('Cache-Control','no-store');
 return out;
}
