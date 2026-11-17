import Link from 'next/link';
import { HeaderSearch } from './header-search';

const navigation = [
 ['Município', '/municipio'], ['Administração', '/administracao'],
 ['Transparência', '/transparencia'], ['Licitações', '/licitacoes'],
 ['Concursos', '/concursos'], ['Atendimento', '/atendimento'],
];

export function SiteHeader() {
 const bannerUrl = process.env.NEXT_PUBLIC_HEADER_IMAGE_URL?.trim();
 return <header className="site-header">
   <div className="site-search-bar"><HeaderSearch /></div>
   <div className="site-banner">
     {bannerUrl ? <div className="site-banner-photo" style={{backgroundImage:'url('+JSON.stringify(bannerUrl)+')'}} aria-hidden="true" /> : <div className="site-banner-placeholder" aria-hidden="true" />}
     <Link href="/" className="site-banner-identity" aria-label="Prefeitura Municipal de Guarará, página inicial">
       <span className="site-emblem" aria-hidden="true">MG</span>
       <span className="site-identity-caption">Prefeitura Municipal de</span>
       <strong>GUARARÁ</strong>
     </Link>
   </div>
   <nav className="site-nav" aria-label="Navegação principal"><div className="wrap site-nav-items">
     {navigation.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
   </div></nav>
 </header>;
}
