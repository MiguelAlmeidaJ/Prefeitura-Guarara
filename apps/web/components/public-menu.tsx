import Link from 'next/link';

export type MenuEntry={id:string;nome:string;link:string;novaGuia:boolean;ascendenteId:string|null;ordem:number};
type Node=MenuEntry&{children:Node[]};

function nest(items:MenuEntry[]):Node[]{
 const nodes=new Map(items.map(item=>[item.id,{...item,children:[] as Node[]}]));
 const roots:Node[]=[];
 for(const item of items){
  const node=nodes.get(item.id)!;
  if(item.ascendenteId&&nodes.has(item.ascendenteId)&&item.ascendenteId!==item.id)nodes.get(item.ascendenteId)!.children.push(node);
  else roots.push(node);
 }
 const sort=(list:Node[],visited=new Set<string>())=>{
  list.sort((a,b)=>a.ordem-b.ordem||a.nome.localeCompare(b.nome,'pt-BR'));
  for(const node of list){if(visited.has(node.id))continue;visited.add(node.id);sort(node.children,visited);}
 };
 sort(roots);
 return roots;
}
function NavLink({item}:{item:Node}){
 const external=/^https?:\/\//i.test(item.link);
 return <Link href={item.link} target={item.novaGuia?'_blank':undefined} rel={item.novaGuia?'noopener noreferrer':undefined} prefetch={external?false:undefined}>{item.nome}</Link>;
}
function NavItem({item,depth=0}:{item:Node;depth?:number}){
 if(depth>8)return null;
 return item.children.length?<details className={'public-nav-dropdown '+(depth?'is-nested':'')}><summary>{item.nome}<span aria-hidden="true">⌄</span></summary><div className="public-nav-submenu">
   <div className="public-nav-parent"><NavLink item={item}/></div>
   {item.children.map(child=><NavItem item={child} key={child.id} depth={depth+1}/>)}
  </div></details>:<NavLink item={item}/>;
}
export function PublicMenu({items}:{items:MenuEntry[]}){
 return <>{nest(items).map(item=><NavItem key={item.id} item={item}/>)}</>;
}
