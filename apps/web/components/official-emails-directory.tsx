'use client';
import {useEffect,useMemo,useState} from 'react';
type Contact={id:string;nome:string;email:string;ordem:number};
type Group={id:string;nome:string;ordem:number;emails:Contact[]};
export function OfficialEmailsDirectory(){
 const [groups,setGroups]=useState<Group[]>([]);
 const [query,setQuery]=useState('');
 const [selected,setSelected]=useState('todos');
 const [copied,setCopied]=useState<string|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 useEffect(()=>{let active=true;fetch('/api/emails-oficiais',{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error('Não foi possível carregar os contatos');return r.json() as Promise<Group[]>;}).then(data=>{if(active)setGroups(data);}).catch(e=>{if(active)setError(String(e));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false};},[]);
 const total=groups.reduce((acc,g)=>acc+g.emails.length,0);
 const results=useMemo(()=>groups.filter(g=>selected==='todos'||selected===g.id).map(g=>({...g,emails:g.emails.filter(e=>(g.nome+' '+e.nome+' '+e.email).toLocaleLowerCase('pt-BR').includes(query.trim().toLocaleLowerCase('pt-BR')))})).filter(g=>g.emails.length>0),[groups,query,selected]);
 async function copy(email:string){
  try{await navigator.clipboard.writeText(email);setCopied(email);window.setTimeout(()=>setCopied(current=>current===email?null:current),2200);}
  catch{setCopied(null);}
 }
 return <div className="official-email-directory">
 <div className="official-email-search"><div className="official-email-search-input"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3"/><path d="m15.5 15.5 5 5"/></svg><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Pesquisar setor ou e-mail..." aria-label="Pesquisar e-mails oficiais"/></div><span>{results.reduce((n,g)=>n+g.emails.length,0)} resultado(s)</span></div>
 <div className="official-email-filters" aria-label="Filtrar grupos"><button type="button" className={selected==='todos'?'active':''} onClick={()=>setSelected('todos')}>Todos <span>{total}</span></button>{groups.map(g=><button type="button" key={g.id} className={selected===g.id?'active':''} onClick={()=>setSelected(g.id)}>{g.nome} <span>{g.emails.length}</span></button>)}</div>
 {loading?<div className="official-email-public-empty">Carregando e-mails oficiais...</div>:error?<div className="official-email-public-empty" role="alert">{error}</div>:results.length===0?<div className="official-email-public-empty">{total?'Nenhum e-mail encontrado para os filtros selecionados.':'Ainda não há contatos institucionais publicados.'}</div>:
 <div className="official-email-sections">{results.map(g=><section className="official-email-section" key={g.id}><div className="official-email-section-title"><h2>{g.nome}</h2><span>{g.emails.length} e-mail(s)</span></div><div className="official-email-grid">{g.emails.map(c=><article key={c.id} className="official-email-card"><div><h3>{c.nome}</h3><a href={'mailto:'+c.email}>{c.email}</a></div><button type="button" className={copied===c.email?'is-copied':''} onClick={()=>void copy(c.email)} aria-label={'Copiar '+c.email}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>{copied===c.email?'Copiado!':'Copiar'}</button></article>)}</div></section>)}</div>}
 </div>;
}
