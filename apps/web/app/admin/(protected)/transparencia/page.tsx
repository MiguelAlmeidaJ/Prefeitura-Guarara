'use client';
import {DocumentUpload} from '../../../../components/document-upload';
import {useEffect,useMemo,useState,type FormEvent,type DragEvent} from 'react';
import Link from 'next/link';

type LinkItem={id:string;titulo:string;descricao:string|null;url:string;etiqueta:string|null;novaGuia:boolean;grupoId:string;ordem:number};
type Group={id:string;nome:string;descricao:string|null;ordem:number;links:LinkItem[]};
type Config={portalUrl:string|null;portalDescricao:string|null};
type Data={configuracao:Config|null;grupos:Group[]};
type Draft={titulo:string;descricao:string;url:string;etiqueta:string;novaGuia:boolean;grupoId:string};
type Message={text:string;error:boolean};
const blank=(grupoId=''):Draft=>({titulo:'',descricao:'',url:'',etiqueta:'',novaGuia:true,grupoId});
async function request<T>(path:string,method='GET',body?:unknown):Promise<T>{
 const response=await fetch('/api/admin-proxy/admin/transparencia'+path,{method,headers:{'Content-Type':'application/json'},cache:'no-store',body:body===undefined?undefined:JSON.stringify(body)});
 if(response.status===401){window.location.assign('/admin/login');throw Error('Sessão expirada');}
 if(!response.ok)throw Error('Erro '+response.status+': '+(await response.text()).slice(0,400));
 return response.json() as Promise<T>;
}
export default function TransparenciaAdmin(){
 const [data,setData]=useState<Data>({configuracao:null,grupos:[]});
 const [user,setUser]=useState<{papel:string}|null>(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState<Message|null>(null);
 const [search,setSearch]=useState('');
 const [formOpen,setFormOpen]=useState(false);
 const [draft,setDraft]=useState<Draft>(blank);
 const [editing,setEditing]=useState<string|null>(null);
 const [groupsModal,setGroupsModal]=useState(false);
 const [groupName,setGroupName]=useState('');
 const [groupDescription,setGroupDescription]=useState('');
 const [groupEditing,setGroupEditing]=useState<string|null>(null);
 const [configOpen,setConfigOpen]=useState(false);
 const [portalUrl,setPortalUrl]=useState('');
 const [portalDescription,setPortalDescription]=useState('');
 const [drag,setDrag]=useState<{id:string;group:string|null}|null>(null);
 const [over,setOver]=useState<string|null>(null);
 const canManage=user?.papel==='ADMINISTRADOR'||user?.papel==='GESTOR';
 const total=data.grupos.reduce((sum,g)=>sum+g.links.length,0);
 async function reload(){
  const next=await request<Data>('');
  setData(next);setPortalUrl(next.configuracao?.portalUrl||'');setPortalDescription(next.configuracao?.portalDescricao||'');
 }
 useEffect(()=>{let active=true;(async()=>{try{
  const response=await fetch('/api/admin-session',{cache:'no-store'});
  if(!response.ok){window.location.assign('/admin/login');return;}
  const [actor,result]=await Promise.all([response.json() as Promise<{papel:string}>,request<Data>('')]);
  if(active){setUser(actor);setData(result);setPortalUrl(result.configuracao?.portalUrl||'');setPortalDescription(result.configuracao?.portalDescricao||'');}
 }catch(e){if(active)setMessage({text:String(e),error:true});}finally{if(active)setLoading(false);}})();return()=>{active=false;};},[]);
 const filtered=useMemo(()=>data.grupos.map(g=>({...g,links:g.links.filter(l=>(g.nome+' '+l.titulo+' '+(l.descricao||'')+' '+l.url).toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR')))})).filter(g=>!search.trim()||g.links.length>0||g.nome.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))),[data.grupos,search]);
 function newLink(group=''){setDraft(blank(group||data.grupos[0]?.id||''));setEditing(null);setFormOpen(true);setMessage(null);window.scrollTo({top:0,behavior:'smooth'});}
 function editLink(item:LinkItem){setDraft({titulo:item.titulo,descricao:item.descricao||'',url:item.url,etiqueta:item.etiqueta||'',novaGuia:item.novaGuia,grupoId:item.grupoId});setEditing(item.id);setFormOpen(true);setMessage(null);window.scrollTo({top:0,behavior:'smooth'});}
 async function saveLink(event:FormEvent){event.preventDefault();setBusy(true);setMessage(null);
  try{await request('/links'+(editing?'/'+editing:''),editing?'PATCH':'POST',{...draft,descricao:draft.descricao.trim()||null,etiqueta:draft.etiqueta.trim()||null});await reload();setFormOpen(false);setMessage({text:'Link salvo com sucesso.',error:false});}
  catch(e){setMessage({text:String(e),error:true});}finally{setBusy(false);}
 }
 async function deleteLink(item:LinkItem){if(!window.confirm('Excluir "'+item.titulo+'"?'))return;setBusy(true);setMessage(null);
  try{await request('/links/'+item.id,'DELETE');await reload();setMessage({text:'Link excluído.',error:false});}
  catch(e){setMessage({text:String(e),error:true});}finally{setBusy(false);}
 }
 function openGroups(){setGroupsModal(true);setGroupName('');setGroupDescription('');setGroupEditing(null);}
 async function saveGroup(event:FormEvent){event.preventDefault();setBusy(true);setMessage(null);
  try{await request('/grupos'+(groupEditing?'/'+groupEditing:''),groupEditing?'PATCH':'POST',{nome:groupName,descricao:groupDescription||null});await reload();setGroupName('');setGroupDescription('');setGroupEditing(null);setMessage({text:'Grupo salvo com sucesso.',error:false});}
  catch(e){setMessage({text:String(e),error:true});}finally{setBusy(false);}
 }
 async function deleteGroup(group:Group){if(group.links.length){setMessage({text:'Mova ou exclua os links antes de remover o grupo.',error:true});return;}
  if(!window.confirm('Excluir o grupo "'+group.nome+'"?'))return;setBusy(true);setMessage(null);
  try{await request('/grupos/'+group.id,'DELETE');await reload();setMessage({text:'Grupo excluído.',error:false});}
  catch(e){setMessage({text:String(e),error:true});}finally{setBusy(false);}
 }
 async function saveConfig(event:FormEvent){event.preventDefault();setBusy(true);setMessage(null);
  try{await request('/configuracao','PATCH',{portalUrl:portalUrl.trim()||null,portalDescricao:portalDescription.trim()||null});await reload();setConfigOpen(false);setMessage({text:'Configurações salvas.',error:false});}
  catch(e){setMessage({text:String(e),error:true});}finally{setBusy(false);}
 }
 async function reorder(target:string,parent:string|null){
  const dragging=drag;setDrag(null);setOver(null);
  if(!dragging||dragging.group!==parent||dragging.id===target||busy||search.trim()||!canManage)return;
  const ids=parent===null?data.grupos.map(g=>g.id):data.grupos.find(g=>g.id===parent)?.links.map(l=>l.id)||[];
  const from=ids.indexOf(dragging.id),to=ids.indexOf(target);if(from<0||to<0)return;
  ids.splice(from,1);ids.splice(to,0,dragging.id);
  const before=data;
  if(parent===null)setData(current=>({...current,grupos:[...current.grupos].sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id))}));
  else setData(current=>({...current,grupos:current.grupos.map(g=>g.id===parent?{...g,links:[...g.links].sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id))}:g)}));
  setBusy(true);setMessage(null);
  try{await request('/ordenar','PATCH',{grupoId:parent,ids});await reload();setMessage({text:'Ordem atualizada.',error:false});}
  catch(e){setData(before);setMessage({text:String(e),error:true});}finally{setBusy(false);}
 }
 function startDrag(e:DragEvent<HTMLElement>,id:string,parent:string|null){
  if(!canManage||busy||search.trim()){e.preventDefault();return;}e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',id);setDrag({id,group:parent});
 }
 function acceptDrag(e:DragEvent<HTMLElement>,id:string,parent:string|null){if(drag?.group===parent&&drag.id!==id){e.preventDefault();setOver(id);}}
 return <div className="admin-dashboard transparency-admin">
  <div className="admin-dashboard-header"><div><span className="admin-kicker">ACESSO À INFORMAÇÃO</span><h1>Transparência</h1><p>Gerencie os links e as seções do Portal da Transparência.</p></div><div className="admin-dashboard-actions"><Link href="/transparencia" target="_blank" className="admin-button admin-button-outline">Ver portal ↗</Link>{canManage&&<><button type="button" className="admin-button admin-button-outline" onClick={()=>setConfigOpen(true)}>Portal fiscal</button><button type="button" className="admin-button admin-button-outline" onClick={openGroups}>Gerir seções</button><button className="admin-button admin-button-primary" disabled={!data.grupos.length} onClick={()=>newLink()}>+ Novo link</button></>}</div></div>
  {message&&<div role={message.error?'alert':'status'} className={'admin-alert '+(message.error?'admin-alert-error':'admin-alert-ok')}>{message.text}<button type="button" aria-label="Fechar aviso" onClick={()=>setMessage(null)}>×</button></div>}
  <div className="admin-stats"><div className="admin-stat"><span>Links cadastrados</span><strong>{total}</strong><small>Atalhos publicados</small></div><div className="admin-stat"><span>Seções</span><strong>{data.grupos.length}</strong><small>Grupos de assunto</small></div><div className="admin-stat"><span>Links externos</span><strong>{data.grupos.reduce((n,g)=>n+g.links.filter(l=>l.url.startsWith('http')).length,0)}</strong><small>Portais integrados</small></div><div className="admin-stat"><span>Portal fiscal</span><strong className="transparency-stat-text">{data.configuracao?.portalUrl?'Configurado':'Pendente'}</strong><small>Atalho principal</small></div></div>
  {formOpen&&<section className="admin-panel transparency-edit-panel"><div className="admin-panel-title"><div><span className="admin-step">{editing?'EDITAR LINK':'NOVO LINK'}</span><h2>{editing?'Editar acesso':'Cadastrar acesso'}</h2><p>Personalize o cartão que será exibido na página pública.</p></div></div><form className="transparency-admin-form" onSubmit={saveLink}>
   <div className="admin-two-fields"><div className="admin-field"><label htmlFor="trans-title">Nome do link <b>*</b></label><input id="trans-title" maxLength={160} required placeholder="Ex.: Receitas" value={draft.titulo} onChange={e=>setDraft(p=>({...p,titulo:e.target.value}))}/></div><div className="admin-field"><label htmlFor="trans-group">Seção <b>*</b></label><select id="trans-group" value={draft.grupoId} required onChange={e=>setDraft(p=>({...p,grupoId:e.target.value}))}><option value="">Selecione a seção</option>{data.grupos.map(g=><option key={g.id} value={g.id}>{g.nome}</option>)}</select></div></div>
   <div className="admin-field"><label htmlFor="trans-description">Descrição</label><textarea id="trans-description" rows={3} maxLength={1000} placeholder="Breve explicação sobre o acesso..." value={draft.descricao} onChange={e=>setDraft(p=>({...p,descricao:e.target.value}))}/></div>
   <div className="admin-two-fields"><div className="admin-field"><label htmlFor="trans-url">Link <b>*</b></label><input id="trans-url" required maxLength={2048} placeholder="/secretarias/obras ou https://..." value={draft.url} onChange={e=>setDraft(p=>({...p,url:e.target.value}))}/><DocumentUpload value={draft.url} onChange={v=>setDraft(p=>({...p,url:v}))}/></div><div className="admin-field"><label htmlFor="trans-label">Etiqueta (opcional)</label><input id="trans-label" maxLength={50} placeholder="Ex.: Acesso direto" value={draft.etiqueta} onChange={e=>setDraft(p=>({...p,etiqueta:e.target.value}))}/></div></div>
   <label className="admin-check"><input type="checkbox" checked={draft.novaGuia} onChange={e=>setDraft(p=>({...p,novaGuia:e.target.checked}))}/> Abrir em nova guia</label>
   <div className="health-admin-actions"><button className="admin-button admin-button-primary" disabled={busy}>{busy?'Salvando...':'Salvar link'}</button><button type="button" className="admin-button admin-button-outline" onClick={()=>setFormOpen(false)}>Cancelar</button></div>
  </form></section>}
  <section className="admin-panel"><div className="admin-panel-title"><div><h2>Seções e links</h2><p>Arraste os grupos e os links pela alça para ajustar a ordem de apresentação.</p></div><span className="admin-results">{total} link(s)</span></div>
   <div className="admin-toolbar"><label className="admin-search-filter"><span aria-hidden="true">⌕</span><input aria-label="Pesquisar links" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nome, seção ou descrição..."/></label></div>
   {loading?<div className="admin-empty">Carregando transparência...</div>:filtered.length===0?<div className="admin-empty"><h3>Nenhuma seção encontrada</h3><p>Crie uma seção para começar a organizar os acessos.</p>{canManage&&<button className="admin-button admin-button-primary" onClick={openGroups}>+ Criar seção</button>}</div>:
   <div className="transparency-admin-groups">{filtered.map(g=><section className={'transparency-admin-group '+(over===g.id?'is-over':'')} key={g.id}><div className="transparency-admin-group-header" onDragOver={e=>acceptDrag(e,g.id,null)} onDrop={e=>{e.preventDefault();void reorder(g.id,null);}} onDragLeave={()=>setOver(null)}>
    <span className="health-admin-grip" draggable={Boolean(canManage&&!busy&&!search.trim())} onDragStart={e=>startDrag(e,g.id,null)} onDragEnd={()=>{setDrag(null);setOver(null);}} title="Arrastar seção">⠿</span><div><strong>{g.nome}</strong><small>{g.descricao||'Seção da Transparência'}</small></div><span className="admin-results">{g.links.length} link(s)</span>{canManage&&<button type="button" className="admin-button admin-button-outline" onClick={()=>newLink(g.id)}>+ Link</button>}
   </div><div className="transparency-admin-links">{g.links.length?g.links.map(item=><div key={item.id} className={'transparency-admin-link '+(over===item.id?'is-over':'')} onDragOver={e=>acceptDrag(e,item.id,g.id)} onDrop={e=>{e.preventDefault();void reorder(item.id,g.id);}} onDragLeave={()=>setOver(null)}>
    <span className="health-admin-grip" draggable={Boolean(canManage&&!busy&&!search.trim())} onDragStart={e=>startDrag(e,item.id,g.id)} onDragEnd={()=>{setDrag(null);setOver(null);}} title="Arrastar link">⠿</span><div><strong>{item.titulo}</strong><small>{item.descricao||item.url}</small></div>{item.etiqueta&&<span className="transparency-admin-tag">{item.etiqueta}</span>}<div className="admin-row-actions"><a href={item.url} target="_blank" rel="noopener noreferrer">Abrir ↗</a>{canManage&&<><button type="button" onClick={()=>editLink(item)}>Editar</button><button type="button" disabled={busy} className="admin-danger-link" onClick={()=>void deleteLink(item)}>Excluir</button></>}</div>
   </div>):<p className="transparency-admin-empty">Nenhum link nesta seção.</p>}</div></section>)}</div>}
  </section>
  {groupsModal&&<div className="transparency-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setGroupsModal(false);}}><section className="admin-panel transparency-modal" role="dialog" aria-modal="true" aria-label="Gerenciar seções"><div className="admin-panel-title"><div><h2>Gerenciar seções</h2><p>Crie, edite ou exclua agrupamentos de conteúdo.</p></div><button className="admin-button admin-button-outline" onClick={()=>setGroupsModal(false)}>Fechar</button></div>
   <form className="transparency-admin-form" onSubmit={saveGroup}><div className="admin-field"><label htmlFor="trans-group-name">Nome da seção <b>*</b></label><input id="trans-group-name" autoFocus required maxLength={120} value={groupName} onChange={e=>setGroupName(e.target.value)} placeholder="Ex.: Finanças Públicas"/></div><div className="admin-field"><label htmlFor="trans-group-desc">Descrição (opcional)</label><input id="trans-group-desc" maxLength={400} value={groupDescription} onChange={e=>setGroupDescription(e.target.value)} placeholder="Resumo da seção"/></div><div className="health-admin-actions"><button className="admin-button admin-button-primary" disabled={busy}>{groupEditing?'Salvar alteração':'Criar seção'}</button>{groupEditing&&<button type="button" className="admin-button admin-button-outline" onClick={()=>{setGroupEditing(null);setGroupName('');setGroupDescription('');}}>Cancelar edição</button>}</div></form>
   <div className="transparency-modal-list">{data.grupos.map(g=><div key={g.id}><div><strong>{g.nome}</strong><small>{g.links.length} link(s)</small></div><div className="admin-row-actions"><button type="button" onClick={()=>{setGroupEditing(g.id);setGroupName(g.nome);setGroupDescription(g.descricao||'');}}>Editar</button><button type="button" className="admin-danger-link" disabled={busy} onClick={()=>void deleteGroup(g)}>Excluir</button></div></div>)}</div>
  </section></div>}
  {configOpen&&<div className="transparency-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setConfigOpen(false);}}><section className="admin-panel transparency-modal" role="dialog" aria-modal="true" aria-label="Configurar portal fiscal"><div className="admin-panel-title"><div><h2>Portal da Transparência Fiscal</h2><p>Configure o link principal de acesso ao sistema fiscal oficial.</p></div><button className="admin-button admin-button-outline" onClick={()=>setConfigOpen(false)}>Fechar</button></div><form className="transparency-admin-form" onSubmit={saveConfig}><div className="admin-field"><label htmlFor="trans-portal-url">URL do portal</label><input id="trans-portal-url" maxLength={2048} value={portalUrl} onChange={e=>setPortalUrl(e.target.value)} placeholder="https://portal-oficial.gov.br"/></div><div className="admin-field"><label htmlFor="trans-portal-description">Descrição</label><textarea id="trans-portal-description" rows={3} maxLength={1500} value={portalDescription} onChange={e=>setPortalDescription(e.target.value)} placeholder="Informações sobre receitas, despesas e contratações..."/></div><button className="admin-button admin-button-primary" disabled={busy}>Salvar configurações</button></form></section></div>}
 </div>;
}
