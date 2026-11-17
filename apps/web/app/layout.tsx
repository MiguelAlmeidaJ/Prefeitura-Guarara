import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Prefeitura de Argirita - MG', template: '%s | Prefeitura de Argirita' },
  description: 'Portal institucional da Prefeitura Municipal de Argirita, Minas Gerais.',
};

const menu = [
  ['Município', '/municipio'], ['Administração', '/administracao'],
  ['Transparência', '/transparencia'], ['Licitações', '/licitacoes'],
  ['Concursos', '/concursos'], ['Atendimento', '/atendimento'],
];
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>
    <a className="skip" href="#conteudo">Pular para o conteúdo</a>
    <header className="header"><div className="wrap header-inner"><Link className="brand" href="/">
      <span className="brand-mark" aria-hidden="true">MG</span><span>Prefeitura Municipal<br/><strong>Argirita - MG</strong></span>
    </Link><nav aria-label="Navegação principal">{menu.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav></div></header>
    <main id="conteudo">{children}</main>
    <footer><div className="wrap"><strong>Prefeitura Municipal de Argirita</strong><p>Portal institucional em desenvolvimento. Informações oficiais serão publicadas após validação.</p></div></footer>
  </body></html>;
}
