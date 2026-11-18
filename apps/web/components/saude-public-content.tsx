'use client';
import {useEffect,useMemo,useState} from 'react';

type Type='PAS'|'CONSELHO'|'PORTARIA'|'ESCALA'|'MEDICAMENTO'|'ESTOQUE';
type Item={id:string;tipo:Type;titulo:string;descricao:string|null;ano:number|null;link:string;textoBotao:string|null;linkSecundario:string|null;textoBotaoSecundario:string|null;destaque:boolean;ordem:number};
type Config={nomeSecretario:string|null;telefone:string|null;endereco:string|null;horario:string|null;descricao:string|null};
type Data={configuracao:Config|null;conteudos:Item[]};
const sections:[Type,string,string][]=[
 ['PAS','Planos anuais de saúde (PAS)','📋'],
 ['CONSELHO','Conselho Municipal de Saúde (CMS)','🏛️'],
 ['PORTARIA','Portarias de nomeação e composição','📑'],
 ['ESCALA','Escalas de atendimento','🩺'],
 ['MEDICAMENTO','Farmácia municipal e medicamentos','💊'],
 ['ESTOQUE','Estoque de medicamentos','📦'],
];
const byOrder=(a:Item,b:Item)=>a.ordem-b.ordem||(b.ano||0)-(a.ano||0);
function Btn({href,text,secondary=false}:{href:string;text:string;secondary?:boolean}){return <a href={href} target="_blank" rel="noopener noreferrer" className={'health-download '+(secondary?'health-download-alt':'')}>↗ {text}</a>}
export function SaudePublicContent(){
 const [data,setData]=useState<Data>({configuracao:null,conteudos:[]});
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;fetch('/api/saude',{cache:'no-store'}).then(async response=>{if(!response.ok)throw Error('Conteúdo indisponível');return response.json() as Promise<Data>}).then(value=>{if(active)setData(value)}).catch(e=>{if(active)setError(String(e))}).finally(()=>{if(active)setLoading(false)});return()=>{active=false};},[]);
 const grouped=useMemo(()=>new Map(sections.map(([type])=>[type,data.conteudos.filter(item=>item.tipo===type).sort(byOrder)] as [Type,Item[]])),[data.conteudos]);
 const docs=(type:Type)=>grouped.get(type)||[];
 const featured=(type:Type)=>docs(type).find(item=>item.destaque)||docs(type)[0];
 const pas=featured('PAS'),conselho=featured('CONSELHO'),med=featured('MEDICAMENTO');
 const firstYear=docs('PAS').map(x=>x.ano).filter((x):x is number=>x!==null).sort((a,b)=>b-a)[0];
 return <>
  <section className="health-hero"><div className="wrap health-hero-inner"><div><span className="health-hero-eyebrow">SECRETARIA MUNICIPAL DE SAÚDE</span><h1><span className="health-icon">✚</span> Ações da <em>Saúde</em></h1><p>{data.configuracao?.descricao||'Documentos, planos de saúde, escalas de atendimento e informações sobre medicamentos da rede municipal de Guarará.'}</p></div><span className="health-hero-cross" aria-hidden="true">✚</span></div><div className="wrap health-hero-stats"><div><strong>{docs('ESCALA').length}</strong><span>Escalas cadastradas</span></div><div><strong>{firstYear||'—'}</strong><span>Plano anual disponível</span></div><div><strong>{docs('ESTOQUE').length}</strong><span>Relatórios de estoque</span></div><div><strong>{data.configuracao?.nomeSecretario||'—'}</strong><span>Responsável pela secretaria</span></div></div></section>
  <div className="health-body"><div className="wrap">
  {error&&<div className="health-info" role="alert">Não foi possível carregar as informações: {error}</div>}
  {loading?<div className="health-info">Carregando informações da Saúde...</div>:<>
   {pas&&<section className="health-feature health-feature-green"><div className="health-feature-symbol">📋</div><div><span className="health-feature-tag">PLANO ANUAL DE SAÚDE {pas.ano||''}</span><h2>{pas.titulo}</h2><p>{pas.descricao}</p></div><div className="health-feature-actions"><Btn href={pas.link} text={pas.textoBotao||'Acessar plano'} />{pas.linkSecundario&&<Btn secondary href={pas.linkSecundario} text={pas.textoBotaoSecundario||'Documento complementar'}/>}</div></section>}
   <section className="health-section"><div className="health-section-heading"><span>📋 PLANOS ANUAIS DE SAÚDE (PAS)</span><small>Documentos disponíveis</small></div>{docs('PAS').length?<div className="health-years">{docs('PAS').map(item=><article key={item.id} className={'health-year-card '+(item===pas?'is-current':'')}><strong>{item.ano||'PAS'}</strong><small>{item===pas?'PLANO EM DESTAQUE':'DOCUMENTO ARQUIVADO'}</small><Btn href={item.link} text={item.textoBotao||'Acessar PDF'}/></article>)}</div>:<p className="health-empty">Nenhum plano anual publicado.</p>}</section>
   {conselho&&<section className="health-feature health-feature-navy"><div className="health-feature-symbol">🏛️</div><div><span className="health-feature-tag">CONTROLE SOCIAL · SUS</span><h2>{conselho.titulo}</h2><p>{conselho.descricao}</p></div><div className="health-feature-actions"><Btn href={conselho.link} text={conselho.textoBotao||'Acessar documento'}/>{conselho.linkSecundario&&<Btn secondary href={conselho.linkSecundario} text={conselho.textoBotaoSecundario||'Documento adicional'}/>}</div></section>}
   <section className="health-section"><div className="health-section-heading"><span>📑 PORTARIAS DE NOMEAÇÃO E COMPOSIÇÃO</span></div>{docs('PORTARIA').length?<div className="health-documents">{docs('PORTARIA').map(item=><a className="health-document-card" key={item.id} href={item.link} target="_blank" rel="noopener noreferrer"><span>📄</span><div><strong>{item.titulo}</strong><small>{item.descricao||item.ano||'Documento'}</small></div><b>↗</b></a>)}</div>:<p className="health-empty">Nenhuma portaria publicada.</p>}</section>
   <section className="health-section"><div className="health-section-heading"><span>🩺 ESCALAS DE ATENDIMENTO</span><small>Serviços e unidades</small></div>{docs('ESCALA').length?<div className="health-service-grid">{docs('ESCALA').map(item=><article className="health-service-card" key={item.id}><div className="health-service-icon">🏥</div><h3>{item.titulo}</h3><p>{item.descricao||'Consulte a escala de atendimento.'}</p><Btn href={item.link} text={item.textoBotao||'Acessar escala'}/></article>)}</div>:<p className="health-empty">Nenhuma escala cadastrada.</p>}</section>
   <section className="health-section"><div className="health-section-heading"><span>💊 FARMÁCIA MUNICIPAL E MEDICAMENTOS</span></div>{docs('MEDICAMENTO').length?<div className="health-med-grid">{docs('MEDICAMENTO').map(item=><article key={item.id} className={'health-feature '+(item===med?'health-feature-green':'health-feature-navy')}><div className="health-feature-symbol">💊</div><div><span className="health-feature-tag">MEDICAMENTOS</span><h2>{item.titulo}</h2><p>{item.descricao}</p><Btn href={item.link} text={item.textoBotao||'Consultar medicamentos'}/></div></article>)}</div>:<p className="health-empty">Nenhum material de medicamentos publicado.</p>}</section>
   <section className="health-section"><div className="health-section-heading"><span>📦 ESTOQUE DE MEDICAMENTOS</span><small>Histórico de documentos</small></div>{docs('ESTOQUE').length?<div className="health-years">{docs('ESTOQUE').map(item=><article key={item.id} className="health-year-card"><strong>{item.ano||'Estoque'}</strong><small>{item.titulo}</small><Btn href={item.link} text={item.textoBotao||'Baixar relatório'}/></article>)}</div>:<p className="health-empty">Nenhum relatório de estoque publicado.</p>}</section>
   {(data.configuracao?.telefone||data.configuracao?.endereco||data.configuracao?.horario)&&<div className="health-info"><strong>Informações e atendimento</strong><p>{[data.configuracao?.endereco,data.configuracao?.telefone&&'Telefone: '+data.configuracao.telefone,data.configuracao?.horario].filter(Boolean).join(' · ')}</p></div>}
  </>}</div></div>
 </>;
}
