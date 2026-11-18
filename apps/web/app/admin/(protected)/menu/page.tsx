'use client';
import {useEffect,useMemo,useState,type FormEvent,type DragEvent} from 'react';

type MenuItem={id:string;nome:string;link:string;novaGuia:boolean;ascendenteId:string|null;ordem:number};
type Form={nome:string;link:string;novaGuia:boolean;ascendenteId:string|null};
type Notice={text:string;error:boolean};
const blank=():Form=>({nome:'',link:'',novaGuia:false,ascendenteId:null});
async function request<T>(path:string,method='GET',body?:unknown):Promise<T>{
 const res=await fetch('/api/admin-proxy/'+path,{method,headers:{'Content-Type':'application/json'},cache:'no-store',body:body===undefined?undefined:JSON.stringify(body)});
 if(res.status===401){window.location.assign('/admin/login');throw Error('Sessão expirada');}
 if(!res.ok)throw Error('Erro '+res.status+': '+(await res.text()).slice(0,350));
 return res.json() as Promise<T>;
}
function ordered(items:MenuItem[]){return [...items].sort((a,b)=>a.ordem-b.ordem||a.nome.localeCompare(b.nome,'pt-BR'));}
export default function MenuAdmin(){
 const [items,setItems]=useState<MenuItem[]>([]);
 const [user,setUser]=useState<{papel:string}|null>(null);
 const [form,setForm]=useState<Form>(blank);
 const [editing,setEditing]=useState<string|null>(null);
 const [editorOpen,setEditorOpen]=useState(false);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState<Notice|null>(null);
 const [dragId,setDragId]=useState<string|null>(null);
 const [dragOver,setDragOver]=useState<string|null>(null);
 const [expanded,setExpanded]=useState<string[]>([]);
 const canManage=user?.papel==='ADMINISTRADOR'||user?.papel==='GESTOR';
 const children=useMemo(()=>{
  const groups=new Map<string,MenuItem[]>();
  for(const item of items){const key=item.ascendenteId||'root';groups.set(key,[...(groups.get(key)||[]),item]);}
  for(const [key,group] of groups)groups.set(key,ordered(group));
  return groups;
 },[items]);
 useEffect(()=>{let active=true;(async()=>{
  try{
   const session=await fetch('/api/admin-session',{cache:'no-store'});
   if(!session.ok){window.location.assign('/admin/login');return;}
   const [u,records]=await Promise.all([session.json() as Promise<{papel:string}>,request<MenuItem[]>('admin/menu')]);
   if(active){setUser(u);setItems(records);setExpanded(records.filter(x=>x.ascendenteId===null).map(x=>x.id));}
  }catch(err){if(active)setNotice({text:String(err),error:true});}
  finally{if(active)setLoading(false);}
 })();return()=>{active=false};},[]);
 async function reload(){setItems(await request<MenuItem[]>('admin/menu'));}
 function startNew(parent:string|null=null){setEditing(null);setForm({...blank(),ascendenteId:parent});setEditorOpen(true);setNotice(null);if(parent)setExpanded(v=>[...new Set([...v,parent])]);window.scrollTo({top:0,behavior:'smooth'});}
 function edit(item:MenuItem){setEditing(item.id);setForm({nome:item.nome,link:item.link,novaGuia:item.novaGuia,ascendenteId:item.ascendenteId});setEditorOpen(true);setNotice(null);window.scrollTo({top:0,behavior:'smooth'});}
 function descendants(id:string):Set<string>{
  const found=new Set<string>([id]);let size=0;
  while(size!==found.size){size=found.size;for(const item of items)if(item.ascendenteId&&found.has(item.ascendenteId))found.add(item.id);}
  return found;
 }
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setNotice(null);
  try{
   await request('admin/menu'+(editing?'/'+editing:''),editing?'PATCH':'POST',form);
   await reload();setEditorOpen(false);setEditing(null);setForm(blank());setNotice({text:'Item de menu salvo com sucesso.',error:false});
  }catch(err){setNotice({text:String(err),error:true});}finally{setBusy(false);}
 }
 async function remove(item:MenuItem){
  if(children.get(item.id)?.length){setNotice({text:'Remova ou mova os submenus antes de excluir "'+item.nome+'".',error:true});return;}
  if(!window.confirm('Excluir o link "'+item.nome+'"?'))return;
  setBusy(true);setNotice(null);
  try{await request('admin/menu/'+item.id,'DELETE');await reload();setNotice({text:'Link excluído com sucesso.',error:false});}
  catch(err){setNotice({text:String(err),error:true});}finally{setBusy(false);}
 }
 async function move(draggedId:string,targetId:string){
  setDragId(null);setDragOver(null);
  if(!canManage||busy||draggedId===targetId)return;
  const source=items.find(item=>item.id===draggedId);
  const target=items.find(item=>item.id===targetId);
  if(!source||!target||source.ascendenteId!==target.ascendenteId)return;
  const siblings=ordered(items.filter(item=>item.ascendenteId===source.ascendenteId));
  const ids=siblings.map(item=>item.id);
  const previous=[...ids];
  ids.splice(ids.indexOf(draggedId),1);
  ids.splice(ids.indexOf(targetId),0,draggedId);
  if(ids.every((id,index)=>id===previous[index]))return;
  const before=[...items];
  setItems(existing=>existing.map(item=>item.ascendenteId===source.ascendenteId?{...item,ordem:ids.indexOf(item.id)}:item));
  setBusy(true);
  try{await request('admin/menu/ordenar','PATCH',{ascendenteId:source.ascendenteId,ids});setNotice({text:'Ordem atualizada e salva.',error:false});}
  catch(err){setItems(before);setNotice({text:'Não foi possível salvar a nova ordem: '+String(err),error:true});}
  finally{setBusy(false);}
 }
 function row(item:MenuItem,depth:number):React.ReactNode{
  const nested=children.get(item.id)||[];
  const open=expanded.includes(item.id);
  return <div key={item.id} className="menu-tree-node">
   <div className={'menu-admin-row '+(dragOver===item.id?'menu-admin-row-over':'')} style={{marginLeft:Math.min(depth,6)*19}}
    onDragOver={(event:DragEvent<HTMLDivElement>)=>{if(!canManage||busy)return;const current=items.find(x=>x.id===dragId);if(current?.ascendenteId===item.ascendenteId){event.preventDefault();setDragOver(item.id);}}}
    onDrop={event=>{event.preventDefault();if(dragId)void move(dragId,item.id);}}
    onDragLeave={()=>setDragOver(null)}>
    <span draggable={Boolean(canManage&&!busy)} onDragStart={event=>{event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',item.id);setDragId(item.id);}} onDragEnd={()=>{setDragId(null);setDragOver(null);}} className="menu-drag-handle" title="Arraste para ordenar entre itens do mesmo nível" aria-label={'Arrastar '+item.nome}>⠿</span>
    <button type="button" className="menu-fold" onClick={()=>setExpanded(prev=>open?prev.filter(x=>x!==item.id):[...prev,item.id])} disabled={!nested.length} aria-label={open?'Recolher submenu':'Expandir submenu'}>{nested.length?(open?'▾':'▸'):'·'}</button>
    <div className="menu-row-text"><strong>{item.nome}</strong><small>{item.link}</small></div>
    <div className="menu-row-meta">{item.ascendenteId?<span className="menu-level-badge">Submenu</span>:<span className="menu-level-badge menu-root-badge">Principal</span>}{item.novaGuia&&<span className="menu-new-tab">Nova guia ↗</span>}</div>
    {canManage&&<div className="menu-row-actions"><button type="button" onClick={()=>startNew(item.id)} title="Criar submenu">+ Submenu</button><button type="button" onClick={()=>edit(item)}>Editar</button><button type="button" className="admin-danger-link" onClick={()=>void remove(item)} disabled={busy}>Excluir</button></div>}
   </div>
   {open&&nested.map(child=>row(child,depth+1))}
  </div>;
 }
 const roots=children.get('root')||[];
 return <div className="admin-dashboard admin-menu-dashboard">
  <div className="admin-dashboard-header"><div><span className="admin-kicker">ESTRUTURA DO PORTAL</span><h1>Gerenciar menu</h1><p>Crie links e submenus e arraste os itens para definir a ordem da navegação.</p></div>
   {canManage&&<button type="button" className="admin-button admin-button-primary" onClick={()=>startNew()}>+ Novo link</button>}</div>
  {notice&&<div className={'admin-alert '+(notice.error?'admin-alert-error':'admin-alert-ok')} role={notice.error?'alert':'status'}>{notice.text}<button type="button" onClick={()=>setNotice(null)} aria-label="Fechar aviso">×</button></div>}
  <div className="admin-stats"><div className="admin-stat"><span>Itens cadastrados</span><strong>{items.length}</strong><small>Links no menu</small></div><div className="admin-stat"><span>Itens principais</span><strong>{roots.length}</strong><small>Primeiro nível</small></div><div className="admin-stat"><span>Submenus</span><strong>{items.filter(item=>item.ascendenteId).length}</strong><small>Itens subordinados</small></div><div className="admin-stat"><span>Novas guias</span><strong>{items.filter(item=>item.novaGuia).length}</strong><small>Links que abrem outra aba</small></div></div>
  {editorOpen&&<section className="admin-panel menu-editor-panel"><div className="admin-panel-title"><div><span className="admin-step">{editing?'EDITAR LINK':'NOVO LINK'}</span><h2>{editing?'Editar item do menu':'Cadastrar item do menu'}</h2><p>Os submenus são criados escolhendo um item ascendente.</p></div><button type="button" className="menu-editor-close" onClick={()=>setEditorOpen(false)}>Fechar ×</button></div>
   <form onSubmit={save} className="menu-editor-form">
    <div className="admin-two-fields"><div className="admin-field"><label htmlFor="menu-name">Nome <b>*</b></label><input id="menu-name" required maxLength={120} placeholder="Ex.: Transparência" value={form.nome} onChange={e=>setForm(prev=>({...prev,nome:e.target.value}))}/></div>
    <div className="admin-field"><label htmlFor="menu-parent">Ascendente</label><select id="menu-parent" value={form.ascendenteId||''} onChange={e=>setForm(prev=>({...prev,ascendenteId:e.target.value||null}))}><option value="">Nenhum — menu principal</option>{items.filter(item=>!editing||!descendants(editing).has(item.id)).map(item=><option value={item.id} key={item.id}>{item.nome}</option>)}</select></div></div>
    <div className="admin-field"><label htmlFor="menu-link">Link <b>*</b></label><input id="menu-link" required maxLength={2000} placeholder="/transparencia ou https://exemplo.gov.br" value={form.link} onChange={e=>{const link=e.target.value;setForm(prev=>({...prev,link,novaGuia:link.startsWith('http')?true:prev.novaGuia}));}}/><small>Links internos começam com /; externos devem usar https:// ou http://.</small></div>
    <label className="admin-check menu-tab-option"><input type="checkbox" checked={form.novaGuia} onChange={e=>setForm(prev=>({...prev,novaGuia:e.target.checked}))}/> Abrir em nova guia? <span>Recomendado para links externos.</span></label>
    <div className="menu-form-actions"><button className="admin-button admin-button-primary" disabled={busy}>{busy?'Salvando...':editing?'Salvar alterações':'Criar link'}</button><button type="button" className="admin-button admin-button-outline" onClick={()=>setEditorOpen(false)}>Cancelar</button></div>
   </form></section>}
  <section className="admin-panel"><div className="admin-panel-title"><div><h2>Estrutura do menu</h2><p>Arraste o ícone ⠿ para reordenar. A ordenação é salva automaticamente em cada movimento.</p></div><span className="admin-results">{items.length} item(ns)</span></div>
   {loading?<div className="admin-empty">Carregando menu...</div>:items.length===0?<div className="admin-empty"><span aria-hidden="true">☷</span><h3>Menu ainda não configurado</h3><p>Cadastre o primeiro link para começar. Até lá, o portal mantém a navegação padrão.</p>{canManage&&<button className="admin-button admin-button-primary" onClick={()=>startNew()}>+ Criar primeiro link</button>}</div>:
    <div className="menu-tree">{roots.map(item=>row(item,0))}</div>}
  </section>
  <div className="admin-help-card"><div><strong>Como funcionam os submenus?</strong><p>Use o campo Ascendente para vincular itens. Para reordenar, arraste dentro do mesmo nível; para mudar de nível, edite o Ascendente.</p></div><a className="admin-button admin-button-outline" href="/" target="_blank" rel="noopener noreferrer">Visualizar site ↗</a></div>
 </div>;
}
