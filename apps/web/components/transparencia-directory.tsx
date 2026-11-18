'use client';
import {useEffect,useState} from 'react';
type Item={id:string;titulo:string;descricao:string|null;url:string;etiqueta:string|null;novaGuia:boolean;ordem:number};
type Group={id:string;nome:string;descricao:string|null;ordem:number;links:Item[]};
type Data={configuracao:{portalUrl:string|null;portalDescricao:string|null}|null;grupos:Group[]};
const Icon=({name}:{name:'building'|'chart'|'link'|'shield'|'arrow'})=><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{name==='building'?<><path d="M3 21h18M5 21V9l7-5 7 5v12M9 11h1m4 0h1m-6 4h1m4 0h1M10 21v-4h4v4"/></>:name==='chart'?<><path d="M4 20V10m5 10V4m5 16v-7m5 7V8M2 21h20"/></>:name==='link'?<><path d="M10 13a5 5 0 0 0 7 .5l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></>:name==='shield'?<><path d="m12 2 8 4v6c0 5-3 8-8 10-5-2-8-5-8-10V6z"/><path d="m9 12 2 2 4-4"/></>:<path d="M4 12h16m-6-6 6 6-6 6"/>}</svg>;
export function TransparenciaDirectory(){
 const [data,setData]=useState<Data>({configuracao:null,grupos:[]});
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 useEffect(()=>{let active=true;fetch('/api/transparencia',{cache:'no-store'}).then(async response=>{if(!response.ok)throw Error('Não foi possível obter os dados da Transparência');return response.json() as Promise<Data>;}).then(value=>{if(active)setData(value);}).catch(e=>{if(active)setError(String(e));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false};},[]);
 const total=data.grupos.reduce((sum,g)=>sum+g.links.length,0);
 return <div className="transparency-public">
  <section className="transparency-public-hero"><div className="wrap"><span className="transparency-public-kicker"><Icon name="shield"/> ACESSO À INFORMAÇÃO</span><h1>Portal da <span>Transparência</span></h1><p>Informações públicas e acesso aos serviços de transparência da Prefeitura Municipal de Guarará, organizados para facilitar a consulta do cidadão.</p><div className="transparency-public-principles"><span>Lei de Acesso à Informação</span><span>Responsabilidade fiscal</span><span>Controle social</span></div></div></section>
  <div className="transparency-public-body"><div className="wrap">
   {data.configuracao?.portalUrl&&<section className="transparency-portal-feature"><div className="transparency-portal-icon"><Icon name="chart"/></div><div><span>ACESSO PRINCIPAL</span><h2>Portal da Transparência Fiscal</h2><p>{data.configuracao.portalDescricao||'Consulte os dados fiscais e financeiros disponíveis no sistema oficial da Prefeitura.'}</p></div><a href={data.configuracao.portalUrl} target="_blank" rel="noopener noreferrer">Acessar portal completo <Icon name="arrow"/></a></section>}
   <div className="transparency-public-overview"><div><span>Seções</span><strong>{data.grupos.length}</strong></div><div><span>Acessos disponíveis</span><strong>{total}</strong></div><div><span>Consulta</span><strong>Gratuita</strong></div></div>
   {error&&<p className="transparency-public-empty" role="alert">{error}</p>}
   {loading?<p className="transparency-public-empty">Carregando informações...</p>:!data.grupos.length?<p className="transparency-public-empty">As informações serão disponibilizadas após o cadastro dos acessos pela Prefeitura.</p>:<div className="transparency-public-sections">{data.grupos.map((group,index)=><section className="transparency-public-section" key={group.id}>
    <div className="transparency-public-section-title"><span className="transparency-public-section-icon"><Icon name={index%3===0?'chart':index%3===1?'building':'shield'}/></span><div><span>TRANSPARÊNCIA MUNICIPAL</span><h2>{group.nome}</h2>{group.descricao&&<p>{group.descricao}</p>}</div><span className="transparency-public-count">{group.links.length} acesso(s)</span></div>
    {group.links.length?<div className="transparency-public-grid">{group.links.map(item=><a key={item.id} className="transparency-public-card" href={item.url} target={item.novaGuia?'_blank':undefined} rel={item.novaGuia?'noopener noreferrer':undefined}><span className="transparency-public-card-icon"><Icon name="link"/></span><div><strong>{item.titulo}</strong><p>{item.descricao||'Consultar informações disponíveis'}</p>{item.etiqueta&&<span className="transparency-public-label">{item.etiqueta}</span>}</div><span className="transparency-public-arrow"><Icon name="arrow"/></span></a>)}</div>:<p className="transparency-public-group-empty">Nenhum link cadastrado nesta seção.</p>}
   </section>)}</div>}
   <div className="transparency-public-law"><Icon name="shield"/><div><strong>Transparência e acesso à informação</strong><p>A divulgação de informações públicas fortalece a participação cidadã e o acompanhamento da gestão municipal. Para solicitações específicas, utilize os canais oficiais de atendimento da Prefeitura.</p></div></div>
  </div></div>
 </div>;
}
