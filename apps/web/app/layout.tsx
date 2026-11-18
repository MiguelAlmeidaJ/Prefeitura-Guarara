import type { Metadata } from 'next';
import { SiteHeader } from '../components/site-header';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
 title: {default:'Prefeitura de Guarará - MG',template:'%s | Prefeitura de Guarará'},
 description:'Portal institucional da Prefeitura Municipal de Guarará, Minas Gerais.',
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
 return <html lang="pt-BR"><head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
 </head><body>
  <a className="skip" href="#conteudo">Pular para o conteúdo</a>
  <SiteHeader/>
  <main id="conteudo">{children}</main>
  <footer className="site-footer"><div className="wrap footer-grid">
    <div><Link href="/" className="footer-brand">Prefeitura Municipal de Guarará</Link><p>Portal institucional da Prefeitura de Guarará, Minas Gerais.</p><p className="footer-note">Conteúdo oficial em fase de implantação e validação.</p></div>
    <div><strong>Institucional</strong><Link href="/municipio">O município</Link><Link href="/administracao">Administração</Link><Link href="/transparencia">Transparência</Link></div>
    <div><strong>Atendimento</strong><Link href="/atendimento">Canais de atendimento</Link><Link href="/licitacoes">Licitações</Link><Link href="/concursos">Concursos</Link></div>
  </div><div className="wrap footer-bottom">© Prefeitura Municipal de Guarará — MG</div></footer>
 </body></html>;
}
