import {redirect} from 'next/navigation';
import {getAdminUser} from '../../../lib/admin-session';
import {AdminShell} from '../../../components/admin-shell';
export const dynamic='force-dynamic';
export default async function ProtectedLayout({children}:Readonly<{children:React.ReactNode}>){
 const user=await getAdminUser();
 if(!user)redirect('/admin/login');
 return <AdminShell user={{nome:user.nome||'Administrador',papel:user.papel}}>{children}</AdminShell>;
}
