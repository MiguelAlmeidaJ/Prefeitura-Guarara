'use client';
import {useEffect,useMemo,useState,type FormEvent} from 'react';
type Tipo='leis'|'decretos'|'portarias';
type Ato={id:string;numero:string;ano:number;titulo:string;ementa:string|null;processo:string|null;link:string;acao:'BAIXAR'|'VISUALIZAR'};
const cfg:{[K in Tipo]:{title:string;singular:string}}={leis:{title:'Leis Municipais',singular:'Lei'},decretos:{title:'Decretos Municipais',singular:'Decreto'},portarias:{title:'Portarias Municipais',singular:'Portaria'}};
const numeric=(number:string)=>Number.parseInt(number.replace(/\D.*/,'').trim(),10)||0;
export function AtosNormativosPublicos({tipo}:{tipo:Tipo}){
 const [items,setItems]=useState<Ato[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [input,setInput]=useState('');
 const [search,setSearch]=useState('');
 const [year,setYear]=useState<number|null>(null);
 const [page,setPage]=useState(1);
 useEffect(()=>{let active=true;setLoading(true);setError('');fetch('/api/atos-normativos/'+tipo,{cache:'no-store'}).then(async response=>{if(!response.ok)throw Error('Falha ao carregar documentos');return response.json() as Promise<Ato[]>;}).then(value=>{if(active)setItems(value);}).catch(e=>{if(active)setError(String(e));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[tipo]);
 const counts=useMemo(()=>{const m=new Map<number,number>();items.forEach(i=>m.set(i.ano,(m.get(i.ano)||0)+1));return [...m.entries()].sort((a,b)=>b[0]-a[0]);},[items]);
 const activeYear=year!==null&&counts.some(x=>x[0]===year)?year:(counts[0]?.[0]??null);
 const filtered=useMemo(()=>items.filter(i=>(activeYear===null||i.ano===activeYear)&&(!search||(i.numero+' '+i.titulo+' '+(i.ementa||'')+' '+(i.processo||'')+' '+i.ano).toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')))).sort((a,b)=>numeric(b.numero)-numeric(a.numero)||b.numero.localeCompare(a.numero,'pt-BR')),[items,activeYear,search]);
 const perPage=35,totalPages=Math.max(1,Math.ceil(filtered.length/perPage)),current=Math.min(page,totalPages),visible=filtered.slice((current-1)*perPage,current*perPage);
 function submit(e:FormEvent){e.preventDefault();setSearch(input.trim());setPage(1);}
 return <div className="law-directory">
  <section className="law-hero"><div className="wrap"><div className="law-hero-heading"><span className="law-hero-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="29" height="29" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 3h9l4 4v14H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z"/><path d="M15 3v5h5M8 12h8M8 16h8"/></svg></span><div><span className="law-kicker">LEGISLAÇÃO MUNICIPAL</span><h1>{cfg[tipo].title}</h1><p>Consulte os documentos oficiais organizados por exercício, número e ementa.</p></div></div><div className="law-stats"><span>{items.length} documento(s) publicado(s)</span><span>{counts.length} exercício(s)</span></div></div></section>
  <section className="law-content"><div className="wrap"><form className="law-search" onSubmit={submit}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3"/><path d="m15.5 15.5 5 5"/></svg><input aria-label="Pesquisar documentos" placeholder="Pesquisar por número, título, ementa, processo ou ano..." value={input} onChange={e=>setInput(e.target.value)}/><button type="submit">Pesquisar</button></form>
  {search&&<div className="law-search-status"><span>Pesquisa: <strong>{search}</strong></span><button type="button" onClick={()=>{setInput('');setSearch('');setPage(1);}}>Limpar pesquisa</button></div>}
  {loading?<div className="law-empty">Carregando documentos...</div>:error?<div role="alert" className="law-empty">{error}</div>:!items.length?<div className="law-empty">Ainda não há documentos publicados nesta categoria.</div>:<>
   <div className="law-year-filters" aria-label="Exercícios disponíveis">{counts.map(([y,n])=><button key={y} type="button" className={y===activeYear?'active':''} onClick={()=>{setYear(y);setPage(1);}}>{y}<span>{n}</span></button>)}</div>
   <div className="law-section-title"><h2>Exercício <span>{activeYear}</span></h2><small>{filtered.length} documento(s)</small></div>
   {filtered.length===0?<div className="law-empty">Nenhum documento encontrado para o exercício e pesquisa selecionados.</div>:<div className="law-table-wrap"><table className="law-table"><thead><tr><th>NÚMERO</th><th>IDENTIFICAÇÃO</th><th>ACESSO</th></tr></thead><tbody>{visible.map(i=><tr key={i.id}><td><span className="law-number">Nº {i.numero}</span></td><td><span className="law-type">{cfg[tipo].singular.toUpperCase()}</span><strong>{i.titulo}</strong>{i.ementa&&<p>{i.ementa}</p>}{i.processo&&<small>Processo: {i.processo}</small>}</td><td><a className="law-action" href={i.link} target="_blank" rel="noopener noreferrer">{i.acao==='BAIXAR'?'Baixar PDF':'Visualizar'} <span aria-hidden="true">↗</span></a></td></tr>)}</tbody></table></div>}
   {totalPages>1&&<div className="law-pages"><button type="button" disabled={current===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Anterior</button><span>Página {current} de {totalPages}</span><button type="button" disabled={current===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Próxima</button></div>}
  </>}
  </div></section>
 </div>;
}
