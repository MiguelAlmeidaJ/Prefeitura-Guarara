import Link from 'next/link';
import { HeaderSearch } from './header-search';
import { sections } from '../lib/navigation';
import { PublicMenu, type MenuEntry } from './public-menu';
import {readSiteIdentity} from '../lib/site-identity';

const navigation = sections.slice(0,6);
async function getNavigation():Promise<MenuEntry[]>{
 try{
  const api=process.env.API_URL||'http://127.0.0.1:3007';
  const response=await fetch(api+'/api/menu',{cache:'no-store'});
  if(!response.ok){console.error('[menu público] API retornou HTTP',response.status);return [];}
  const data=await response.json() as MenuEntry[];
  return Array.isArray(data)?data:[];
 }catch(error){console.error('[menu público] Não foi possível buscar o menu:',error);return [];}
}
export async function SiteHeader(){
 const [menu,identity]=await Promise.all([getNavigation(),readSiteIdentity()]);
 return <header className="site-header">
  <div className="site-utility"><div className="wrap utility-content">
   <span>Portal oficial • Guarará, Minas Gerais</span>
   <div><Link href="/transparencia">Transparência</Link><Link href="/atendimento">Fale com a prefeitura</Link></div>
  </div></div>
  <div className="site-topbar"><div className="wrap topbar-content">
   <Link className="site-brand" href="/" aria-label="Prefeitura de Guarará — início">
    {identity.logo?<span className="brand-uploaded"><img src="/api/identidade/logo" alt="Brasão ou logotipo oficial da Prefeitura de Guarará"/></span>:<span className="brand-symbol" aria-hidden="true"><svg viewBox="0 0 56 56" width="39" height="39" fill="none"><path d="M28 5 47 14v16c0 12-8 19-19 23C17 49 9 42 9 30V14L28 5Z" stroke="currentColor" strokeWidth="2.4"/><path d="M17 33 25 25l6 5 9-12M18 40h20" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round"/></svg></span>}
    <span className="brand-text"><span>PREFEITURA MUNICIPAL DE</span><strong>GUARARÁ <em>MG</em></strong></span>
   </Link>
   <div className="topbar-search"><HeaderSearch/></div>
   <Link className="topbar-service" href="/atendimento">Atendimento <span aria-hidden="true">↗</span></Link>
  </div></div>
  <nav className="site-nav" aria-label="Navegação principal"><div className="wrap site-nav-items">
   {menu.length?<PublicMenu items={menu}/>:navigation.map(item=><Link key={item.slug} href={'/'+item.slug}>{item.title.replace(' Municipal','')}</Link>)}
  </div></nav>
 </header>;
}
