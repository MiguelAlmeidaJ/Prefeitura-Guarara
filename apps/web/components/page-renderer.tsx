'use client';
import {useState} from 'react';
export type LinkItem={texto:string;url:string;novaAba:boolean};
export type TableColumn={chave:string;titulo:string;tipo?:'TEXTO'|'LINK';multiplos?:boolean};
export type CellLink={texto:string;url:string};
export type TableData={colunas:TableColumn[];linhas:Record<string,string|CellLink|CellLink[]>[]};
export type PortalPage={id:string;titulo:string;slug:string;subtitulo?:string|null;tipo:'GRID_LINKS'|'TABELA_SIMPLES'|'TABELA_ABAS';conteudo:unknown};
function Celula({valor,coluna}:{valor:string|CellLink|CellLink[]|undefined;coluna:TableColumn}){
 if(valor===undefined||valor===null)return null;
 if(coluna.tipo!=='LINK')return <>{typeof valor==='string'?valor:''}</>;
 const links=Array.isArray(valor)?valor:[valor];
 return <span className="cms-cell-links">{links.filter((l):l is CellLink=>typeof l==='object'&&l!==null&&'url'in l).map((link,i)=><a key={i} href={link.url} target="_blank" rel="noopener noreferrer">{link.texto}</a>)}</span>;
}
function Tabela({data}:{data:TableData}){
 return <div className="cms-table-wrap"><table className="cms-table"><thead><tr>{data.colunas.map(c=><th key={c.chave}>{c.titulo}</th>)}</tr></thead><tbody>{data.linhas.map((r,i)=><tr key={i}>{data.colunas.map(c=><td key={c.chave}><Celula valor={r[c.chave]} coluna={c}/></td>)}</tr>)}</tbody></table></div>;
}
function Abas({abas}:{abas:{titulo:string;tabela:TableData}[]}){
 const [active,setActive]=useState(0);
 return <><div className="cms-tabs" role="tablist" aria-label="Tabelas">{abas.map((a,i)=><button type="button" role="tab" aria-selected={active===i} key={i} onClick={()=>setActive(i)}>{a.titulo}</button>)}</div><div role="tabpanel"><Tabela data={abas[active].tabela}/></div></>;
}
export function PageRenderer({page}:{page:PortalPage}){
 const content=page.conteudo as {links:LinkItem[];colunas:TableData['colunas'];linhas:TableData['linhas'];abas:{titulo:string;tabela:TableData}[]};
 return <section className="section"><div className="wrap"><h1 className="cms-title">{page.titulo}</h1>{page.subtitulo&&<p className="cms-subtitle">{page.subtitulo}</p>}
 {page.tipo==='GRID_LINKS'&&<div className="cms-grid">{content.links.map((link,i)=><a key={i} href={link.url} target={link.novaAba?'_blank':undefined} rel={link.novaAba?'noopener noreferrer':undefined} className="cms-link">{link.texto}</a>)}</div>}
 {page.tipo==='TABELA_SIMPLES'&&<Tabela data={content}/>}
 {page.tipo==='TABELA_ABAS'&&<Abas abas={content.abas}/>}
 </div></section>;
}
