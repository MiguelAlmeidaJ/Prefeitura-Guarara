'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
export type QuickLink={id:string;titulo:string;url:string;novaGuia:boolean;ordem:number};
export type CityPhoto={id:string;titulo:string;arquivo:string;ordem:number};
export function HomeQuickArea({acessos,fotos}:{acessos:QuickLink[];fotos:CityPhoto[]}){
 const [active,setActive]=useState(0);
 useEffect(()=>{if(fotos.length<2)return;const timer=setInterval(()=>setActive(value=>(value+1)%fotos.length),6500);return()=>clearInterval(timer);},[fotos.length]);
 const prev=()=>setActive(i=>(i+fotos.length-1)%fotos.length);
 const next=()=>setActive(i=>(i+1)%fotos.length);
 return <section className="home-quick-section section"><div className="wrap home-quick-layout">
  <div className="city-photos-column">
   <div className="home-quick-heading"><span className="section-kicker">NOSSA CIDADE</span><h2>Guarará em imagens</h2></div>
   <div className="city-carousel" aria-label="Imagens da cidade de Guarará">
    {fotos.length?<>
     {fotos.map((photo,i)=><div key={photo.id} className={'city-slide'+(i===active?' is-active':'')} aria-hidden={i!==active}><img src={'/api/capas-comunicados/'+photo.arquivo} alt={photo.titulo} loading={i===0?'eager':'lazy'}/><div className="city-slide-caption">{photo.titulo}</div></div>)}
     {fotos.length>1&&<><button type="button" className="city-slide-prev" onClick={prev} aria-label="Foto anterior">‹</button><button type="button" className="city-slide-next" onClick={next} aria-label="Próxima foto">›</button><div className="city-slide-dots" aria-label="Selecionar foto">{fotos.map((photo,i)=><button key={photo.id} className={i===active?'active':''} type="button" aria-label={'Mostrar foto '+(i+1)} aria-current={i===active?'true':undefined} onClick={()=>setActive(i)}/>)}</div></>}
    </>:<div className="city-carousel-empty"><span>Guarará, Minas Gerais</span><p>Imagens da cidade em breve.</p></div>}
   </div>
  </div>
  <div className="home-quick-links-column">
   <div className="home-quick-heading"><span className="section-kicker">ACESSO RÁPIDO</span><h2>Como podemos ajudar?</h2></div>
   <div className="home-quick-list">
    {acessos.length?acessos.map(item=><Link className="home-quick-link" key={item.id} href={item.url} target={item.novaGuia?'_blank':undefined} rel={item.novaGuia?'noopener noreferrer':undefined}><span>{item.titulo}</span><span className="home-quick-link-arrow" aria-hidden="true">↗</span></Link>):<div className="home-quick-empty">Os atalhos para os serviços municipais aparecerão aqui após o cadastro.</div>}
   </div>
  </div>
 </div></section>;
}
