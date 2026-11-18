import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { sections } from '../../../lib/navigation';
export function generateStaticParams(){ return sections.map(s => ({ secao: s.slug })); }
export async function generateMetadata({params}: {params: Promise<{secao:string}>}): Promise<Metadata>{
 const {secao}=await params; const page=sections.find(s=>s.slug===secao); return {title:page?.title??'Página não encontrada'};
}
export default async function SectionPage({params}: {params: Promise<{secao:string}>}) {
 const {secao}=await params; const page=sections.find(s=>s.slug===secao); if(!page) notFound();
 return <><div className="wrap page-title"><h1>{page.title}</h1><p className="muted">{page.description}</p></div><section className="section"><div className="wrap"><h2>Informações e serviços</h2><div className="grid">{page.pages.map(item=><div className="tile" key={item}><strong>{item}</strong><span className="muted">Conteúdo aguardando publicação oficial.</span></div>)}</div></div></section></>;
}
