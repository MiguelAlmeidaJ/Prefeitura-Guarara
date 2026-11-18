import {NextResponse} from 'next/server';
import {getAdminUser} from '../../../lib/admin-session';
export async function GET(){
 const user=await getAdminUser();
 return NextResponse.json(user||{error:'Não autenticado'},{status:user?200:401,headers:{'Cache-Control':'no-store'}});
}
