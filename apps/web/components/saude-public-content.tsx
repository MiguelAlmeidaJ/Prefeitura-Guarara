'use client';
import {useEffect,useMemo,useState} from 'react';

type Type='PAS'|'CONSELHO'|'PORTARIA'|'ESCALA'|'MEDICAMENTO'|'ESTOQUE';
type Entry={id:string;tipo:Type;categoria:string|null;titulo:string;descricao:string|null;ano:number|null;link:string;textoBotao:string|null;linkSecundario:string|null;textoBotaoSecundario:string|null;destaque:boolean;ordem:number};
type Config={nomeSecretario:string|null;telefone:string|null;endereco:string|null;horario:string|null;descricao:string|null};
type Data={configuracao:Config|null;conteudos:Entry[]};
const order=(a:Entry,b:Entry)=>a.ordem-b.ordem||a.titulo.localeCompare(b.titulo,'pt-BR');
function yearNow(){return Number(new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric'}).format(new Date()));}
function yearStatus(year:number|null,current:number){return year===current?'Ano vigente':year===current-1?'Exercício anterior':'Histórico';}
function Symbol({name,size=22}:{name:'activity'|'file'|'calendar'|'users'|'clinic'|'pill'|'box'|'arrow'|'download'|'clock'|'shield'|'phone'|'check',size?:number}){
 const common={fill:'none',stroke:'currentColor',strokeWidth:1.9,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
 const content={
 activity:<><path d="M3 12h4l3-7 4 14 3-7h4"/></>,
 file:<><path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v6h5M9 13h6M9 17h7"/></>,
 calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
 users:<><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1"/></>,
 clinic:<><path d="M4 21V6l8-3 8 3v15M2 21h20M9 21v-6h6v6M9 9h6M12 6v6"/></>,
 pill:<><rect x="3" y="8" width="18" height="9" rx="4.5" transform="rotate(-40 12 12.5)"/><path d="m8 8 8 9"/></>,
 box:<><path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z"/><path d="m3 7 9 5 9-5M12 12v10"/></>,
 arrow:<><path d="M5 12h14m-6-6 6 6-6 6"/></>,
 download:<><path d="M12 3v12m-4-4 4 4 4-4M5 18v3h14v-3"/></>,
 clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
 shield:<><path d="M12 2 20 6v6c0 5-3 8-8 10-5-2-8-5-8-10V6l8-4Z"/><path d="m9 12 2 2 4-4"/></>,
 phone:<><path d="M6 3h4l1 5-3 2a15 15 0 0 0 6 6l2-3 5 1v4c0 2-2 3-4 3A17 17 0 0 1 3 7c0-2 1-4 3-4Z"/></>,
 check:<><path d="m5 12 5 5L20 7"/></>,
 }[name];
 return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...common}>{content}</svg>;
}
function LinkButton({url,label,subtle=false}:{url:string;label:string;subtle?:boolean}){
 return <a className={'health-v2-action '+(subtle?'health-v2-action-subtle':'')} href={url} target="_blank" rel="noopener noreferrer"><Symbol name="download" size={16}/>{label}</a>;
}
function YearCards({items,current,defaultTitle}:{items:Entry[];current:number;defaultTitle:string}){
 if(!items.length)return <div className="health-v2-empty">Nenhum documento cadastrado nesta seção.</div>;
 // O status é sempre calculado pelo ano civil atual, não pela posição manual.
 const sorted=[...items].sort((a,b)=>(b.ano||0)-(a.ano||0)||order(a,b));
 return <div className="health-v2-year-grid">{sorted.map(item=>{
  const status=yearStatus(item.ano,current);const active=status==='Ano vigente';
  return <article key={item.id} className={'health-v2-year-card '+(active?'is-current':'')}>
   <div className="health-v2-year-top"><span className="health-v2-mini-icon"><Symbol name="calendar" size={18}/></span><span className={'health-v2-year-status '+(active?'active':'')}>{status}</span></div>
   <strong className="health-v2-year-number">{item.ano??'—'}</strong>
   <p>{item.tipo==='ESTOQUE'?defaultTitle:item.titulo}</p>
   <LinkButton url={item.link} label={item.tipo==='ESTOQUE'?'Baixar PDF':item.textoBotao||'Baixar PDF'}/>
  </article>;
 })}</div>;
}
function SectionHead({eyebrow,title,description}:{eyebrow:string;title:string;description?:string}){
 return <div className="health-v2-section-head"><div><span>{eyebrow}</span><h2>{title}</h2>{description&&<p>{description}</p>}</div></div>;
}
export function SaudePublicContent(){
 const [data,setData]=useState<Data>({configuracao:null,conteudos:[]});
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const current=yearNow();
 useEffect(()=>{let active=true;fetch('/api/saude',{cache:'no-store'}).then(async response=>{if(!response.ok)throw Error('Não foi possível consultar as informações');return response.json() as Promise<Data>;}).then(value=>{if(active)setData(value);}).catch(e=>{if(active)setError(String(e));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false};},[]);
 const group=useMemo(()=>new Map((['PAS','CONSELHO','PORTARIA','ESCALA','MEDICAMENTO','ESTOQUE'] as Type[]).map(type=>[type,data.conteudos.filter(item=>item.tipo===type).sort(order)] as [Type,Entry[]])),[data.conteudos]);
 const items=(type:Type)=>group.get(type)||[];
 const plans=items('PAS'),stock=items('ESTOQUE'),scales=items('ESCALA'),portarias=items('PORTARIA'),meds=items('MEDICAMENTO'),conselhos=items('CONSELHO');
 const planHighlight=plans.find(x=>x.ano===current)||plans.find(x=>x.destaque)||[...plans].sort((a,b)=>(b.ano||0)-(a.ano||0))[0];
 const councilHighlight=conselhos.find(x=>x.destaque)||conselhos[0];
 return <div className="health-v2">
  <section className="health-v2-hero"><div className="wrap health-v2-hero-inner">
   <div className="health-v2-hero-content"><div className="health-v2-kicker"><span className="health-v2-dot"/> SECRETARIA MUNICIPAL DE SAÚDE</div>
    <h1>Cuidar das pessoas.<span>Informar com transparência.</span></h1>
    <p>{data.configuracao?.descricao||'Consulte planos, documentos, escalas de atendimento e informações sobre os serviços municipais de saúde de Guarará.'}</p>
    <a className="health-v2-hero-link" href="#planos-saude">Explorar informações <Symbol name="arrow" size={18}/></a>
   </div>
   <div className="health-v2-hero-art" aria-hidden="true"><div className="health-v2-art-ring"/><div className="health-v2-art-card"><Symbol name="activity" size={65}/><span>Saúde pública</span><strong>Guarará</strong></div></div>
  </div></section>
  <div className="health-v2-page"><div className="wrap">
   <div className="health-v2-overview">
    <div><span className="health-v2-overview-icon"><Symbol name="calendar"/></span><strong>{plans.length}</strong><small>Planos anuais</small></div>
    <div><span className="health-v2-overview-icon"><Symbol name="clinic"/></span><strong>{scales.length}</strong><small>Escalas de atendimento</small></div>
    <div><span className="health-v2-overview-icon"><Symbol name="file"/></span><strong>{stock.length}</strong><small>Relatórios de estoque</small></div>
    <div><span className="health-v2-overview-icon"><Symbol name="users"/></span><strong>{data.configuracao?.nomeSecretario||'A definir'}</strong><small>Responsável pela secretaria</small></div>
   </div>
   {error&&<div className="health-v2-empty" role="alert">{error}</div>}
   {loading?<div className="health-v2-empty">Carregando informações da Secretaria de Saúde...</div>:<>
    <section id="planos-saude" className="health-v2-section"><SectionHead eyebrow="PLANEJAMENTO E TRANSPARÊNCIA" title="Planos Anuais de Saúde" description="Acesse o plano vigente e os exercícios anteriores."/>
     {planHighlight&&<article className="health-v2-feature"><div className="health-v2-feature-icon"><Symbol name="file" size={28}/></div><div><span className="health-v2-feature-tag">{yearStatus(planHighlight.ano,current).toUpperCase()}</span><h3>{planHighlight.titulo}</h3><p>{planHighlight.descricao||'Consulte o documento e acompanhe as ações de saúde do município.'}</p></div><div className="health-v2-feature-links"><LinkButton url={planHighlight.link} label={planHighlight.textoBotao||'Acessar plano'} />{planHighlight.linkSecundario&&<LinkButton url={planHighlight.linkSecundario} label={planHighlight.textoBotaoSecundario||'Documento complementar'} subtle/>}</div></article>}
     <YearCards items={plans} current={current} defaultTitle="Plano Anual de Saúde"/>
    </section>
    <section className="health-v2-section"><SectionHead eyebrow="PARTICIPAÇÃO E CONTROLE SOCIAL" title="Conselho Municipal de Saúde"/>
     {councilHighlight?<article className="health-v2-council"><span className="health-v2-council-icon"><Symbol name="users" size={27}/></span><div><span className="health-v2-feature-tag">CONTROLE SOCIAL</span><h3>{councilHighlight.titulo}</h3><p>{councilHighlight.descricao}</p></div><div className="health-v2-feature-links"><LinkButton url={councilHighlight.link} label={councilHighlight.textoBotao||'Acessar documento'}/>{councilHighlight.linkSecundario&&<LinkButton url={councilHighlight.linkSecundario} label={councilHighlight.textoBotaoSecundario||'Documento adicional'} subtle/>}</div></article>:<div className="health-v2-empty">Nenhum documento do Conselho cadastrado.</div>}
    </section>
    <section className="health-v2-section"><SectionHead eyebrow="DOCUMENTOS OFICIAIS" title="Portarias e nomeações" description="Publicações e atos administrativos relacionados à saúde municipal."/>
     {portarias.length?<div className="health-v2-portarias">{portarias.map(item=><a key={item.id} className="health-v2-portaria" href={item.link} target="_blank" rel="noopener noreferrer"><span className="health-v2-doc-icon"><Symbol name="file"/></span><div><strong>{item.titulo}</strong><small>{item.descricao||'Consultar documento'}</small></div><Symbol name="arrow" size={16}/></a>)}</div>:<div className="health-v2-empty">Nenhuma portaria cadastrada.</div>}
    </section>
    <section className="health-v2-section"><SectionHead eyebrow="REDE DE ATENDIMENTO" title="Escalas de atendimento" description="Consulte os horários e a organização dos serviços de cada unidade."/>
     {scales.length?<div className="health-v2-service-grid">{scales.map(item=><article key={item.id} className="health-v2-service"><div className="health-v2-service-top"><span className="health-v2-service-icon"><Symbol name="clinic"/></span><span className="health-v2-service-kind">{item.categoria||'ATENDIMENTO'}</span></div><h3>{item.titulo}</h3><p>{item.descricao||'Consulte a escala de atendimento desta unidade.'}</p><a href={item.link} target="_blank" rel="noopener noreferrer"> {item.textoBotao||'Acessar escala'} <Symbol name="arrow" size={16}/></a></article>)}</div>:<div className="health-v2-empty">Nenhuma escala cadastrada.</div>}
    </section>
    <section className="health-v2-section"><SectionHead eyebrow="ASSISTÊNCIA FARMACÊUTICA" title="Medicamentos e farmácia" description="Informações e documentos sobre medicamentos disponíveis e programas de assistência."/>
     {meds.length?<div className="health-v2-med-grid">{meds.map(item=><article key={item.id} className="health-v2-med"><span className="health-v2-med-icon"><Symbol name="pill" size={23}/></span><h3>{item.titulo}</h3><p>{item.descricao||'Consulte as informações disponíveis.'}</p><LinkButton url={item.link} label={item.textoBotao||'Consultar documento'} />{item.linkSecundario&&<LinkButton url={item.linkSecundario} label={item.textoBotaoSecundario||'Documento adicional'} subtle/>}</article>)}</div>:<div className="health-v2-empty">Nenhum documento de medicamentos cadastrado.</div>}
    </section>
    <section className="health-v2-section"><SectionHead eyebrow="CONTROLE DE MEDICAMENTOS" title="Estoque de medicamentos" description="Acompanhe os relatórios anuais de disponibilidade e estoque."/>
     <YearCards items={stock} current={current} defaultTitle="Relatório de estoque"/>
    </section>
    {(data.configuracao?.telefone||data.configuracao?.endereco||data.configuracao?.horario)&&<section className="health-v2-contact"><span className="health-v2-contact-icon"><Symbol name="phone"/></span><div><strong>Informações e atendimento</strong><p>{[data.configuracao?.endereco,data.configuracao?.telefone&&'Telefone: '+data.configuracao.telefone,data.configuracao?.horario].filter(Boolean).join(' · ')}</p></div></section>}
   </>}
  </div></div>
 </div>;
}
