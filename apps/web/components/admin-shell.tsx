'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import {MunicipalLogo} from './municipal-logo';
import {AdminLogout} from './admin-logout';

type Glyph='panel'|'file'|'layers'|'landmark'|'briefcase'|'building'|'settings'|'chevron'|'menu'|'external'|'close';
function Icon({name,size=19}:{name:Glyph;size?:number}){
 const icons:Record<Glyph,React.ReactNode>={
  panel:<><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/></>,
  file:<><path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v6h5M9 13h6M9 17h7"/></>,
  layers:<><path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/></>,
  landmark:<><path d="M3 10h18M5 10v9m5-9v9m4-9v9m5-9v9M2 21h20M12 2l10 6H2l10-6Z"/></>,
  briefcase:<><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18M10 13v2h4v-2"/></>,
  building:<><path d="M4 21V7l8-4 8 4v14M2 21h20M8 10h2m4 0h2m-8 5h2m4 0h2M10 21v-4h4v4"/></>,
  settings:<><circle cx="12" cy="12" r="3"/><path d="m19.2 15.3 1.1 1.9-2.1 2.1-1.9-1.1a7 7 0 0 1-2 .8l-.5 2.2h-3l-.5-2.2a7 7 0 0 1-2-.8l-1.9 1.1-2.1-2.1 1.1-1.9a7 7 0 0 1-.8-2l-2.2-.5v-3l2.2-.5a7 7 0 0 1 .8-2L4.3 5.4l2.1-2.1 1.9 1.1a7 7 0 0 1 2-.8l.5-2.2h3l.5 2.2a7 7 0 0 1 2 .8l1.9-1.1 2.1 2.1-1.1 1.9a7 7 0 0 1 .8 2l2.2.5v3l-2.2.5a7 7 0 0 1-.8 2Z"/></>,
  chevron:<path d="m6 9 6 6 6-6"/>,
  menu:<><path d="M4 7h16M4 12h16M4 17h16"/></>,
  external:<><path d="M14 4h6v6M20 4l-9 9"/><path d="M20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6"/></>,
  close:<path d="M5 5l14 14M19 5 5 19"/>
 };
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>;
}
type Entry={label:string;href:string};
type Group={id:string;label:string;icon:Glyph;href?:string;items:Entry[]};
const groups:Group[]=[
 {id:'conteudo',label:'Conteúdo',icon:'layers',items:[
  {label:'Páginas e conteúdos',href:'/admin'},{label:'Comunicados',href:'/admin/comunicados'},{label:'Categorias de comunicados',href:'/admin/comunicados/categorias'},{label:'Tabelas reutilizáveis',href:'/admin/tabelas'},{label:'Menu do portal',href:'/admin/menu'}]},
 {id:'transparencia',label:'Transparência',icon:'landmark',href:'/admin/transparencia',items:[
  {label:'Visão geral',href:'/admin/transparencia'},{label:'Leis municipais',href:'/admin/transparencia/leis'},{label:'Decretos municipais',href:'/admin/transparencia/decretos'},
  {label:'Portarias municipais',href:'/admin/transparencia/portarias'},{label:'Folha de pagamento',href:'/admin/transparencia/folha-de-pagamento'}]},
 {id:'servicos',label:'Serviços',icon:'briefcase',items:[
  {label:'Protocolo',href:'/admin/servicos/protocolo'},{label:'E-mails oficiais',href:'/admin/servicos/emails'}]},
 {id:'secretarias',label:'Secretarias',icon:'building',items:[
  {label:'Obras',href:'/admin/secretarias/obras'},{label:'Saúde',href:'/admin/secretarias/saude'}]},
 {id:'configuracoes',label:'Configurações',icon:'settings',items:[
  {label:'Identidade visual',href:'/admin/configuracoes/identidade'},{label:'Imagens padronizadas',href:'/admin/configuracoes/imagens-padronizadas'}]}
];
function belongs(path:string,href:string){return path===href||(href!=='/admin'&&path.startsWith(href+'/'));}
export function AdminShell({children,user}:{children:React.ReactNode;user:{nome:string;papel:string}}){
 const pathname=usePathname();
 const [collapsed,setCollapsed]=useState(false);
 const [mobile,setMobile]=useState(false);
 const [expanded,setExpanded]=useState<string[]>([]);
 useEffect(()=>{
  try{setCollapsed(localStorage.getItem('guarara-sidebar-collapsed')==='1');}catch{}
 },[]);
 useEffect(()=>{
  const active=groups.find(g=>g.items.some(e=>belongs(pathname,e.href)));
  if(active)setExpanded(current=>current.includes(active.id)?current:[...current,active.id]);
  setMobile(false);
 },[pathname]);
 useEffect(()=>{
  function escape(e:KeyboardEvent){if(e.key==='Escape')setMobile(false);}
  document.addEventListener('keydown',escape);
  return()=>document.removeEventListener('keydown',escape);
 },[]);
 function collapse(){
  setCollapsed(v=>{try{localStorage.setItem('guarara-sidebar-collapsed',v?'0':'1');}catch{}return !v;});
 }
 function toggle(id:string){
  if(collapsed){setCollapsed(false);try{localStorage.setItem('guarara-sidebar-collapsed','0');}catch{}setExpanded(current=>current.includes(id)?current:[...current,id]);return;}
  setExpanded(current=>current.includes(id)?current.filter(v=>v!==id):[...current,id]);
 }
 return <div className={'admin-shell admin-shell-modern'+(collapsed?' sidebar-is-collapsed':'')+(mobile?' sidebar-mobile-open':'')}>
  {mobile&&<button className="admin-sidebar-backdrop" aria-label="Fechar menu administrativo" onClick={()=>setMobile(false)}/>}
  <aside className="admin-sidebar admin-sidebar-modern" aria-label="Barra de navegação">
   <div className="admin-sidebar-top">
    <Link href="/admin" className="admin-sidebar-brand-modern" aria-label="Guarará — painel administrativo"><MunicipalLogo className="admin-brand-logo"/></Link>
    <button type="button" className="admin-sidebar-collapse" aria-label={collapsed?'Expandir menu lateral':'Recolher menu lateral'} title={collapsed?'Expandir menu':'Recolher menu'} onClick={collapse}><Icon name={collapsed?'menu':'chevron'}/></button>
    <button className="admin-sidebar-close-mobile" aria-label="Fechar menu" onClick={()=>setMobile(false)}><Icon name="close"/></button>
   </div>
   <div className="admin-sidebar-scroll">
    <div className="admin-sidebar-caption">NAVEGAÇÃO</div>
    <nav className="admin-nav-modern" aria-label="Navegação administrativa">
     {groups.map(group=>{
      const isOpen=expanded.includes(group.id);
      const groupActive=group.items.some(i=>belongs(pathname,i.href));
      return <div key={group.id} className={'admin-nav-section'+(groupActive?' is-active':'')}>
       <button className="admin-nav-group" type="button" onClick={()=>toggle(group.id)} aria-expanded={!collapsed&&isOpen} aria-label={group.label} title={collapsed?group.label:undefined}>
        <span className="admin-nav-group-icon"><Icon name={group.icon}/></span><span className="admin-nav-group-label">{group.label}</span><span className="admin-nav-group-caret"><Icon name="chevron" size={15}/></span>
       </button>
       {!collapsed&&isOpen&&<div className="admin-nav-children">{group.items.map(link=><Link key={link.href} href={link.href} className={'admin-nav-child'+(pathname===link.href?' is-current':'')} aria-current={pathname===link.href?'page':undefined} onClick={()=>setMobile(false)}>{link.label}</Link>)}</div>}
      </div>;
     })}
    </nav>
    <div className="admin-nav-divider"/>
    <Link href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-site" title="Visualizar portal"><Icon name="external"/><span>Visualizar portal</span></Link>
   </div>
   <div className="admin-sidebar-profile" title={user.nome}><span className="admin-sidebar-profile-avatar">{user.nome.charAt(0).toLocaleUpperCase('pt-BR')}</span><span className="admin-sidebar-profile-copy"><strong>{user.nome}</strong><small>{user.papel.toLowerCase().replaceAll('_',' ')}</small></span></div>
  </aside>
  <div className="admin-workspace">
   <header className="admin-workspace-header admin-workspace-header-modern">
    <div className="admin-workspace-left"><button className="admin-sidebar-open-mobile" type="button" aria-label="Abrir menu administrativo" onClick={()=>setMobile(true)}><Icon name="menu"/></button><span className="admin-breadcrumb-muted">Administração</span><span className="admin-breadcrumb-divider">/</span><strong>{groups.find(g=>g.items.some(i=>belongs(pathname,i.href)))?.label||'Painel'}</strong></div>
    <div className="admin-workspace-header-right"><span className="admin-online-dot"/><span className="admin-online-label">Painel administrativo</span><AdminLogout/></div>
   </header>
   <main id="conteudo" className="admin-content">{children}</main>
  </div>
 </div>;
}
