import Link from 'next/link';
import {SiteHeader} from '../../components/site-header';
import {MunicipalLogo} from '../../components/municipal-logo';

// Os menus são consultados em tempo real, evitando congelar o HTML durante o build.
export const dynamic='force-dynamic';
export default function PublicLayout({children}:Readonly<{children:React.ReactNode}>){
 return <>
  <a className="skip" href="#conteudo">Pular para o conteúdo</a>
  <SiteHeader/>
  <main id="conteudo">{children}</main>
  <footer className="site-footer">
   <div className="wrap footer-main">
    <div className="footer-identity">
     <Link href="/" aria-label="Prefeitura de Guarará — início" className="footer-logo-link"><MunicipalLogo className="footer-logo"/></Link>
     <p>Prefeitura Municipal de Guarará</p>
     <span>Informação, serviços e transparência para todos.</span>
    </div>
    <div className="footer-links-block"><h2>Institucional</h2><Link href="/municipio">O município</Link><Link href="/administracao">Administração</Link><Link href="/transparencia">Portal da Transparência</Link></div>
    <div className="footer-links-block"><h2>Serviços</h2><Link href="/servicos/protocolo">Protocolo</Link><Link href="/servicos/emails">E-mails oficiais</Link><Link href="/secretarias">Secretarias</Link></div>
    <div className="footer-links-block"><h2>Atendimento</h2><Link href="/atendimento">Fale com a prefeitura</Link><Link href="/transparencia">Acesso à informação</Link><Link href="/servicos/protocolo">Formulários</Link></div>
   </div>
   <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Prefeitura Municipal de Guarará — MG</span><span>Portal institucional oficial</span></div>
  </footer>
 </>;
}
