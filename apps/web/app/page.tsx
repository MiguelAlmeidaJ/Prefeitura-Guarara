import Link from 'next/link';
import { sections } from '../lib/navigation';

const featured=['atendimento','transparencia','licitacoes','concursos','municipio','administracao'];
const iconMap:Record<string,string>={atendimento:'↗',transparencia:'◈',licitacoes:'▤',concursos:'♙',municipio:'⌂',administracao:'▦'};
export default function Home(){
 const highlights=featured.map(slug=>sections.find(section=>section.slug===slug)!).filter(Boolean);
 return <>
  <section className="section home-services"><div className="wrap">
   <div className="section-heading"><div><span className="section-kicker">ACESSO RÁPIDO</span><h2>Como podemos ajudar?</h2><p>Encontre informações, documentos e serviços municipais.</p></div><Link className="text-link" href="/atendimento">Ver atendimento <span aria-hidden="true">→</span></Link></div>
   <div className="services-grid">{highlights.map(section=><Link key={section.slug} href={'/'+section.slug} className="service-card"><span className="service-card-icon" aria-hidden="true">{iconMap[section.slug]}</span><strong>{section.title}</strong><p>{section.description}</p><span className="card-arrow" aria-hidden="true">↗</span></Link>)}</div>
  </div></section>
  <section className="section section-light"><div className="wrap">
   <div className="section-heading"><div><span className="section-kicker">INFORMAÇÃO PÚBLICA</span><h2>Explore o portal</h2><p>Conteúdos organizados para facilitar sua navegação.</p></div></div>
   <div className="portal-directory">{sections.filter(section=>!featured.includes(section.slug)).map(section=><Link href={'/'+section.slug} key={section.slug} className="directory-link"><span>{section.title}</span><span aria-hidden="true">→</span></Link>)}</div>
  </div></section>
  <section className="section announcements-section"><div className="wrap">
   <div className="section-heading"><div><span className="section-kicker">FIQUE POR DENTRO</span><h2>Últimos comunicados</h2><p>Acompanhe as publicações da prefeitura.</p></div><Link className="text-link" href="/comunicados">Todos os comunicados <span aria-hidden="true">→</span></Link></div>
   <div className="notice-empty"><span className="notice-icon" aria-hidden="true">▤</span><div><strong>Nenhum comunicado publicado ainda</strong><p>Os comunicados oficiais aparecerão aqui após o cadastro no portal.</p></div></div>
  </div></section>
 </>;
}
