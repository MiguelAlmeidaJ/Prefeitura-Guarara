import Link from 'next/link';
import {HomeContact} from '../../components/home-contact';
import {ComunicadosCarousel} from '../../components/comunicados-publicos';
import {HomeQuickArea,type QuickLink,type CityPhoto} from '../../components/home-quick-area';
import {getHomeBanner} from '../../lib/standard-images';

async function homeContent():Promise<{acessos:QuickLink[];fotos:CityPhoto[]}>{try{const response=await fetch((process.env.API_URL||'http://127.0.0.1:3007')+'/api/home/conteudo',{cache:'no-store'});if(response.ok)return await response.json();}catch{}return {acessos:[],fotos:[]};}
export default async function Home(){
 const [banner,content]=await Promise.all([getHomeBanner(),homeContent()]);
 return <>
  {banner&&<section className="home-banner" aria-label="Banner institucional da Prefeitura de Guarará"><div className="home-banner-frame"><img src={'/api/banner-home?v='+banner.version} width={1600} height={600} alt="Banner institucional da Prefeitura Municipal de Guarará" fetchPriority="high"/></div></section>}
  <HomeQuickArea acessos={content.acessos} fotos={content.fotos}/>
  <HomeContact/>
  <section className="section announcements-section"><div className="wrap">
   <div className="section-heading"><div><span className="section-kicker">FIQUE POR DENTRO</span><h2>Últimos comunicados</h2><p>Acompanhe as publicações da prefeitura.</p></div><Link className="text-link" href="/comunicados">Todos os comunicados <span aria-hidden="true">→</span></Link></div>
   <ComunicadosCarousel/>
  </div></section>
 </>;
}
