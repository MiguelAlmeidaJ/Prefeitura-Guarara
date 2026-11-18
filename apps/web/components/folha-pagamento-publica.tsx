'use client';
import {useEffect,useMemo,useState,type FormEvent} from 'react';
import Link from 'next/link';

import {folhaCategorias,meses,type CategoriaFolha} from '../lib/folha-pagamento';
type Categoria=CategoriaFolha;
type Competencia={id:string;ano:number;mes:number;link:string};
export function FolhaPagamentoPublica({categoria}:{categoria:Categoria}){
 const [registros,setRegistros]=useState<Competencia[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [term,setTerm]=useState('');
 const [query,setQuery]=useState('');
 const [ano,setAno]=useState<number|null>(null);
 const info=folhaCategorias.find(x=>x.slug===categoria)!;
 useEffect(()=>{let active=true;setLoading(true);setError('');fetch('/api/folha-pagamento/'+categoria,{cache:'no-store'}).then(async res=>{if(!res.ok)throw Error('Não foi possível consultar a folha de pagamento');return res.json() as Promise<Competencia[]>;}).then(rows=>{if(active)setRegistros(rows);}).catch(e=>{if(active)setError(String(e));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false};},[categoria]);
 const anos=useMemo(()=>{const counts=new Map<number,number>();for(const r of registros)counts.set(r.ano,(counts.get(r.ano)||0)+1);return [...counts].sort((a,b)=>b[0]-a[0]);},[registros]);
 const ativo=ano!==null&&anos.some(([y])=>y===ano)?ano:anos[0]?.[0]??null;
 const filtered=useMemo(()=>registros.filter(r=>(ativo===null||r.ano===ativo)&&(!query||(''+r.ano+' '+r.mes+' '+meses[r.mes-1]).toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')))).sort((a,b)=>b.ano-a.ano||b.mes-a.mes),[registros,ativo,query]);
 function search(e:FormEvent){e.preventDefault();setQuery(term.trim());}
 return <div className="payroll">
  <section className="law-hero"><div className="wrap"><div className="law-hero-heading"><span className="law-hero-icon"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M7 9h10M7 13h10M7 17h6"/></svg></span><div><span className="law-kicker">TRANSPARÊNCIA · FOLHA DE PAGAMENTO</span><h1>Folha de Pagamento — {info.nome}</h1><p>Consulte as folhas de pagamento por competência e exercício.</p></div></div><div className="law-stats"><span>{registros.length} competência(s) publicada(s)</span><span>{anos.length} exercício(s)</span></div></div></section>
  <div className="law-content"><div className="wrap"><div className="payroll-back"><Link href="/transparencia/folha-de-pagamento">← Todas as categorias</Link></div>
   <form className="law-search" onSubmit={search}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3"/><path d="m15.5 15.5 5 5"/></svg><input value={term} onChange={e=>setTerm(e.target.value)} aria-label="Pesquisar competência" placeholder="Pesquisar por mês ou ano..."/><button type="submit">Pesquisar</button></form>
   {query&&<div className="law-search-status"><span>Pesquisa: {query}</span><button type="button" onClick={()=>{setTerm('');setQuery('');}}>Limpar</button></div>}
   {loading?<div className="law-empty">Carregando competências...</div>:error?<div className="law-empty" role="alert">{error}</div>:!registros.length?<div className="law-empty">Ainda não existem competências publicadas nesta categoria.</div>:<>
    <div className="law-year-filters">{anos.map(([year,count])=><button type="button" key={year} className={ativo===year?'active':''} onClick={()=>setAno(year)}>{year}<span>{count}</span></button>)}</div>
    <div className="law-section-title"><h2>Exercício <span>{ativo}</span></h2><small>{filtered.length} competência(s)</small></div>
    {!filtered.length?<div className="law-empty">Nenhuma competência encontrada para a pesquisa e o exercício selecionados.</div>:<div className="law-table-wrap"><table className="law-table payroll-table"><thead><tr><th>COMPETÊNCIA</th><th>CATEGORIA</th><th>ACESSO</th></tr></thead><tbody>{filtered.map(item=><tr key={item.id}><td><span className="law-number">{meses[item.mes-1]}</span><small>{item.ano}</small></td><td><span className="law-type">FOLHA DE PAGAMENTO</span><strong>{info.nome} — {meses[item.mes-1]}/{item.ano}</strong></td><td><a className="law-action" href={item.link} target="_blank" rel="noopener noreferrer">Visualizar folha <span aria-hidden="true">↗</span></a></td></tr>)}</tbody></table></div>}
   </>}
  </div></div>
 </div>;
}
