import Link from 'next/link';
import {HeaderSearch} from './header-search';
import {sections} from '../lib/navigation';
import {PublicMenu,type MenuEntry} from './public-menu';
import {MunicipalLogo} from './municipal-logo';
const fallback=sections.slice(0,6);
async function getNavigation():Promise<MenuEntry[]>{
 try{
  const api=process.env.API_URL||'http://127.0.0.1:3007';
  const response=await fetch(api+'/api/menu',{cache:'no-store'});
  if(!response.ok)return [];
  const data=await response.json() as MenuEntry[];
  return Array.isArray(data)?data:[];
 }catch{return [];}
}
export async function SiteHeader(){
 const menu=await getNavigation();
 return <header className="site-header">
  <div className="site-utility"><div className="wrap utility-content">
   <span>Portal oficial <span aria-hidden="true">·</span> Guarará, Minas Gerais</span>
   <div><Link href="/transparencia">Transparência</Link><Link href="/atendimento">Fale com a prefeitura</Link></div>
  </div></div>
  <div className="site-topbar"><div className="wrap topbar-content">
   <Link className="site-brand" href="/" aria-label="Prefeitura de Guarará — página inicial"><MunicipalLogo className="header-logo"/></Link>
   <div className="topbar-search"><HeaderSearch/></div>
   <Link className="topbar-service" href="/atendimento">Atendimento <span aria-hidden="true">↗</span></Link>
  </div></div>
  <nav className="site-nav" aria-label="Navegação principal"><div className="wrap site-nav-items">
   {menu.length?<PublicMenu items={menu}/>:<div className="site-nav-fallback">{fallback.map(item=><Link key={item.slug} href={'/'+item.slug}>{item.title.replace(' Municipal','')}</Link>)}</div>}
  </div></nav>
 </header>;
}
