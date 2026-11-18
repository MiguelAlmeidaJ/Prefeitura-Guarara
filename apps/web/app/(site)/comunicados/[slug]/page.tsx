import Link from 'next/link';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {ComunicadoImage,type Comunicado} from '../../../../components/comunicados-publicos';
import {RichTextContent} from '../../../../components/rich-text-editor';
export const dynamic='force-dynamic';
async function get(slug:string):Promise<Comunicado|null>{
 try{
  const base=process.env.API_URL||'http://127.0.0.1:3007';
  const response=await fetch(base+'/api/comunicados/'+encodeURIComponent(slug),{cache:'no-store'});
  if(!response.ok)return null;
  return await response.json() as Comunicado;
 }catch{return null;}
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const item=await get(slug);
 return {title:item?.titulo||'Comunicado não encontrado',description:item?.resumo||'Comunicado oficial da Prefeitura de Guarará'};
}
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const item=await get(slug);if(!item)notFound();
 const date=item.publicadoEm?new Intl.DateTimeFormat('pt-BR',{dateStyle:'long',timeZone:'America/Sao_Paulo'}).format(new Date(item.publicadoEm)):null;
 return <article className="comunicado-detail"><div className="wrap"><Link href="/comunicados" className="comunicado-back">← Todos os comunicados</Link><div className="comunicado-detail-header"><span className="section-kicker">{item.categoriaRel?.nome||'COMUNICADO OFICIAL'}</span><h1>{item.titulo}</h1>{date&&<time dateTime={item.publicadoEm||undefined}>{date}</time>}{item.resumo&&<p>{item.resumo}</p>}</div><ComunicadoImage capaArquivo={item.capaArquivo} capaCategoria={item.categoriaRel?.capaArquivo}/><RichTextContent value={item.conteudo}/><div className="comunicado-detail-foot"><Link href="/comunicados">← Voltar aos comunicados</Link></div></div></article>;
}
