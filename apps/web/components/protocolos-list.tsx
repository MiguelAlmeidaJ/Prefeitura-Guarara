'use client';
import {useEffect,useMemo,useState} from 'react';
type Protocolo={id:string;nome:string;link:string;ordem:number};
export function ProtocolosList(){
 const [items,setItems]=useState<Protocolo[]>([]);
 const [query,setQuery]=useState('');
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 useEffect(()=>{let active=true;fetch('/api/protocolos',{cache:'no-store'}).then(async response=>{if(!response.ok)throw new Error('Não foi possível consultar os protocolos');return response.json() as Promise<Protocolo[]>;}).then(value=>{if(active)setItems(value);}).catch(err=>{if(active)setError(String(err));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false};},[]);
 const filtered=useMemo(()=>items.filter(item=>item.nome.toLocaleLowerCase('pt-BR').includes(query.trim().toLocaleLowerCase('pt-BR'))),[items,query]);
 return <section className="protocol-public-catalog"><div className="protocol-public-title"><div><span className="protocol-kicker">DOCUMENTOS DISPONÍVEIS</span><h2>Encontre seu formulário</h2><p>Consulte os documentos cadastrados pelo município.</p></div><span className="protocol-public-count">{filtered.length} formulário(s)</span></div>
 <label className="protocol-public-search"><span aria-hidden="true">⌕</span><input type="search" aria-label="Buscar formulário" placeholder="Buscar formulário pelo nome..." value={query} onChange={e=>setQuery(e.target.value)}/></label>
 {loading?<div className="protocol-public-empty">Carregando formulários...</div>:error?<div className="protocol-public-empty" role="alert">{error}</div>:!filtered.length?<div className="protocol-public-empty">{items.length?'Nenhum formulário encontrado.':'Nenhum formulário disponível no momento.'}</div>:
 <div className="protocol-public-grid">{filtered.map(item=><article key={item.id} className="protocol-public-card"><span className="protocol-file-icon" aria-hidden="true">PDF</span><div className="protocol-public-card-body"><h3>{item.nome}</h3><a href={item.link} download target="_blank" rel="noopener noreferrer" aria-label={'Baixar PDF: '+item.nome}><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3v12m-5-5 5 5 5-5M4 18v3h16v-3"/></svg>Baixar PDF</a></div></article>)}</div>}
 </section>;
}
