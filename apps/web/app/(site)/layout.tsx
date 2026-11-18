import Link from 'next/link';
import { SiteHeader } from '../../components/site-header';
export default function PublicLayout({children}:Readonly<{children:React.ReactNode}>){
 return <>
  <a className="skip" href="#conteudo">Pular para o conteúdo</a>
  <SiteHeader/>
  <main id="conteudo">{children}</main>
  <footer className="site-footer"><div className="wrap footer-grid">
    <div><Link href="/" className="footer-brand">Prefeitura Municipal de Guarará</Link><p>Portal institucional da Prefeitura de Guarará, Minas Gerais.</p><p className="footer-note">Conteúdo oficial em fase de implantação e validação.</p></div>
    <div><strong>Institucional</strong><Link href="/municipio">O município</Link><Link href="/administracao">Administração</Link><Link href="/transparencia">Transparência</Link></div>
    <div><strong>Atendimento</strong><Link href="/atendimento">Canais de atendimento</Link><Link href="/licitacoes">Licitações</Link><Link href="/concursos">Concursos</Link></div>
  </div><div className="wrap footer-bottom">© Prefeitura Municipal de Guarará — MG</div></footer>
 </>;
}

