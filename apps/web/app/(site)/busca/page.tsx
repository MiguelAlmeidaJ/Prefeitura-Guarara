import Link from 'next/link';
import type { Metadata } from 'next';
import { sections } from '../../../lib/navigation';

export const metadata: Metadata = { title: 'Pesquisar páginas' };

export default async function SearchPage({searchParams}: {searchParams: Promise<{q?:string}>}) {
 const {q=''} = await searchParams;
 const term=q.trim().slice(0,120);
 const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const result=term?sections.filter(section => normalize(section.title+' '+section.description+' '+section.pages.join(' ')).includes(normalize(term))):[];
 return <section className="section"><div className="wrap">
   <h1>Pesquisar páginas</h1>
   <p>{term?<>Resultados para <strong>{term}</strong></>:'Digite um termo no campo de busca no topo do site.'}</p>
   {term&&result.length===0&&<p>Nenhuma página institucional encontrada. A pesquisa de conteúdos cadastrados no CMS será integrada posteriormente.</p>}
   <div className="grid">{result.map(section=><Link className="tile" key={section.slug} href={'/'+section.slug}><strong>{section.title}</strong>{section.description}</Link>)}</div>
 </div></section>;
}
