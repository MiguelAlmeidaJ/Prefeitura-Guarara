import {redirect} from 'next/navigation';
import Link from 'next/link';
import {getAdminUser} from '../../../lib/admin-session';
import {AdminLogout} from '../../../components/admin-logout';
export const dynamic='force-dynamic';
export default async function ProtectedLayout({children}:Readonly<{children:React.ReactNode}>){
 const user=await getAdminUser();
 if(!user)redirect('/admin/login');
 return <><header className="admin-topbar"><div className="wrap admin-topbar-inner"><Link className="admin-topbar-brand" href="/admin">◆ Guarará <span>Painel administrativo</span></Link><nav aria-label="Menu administrativo"><Link href="/admin">Páginas</Link><Link href="/admin/tabelas">Tabelas</Link><Link href="/" target="_blank" rel="noopener noreferrer">Ver site ↗</Link></nav><AdminLogout/></div></header><main id="conteudo" className="admin-content">{children}</main></>;
}
