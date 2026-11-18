'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';

export type MenuEntry={id:string;nome:string;link:string;novaGuia:boolean;ascendenteId:string|null;ordem:number};
type MenuNode=MenuEntry&{children:MenuNode[]};
function nest(items:MenuEntry[]):MenuNode[]{
 const nodes=new Map(items.map(item=>[item.id,{...item,children:[] as MenuNode[]}]));
 const roots:MenuNode[]=[];
 for(const item of items){
  const node=nodes.get(item.id)!;
  if(item.ascendenteId&&nodes.has(item.ascendenteId)&&item.ascendenteId!==item.id)nodes.get(item.ascendenteId)!.children.push(node);
  else roots.push(node);
 }
 const sort=(list:MenuNode[],seen=new Set<string>())=>{
  list.sort((a,b)=>a.ordem-b.ordem||a.nome.localeCompare(b.nome,'pt-BR'));
  for(const node of list){if(seen.has(node.id))continue;seen.add(node.id);sort(node.children,seen);}
 };
 sort(roots);return roots;
}
function Icon({name}:{name:'chevron'|'menu'|'close'|'arrow'}){
 return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{name==='chevron'?<path d="m6 9 6 6 6-6"/>:name==='menu'?<path d="M4 6h16M4 12h16M4 18h16"/>:name==='close'?<path d="M5 5l14 14M19 5 5 19"/>:<path d="M4 12h16m-6-6 6 6-6 6"/>}</svg>;
}
export function PublicMenu({items}:{items:MenuEntry[]}){
 const [open,setOpen]=useState(false);
 const [expanded,setExpanded]=useState<string[]>([]);
 const ref=useRef<HTMLDivElement>(null);
 const pathname=usePathname();
 useEffect(()=>{setOpen(false);setExpanded([]);},[pathname]);
 useEffect(()=>{
  function outside(event:PointerEvent){if(ref.current&&!ref.current.contains(event.target as globalThis.Node)){setOpen(false);setExpanded([]);}}
  function escape(event:KeyboardEvent){if(event.key==='Escape'){setOpen(false);setExpanded([]);}}
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[]);
 const roots=nest(items);
 function toggle(id:string,depth:number){
  setExpanded(current=>current.includes(id)?current.filter(x=>x!==id):depth===0?[id]:[...current,id]);
 }
 function item(item:MenuNode,depth=0):React.ReactNode{
  if(depth>8)return null;
  const hasChildren=item.children.length>0,active=pathname===item.link||item.link!=='/'&&pathname.startsWith(item.link+'/');
  const shown=expanded.includes(item.id);
  return <div className={'public-nav-item '+(hasChildren?'has-children ':'')+(shown?'is-open ':'')+(active?'is-active ':'')+(depth?'is-subitem':'')} key={item.id}>
   <div className="public-nav-item-row">
    <Link className="public-nav-item-link" href={item.link} target={item.novaGuia?'_blank':undefined} rel={item.novaGuia?'noopener noreferrer':undefined} aria-current={active?'page':undefined} onClick={()=>{if(!hasChildren){setOpen(false);setExpanded([]);}}}>{item.nome}</Link>
    {hasChildren&&<button type="button" className="public-nav-expand" aria-label={'Mostrar submenus de '+item.nome} aria-expanded={shown} onClick={()=>toggle(item.id,depth)}><Icon name="chevron"/></button>}
   </div>
   {hasChildren&&<div className="public-nav-panel" hidden={!shown}><div className="public-nav-panel-inner">{depth===0&&<div className="public-nav-panel-caption">EXPLORE {item.nome.toLocaleUpperCase('pt-BR')}</div>}{item.children.map(child=>itemRender(child,depth+1))}</div></div>}
  </div>;
 }
 // Named helper avoids colliding with loop-local identifiers.
 function itemRender(node:MenuNode,depth:number):React.ReactNode{return item(node,depth);}
 return <div className="public-nav-root" ref={ref}>
  <button className="public-nav-mobile-toggle" type="button" aria-label={open?'Fechar navegação':'Abrir navegação'} aria-expanded={open} onClick={()=>setOpen(o=>!o)}><Icon name={open?'close':'menu'}/><span>Menu</span></button>
  <div className={'public-nav-menu '+(open?'is-mobile-open':'')} id="menu-principal">{roots.map(root=>item(root))}</div>
 </div>;
}
