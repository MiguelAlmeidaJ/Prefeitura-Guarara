import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '../components/site-header';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Prefeitura de Guarará - MG', template: '%s | Prefeitura de Guarará' },
  description: 'Portal institucional da Prefeitura Municipal de Guarará, Minas Gerais.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>
    <a className="skip" href="#conteudo">Pular para o conteúdo</a>
    <SiteHeader />
    <main id="conteudo">{children}</main>
    <footer><div className="wrap"><strong>Prefeitura Municipal de Guarará</strong><p>Portal institucional em desenvolvimento. Informações oficiais serão publicadas após validação.</p></div></footer>
  </body></html>;
}
