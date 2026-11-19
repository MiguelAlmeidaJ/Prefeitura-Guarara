'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';

export type QuickLink={id:string;titulo:string;url:string;novaGuia:boolean;ordem:number};
export type CityPhoto={id:string;titulo:string;arquivo:string;ordem:number};

export function HomeQuickArea({acessos,fotos}:{acessos:QuickLink[];fotos:CityPhoto[]}){
 const gallery=fotos.slice(0,6);
 const [active,setActive]=useState(0);
 const [paused,setPaused]=useState(false);
 useEffect(()=>{
  if(gallery.length<2||paused)return;
  const timer=window.setInterval(()=>setActive(value=>(value+1)%gallery.length),6000);
  return()=>window.clearInterval(timer);
 },[gallery.length,paused]);
 useEffect(()=>{setActive(i=>gallery.length?Math.min(i,gallery.length-1):0);},[gallery.length]);
 const prev=()=>setActive(i=>(i+gallery.length-1)%gallery.length);
 const next=()=>setActive(i=>(i+1)%gallery.length);

 return <section className="home-quick-section section" aria-labelledby="quick-section-title">
  <div className="wrap home-quick-layout">
   <div className="city-photos-column">
    <div className="home-quick-heading"><span className="section-kicker">DESCUBRA GUARARÁ</span><h2>Um olhar sobre <em>nossa cidade.</em></h2></div>
    <div className="city-carousel" aria-roledescription="carrossel" aria-label="Fotografias da cidade de Guarará" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setPaused(false);}}>
     {gallery.length?<>
      {gallery.map((photo,i)=><div key={photo.id} className={'city-slide'+(i===active?' is-active':'')} aria-hidden={i!==active}><img src={'/api/capas-comunicados/'+photo.arquivo} alt={i===active?photo.titulo:''} loading={i===0?'eager':'lazy'}/></div>)}
      <div className="city-slide-overlay"><div className="city-slide-details"><span className="city-slide-eyebrow">GUARARÁ · MINAS GERAIS</span><p>{gallery[active]?.titulo}</p></div><span className="city-slide-counter">{String(active+1).padStart(2,'0')} <span aria-hidden="true">/</span> {String(gallery.length).padStart(2,'0')}</span></div>
      {gallery.length>1&&<>
       <div className="city-slide-controls"><button type="button" onClick={prev} aria-label="Imagem anterior">←</button><button type="button" onClick={next} aria-label="Próxima imagem">→</button></div>
       <div className="city-slide-progress" aria-label="Selecionar foto">{gallery.map((photo,i)=><button type="button" key={photo.id} className={i===active?'is-active':''} aria-label={'Ver foto '+(i+1)+': '+photo.titulo} aria-current={i===active?'true':undefined} onClick={()=>setActive(i)}/>)}</div>
      </>}
     </>:<div className="city-carousel-empty"><span>Guarará, Minas Gerais</span><p>Em breve, novos registros da nossa cidade.</p></div>}
    </div>
   </div>
   <div className="home-quick-links-column">
    <div className="home-quick-heading"><span className="section-kicker">SERVIÇOS E INFORMAÇÕES</span><h2 id="quick-section-title">O que você <em>procura?</em></h2></div>
    <div className="home-quick-list" aria-label="Atalhos aos serviços municipais">
     {acessos.length?acessos.map((item,i)=><Link className="home-quick-link" key={item.id} href={item.url} target={item.novaGuia?'_blank':undefined} rel={item.novaGuia?'noopener noreferrer':undefined}>
      <span className="home-quick-link-number" aria-hidden="true">{String(i+1).padStart(2,'0')}</span>
      <span className="home-quick-link-label">{item.titulo}</span>
      <span className="home-quick-link-arrow" aria-hidden="true">↗</span>
     </Link>):<div className="home-quick-empty">Os acessos rápidos serão exibidos após o cadastro no painel.</div>}
    </div>
    <div className="home-quick-footer"><span>ACESSO DIRETO AOS SERVIÇOS MUNICIPAIS</span><span className="home-quick-footer-mark" aria-hidden="true"/></div>
   </div>
  </div>
 </section>;
}
