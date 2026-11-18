import {redirect} from 'next/navigation';
import Link from 'next/link';
import {getAdminUser} from '../../../lib/admin-session';
import {AdminLogout} from '../../../components/admin-logout';
export const dynamic='force-dynamic';
export default async function ProtectedLayout({children}:Readonly<{children:React.ReactNode}>){
 const user=await getAdminUser();
 if(!user)redirect('/admin/login');
 return <div className="admin-shell">
  <aside className="admin-sidebar">
   <Link href="/admin" className="admin-sidebar-brand"><span className="admin-sidebar-logo">G</span><span><strong>Guarará</strong><small>GESTÃO MUNICIPAL</small></span></Link>
   <div className="admin-sidebar-label">MENU PRINCIPAL</div>
   <nav aria-label="Navegação administrativa">
    <Link href="/admin" className="admin-sidebar-link"><span aria-hidden="true">▦</span> Páginas e conteúdos</Link>
    <Link href="/admin/tabelas" className="admin-sidebar-link"><span aria-hidden="true">▤</span> Tabelas reutilizáveis</Link>
    <Link href="/admin/menu" className="admin-sidebar-link"><span aria-hidden="true">☷</span> Menu do portal</Link>
    <div className="admin-sidebar-label admin-sidebar-group">SERVIÇOS</div>
    <Link href="/admin/servicos/protocolo" className="admin-sidebar-link"><span aria-hidden="true">▤</span> Protocolo</Link>
    <div className="admin-sidebar-label admin-sidebar-group">SECRETARIAS</div>
    <Link href="/admin/secretarias/obras" className="admin-sidebar-link"><span aria-hidden="true">▥</span> Obras</Link>
    <Link href="/admin/secretarias/saude" className="admin-sidebar-link"><span aria-hidden="true">✚</span> Saúde</Link>
    <Link href="/" target="_blank" rel="noopener noreferrer" className="admin-sidebar-link"><span aria-hidden="true">↗</span> Visualizar portal</Link>
   </nav>
   <div className="admin-sidebar-bottom"><span className="admin-sidebar-avatar">{(user.nome||'A').charAt(0).toUpperCase()}</span><div><strong>{user.nome||'Administrador'}</strong><small>{user.papel.toLowerCase()}</small></div></div>
  </aside>
  <div className="admin-workspace">
   <header className="admin-workspace-header"><div><span className="admin-breadcrumb-muted">Administração</span><span className="admin-breadcrumb-divider">/</span><span>Gerenciador de conteúdo</span></div><div className="admin-workspace-header-right"><span className="admin-online-dot"/> Área administrativa <AdminLogout/></div></header>
   <main id="conteudo" className="admin-content">{children}</main>
  </div>
 </div>;
}
