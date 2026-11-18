'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';

export type Comunicado={id:string;titulo:string;slug:string;resumo:string|null;conteudo:string;publicadoEm:string|null;criadoEm:string};
function dates(date:string|null){return date?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'long',year:'numeric',timeZone:'America/Sao_Paulo'}).format(new Date(date)):'';}
function Photo({className=''}:{className?:string}){
 const [broken,setBroken]=useState(false);
 return <div className={'comunicado-cover '+className}>{!broken&&<img src="/api/capa-comunicados" loading="lazy" alt="" onError={()=>setBroken(true)}/>}<div className="comunicado-cover-placeholder" aria-hidden="true"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 6-6 4 4 3-3 5 5"/></svg></div></div>;
}
export function ComunicadoCard({item}:{item:Comunicado}){
 return <Link href={'/comunicados/'+item.slug} className="comunicado-card">
  <Photo/><div className="comunicado-card-body"><span className="comunicado-date">{dates(item.publicadoEm)}</span><h3>{item.titulo}</h3><p>{item.resumo||item.conteudo.replace(/[#*\[\]>]/g,'').slice(0,160)}</p><span className="comunicado-read">Ler comunicado <span aria-hidden="true">→</span></span></div>
 </Link>;
}
export function ComunicadosCarousel(){
 const [items,setItems]=useState<Comunicado[]>([]);
 const [loading,setLoading]=useState(true);
 const [position,setPosition]=useState(0);
 useEffect(()=>{let active=true;fetch('/api/comunicados',{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error('Falha');return r.json() as Promise<Comunicado[]>;}).then(d=>{if(active)setItems(d.slice(0,9));}).catch(()=>{}).finally(()=>{if(active)setLoading(false);});return()=>{active=false};},[]);
 const max=Math.max(0,items.length-3);
 function move(delta:number){setPosition(prev=>Math.max(0,Math.min(max,prev+delta)));}
 return <div className="comunicados-carousel">
  {items.length?<>
   <div className="comunicados-carousel-controls"><button aria-label="Comunicados anteriores" type="button" disabled={position===0} onClick={()=>move(-1)}>←</button><button aria-label="Próximos comunicados" type="button" disabled={position>=max} onClick={()=>move(1)}>→</button></div>
   <div className="comunicados-carousel-viewport"><div className="comunicados-carousel-track" style={{transform:'translateX(calc(-'+position+' * (100% + 18px) / 3))'}}>{items.map(i=><ComunicadoCard key={i.id} item={i}/>)}</div></div>
  </>:<div className="notice-empty"><div><strong>{loading?'Carregando comunicados...':'Nenhum comunicado publicado ainda'}</strong><p>Os comunicados oficiais aparecerão aqui após o cadastro no portal.</p></div></div>}
 </div>;
}
export function ComunicadosCatalogo(){
 const [items,setItems]=useState<Comunicado[]>([]),[query,setQuery]=useState(''),[loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 useEffect(()=>{let alive=true;fetch('/api/comunicados',{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error('Não foi possível carregar os comunicados');return r.json() as Promise<Comunicado[]>;}).then(d=>{if(alive)setItems(d);}).catch(e=>{if(alive)setError(String(e));}).finally(()=>{if(alive)setLoading(false);});return()=>{alive=false};},[]);
 const filtered=useMemo(()=>items.filter(i=>(i.titulo+' '+(i.resumo||'')).toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))),[items,query]);
 return <><section className="comunicados-hero"><div className="wrap"><span className="section-kicker">NOTÍCIAS INSTITUCIONAIS</span><h1>Comunicados</h1><p>Acompanhe avisos, informações e atualizações oficiais da Prefeitura Municipal de Guarará.</p></div></section>
 <section className="comunicados-catalog section"><div className="wrap"><div className="comunicados-catalog-top"><div><h2>Últimas publicações</h2><p>{filtered.length} comunicado(s) disponível(is)</p></div><input aria-label="Pesquisar comunicados" type="search" placeholder="Pesquisar comunicados..." value={query} onChange={e=>setQuery(e.target.value)}/></div>
 {error?<p role="alert">{error}</p>:loading?<p>Carregando...</p>:filtered.length?<div className="comunicados-grid">{filtered.map(i=><ComunicadoCard key={i.id} item={i}/>)}</div>:<div className="notice-empty">Nenhum comunicado encontrado.</div>}
 </div></section></>;
}
export function ComunicadoImage(){return <Photo className="comunicado-detail-cover"/>;}
