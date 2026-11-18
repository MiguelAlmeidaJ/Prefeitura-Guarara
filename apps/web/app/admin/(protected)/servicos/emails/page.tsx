'use client';
import {useEffect,useMemo,useState,type FormEvent,type DragEvent} from 'react';
import Link from 'next/link';

type Email={id:string;nome:string;email:string;grupoId:string;ordem:number};
type Group={id:string;nome:string;ordem:number;emails:Email[]};
type Message={text:string;error:boolean};
async function api<T>(path:string,method='GET',body?:unknown):Promise<T>{
 const response=await fetch('/api/admin-proxy/admin/emails-oficiais'+path,{method,headers:{'Content-Type':'application/json'},cache:'no-store',body:body===undefined?undefined:JSON.stringify(body)});
 if(response.status===401){window.location.assign('/admin/login');throw Error('Sessão expirada');}
 if(!response.ok)throw Error('Erro '+response.status+': '+(await response.text()).slice(0,350));
 return response.json() as Promise<T>;
}
export default function EmailsAdmin(){
 const [groups,setGroups]=useState<Group[]>([]);
 const [user,setUser]=useState<{papel:string}|null>(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState<Message|null>(null);
 const [search,setSearch]=useState('');
 const [formOpen,setFormOpen]=useState(false);
 const [editing,setEditing]=useState<string|null>(null);
 const [nome,setNome]=useState('');
 const [email,setEmail]=useState('');
 const [grupoId,setGrupoId]=useState('');
 const [manager,setManager]=useState(false);
 const [groupName,setGroupName]=useState('');
 const [editingGroup,setEditingGroup]=useState<string|null>(null);
 const [drag,setDrag]=useState<{type:'grupo'|'email';id:string;parent:string|null}|null>(null);
 const [over,setOver]=useState<string|null>(null);
 const canEdit=user?.papel==='ADMINISTRADOR'||user?.papel==='GESTOR';
 async function reload(){setGroups(await api<Group[]>(''));}
 useEffect(()=>{let active=true;(async()=>{try{
  const session=await fetch('/api/admin-session',{cache:'no-store'});
  if(!session.ok){window.location.assign('/admin/login');return;}
  const [actor,list]=await Promise.all([session.json() as Promise<{papel:string}>,api<Group[]>('')]);
  if(active){setUser(actor);setGroups(list);}
 }catch(error){if(active)setMessage({text:String(error),error:true});}finally{if(active)setLoading(false);}})();return()=>{active=false;};},[]);
 const total=groups.reduce((sum,g)=>sum+g.emails.length,0);
 const filtered=useMemo(()=>groups.map(group=>({...group,emails:group.emails.filter(item=>(group.nome+' '+item.nome+' '+item.email).toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR').trim()))})).filter(group=>!search.trim()||group.emails.length>0||group.nome.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))),[groups,search]);
 function newEmail(group=''){setEditing(null);setNome('');setEmail('');setGrupoId(group||groups[0]?.id||'');setFormOpen(true);setMessage(null);}
 function editEmail(item:Email){setEditing(item.id);setNome(item.nome);setEmail(item.email);setGrupoId(item.grupoId);setFormOpen(true);setMessage(null);}
 async function saveEmail(event:FormEvent){event.preventDefault();setBusy(true);setMessage(null);
  try{await api('/emails'+(editing?'/'+editing:''),editing?'PATCH':'POST',{nome,email,grupoId});await reload();setFormOpen(false);setMessage({text:'E-mail salvo com sucesso.',error:false});}
  catch(error){setMessage({text:String(error),error:true});}finally{setBusy(false);}
 }
 async function removeEmail(item:Email){if(!window.confirm('Excluir o e-mail de '+item.nome+'?'))return;setBusy(true);setMessage(null);
  try{await api('/emails/'+item.id,'DELETE');await reload();setMessage({text:'E-mail excluído.',error:false});}
  catch(error){setMessage({text:String(error),error:true});}finally{setBusy(false);}
 }
 function startGroup(){setGroupName('');setEditingGroup(null);setManager(true);}
 async function saveGroup(event:FormEvent){event.preventDefault();setBusy(true);setMessage(null);
  try{await api('/grupos'+(editingGroup?'/'+editingGroup:''),editingGroup?'PATCH':'POST',{nome:groupName});await reload();setGroupName('');setEditingGroup(null);setMessage({text:'Grupo salvo com sucesso.',error:false});}
  catch(error){setMessage({text:String(error),error:true});}finally{setBusy(false);}
 }
 async function removeGroup(group:Group){if(group.emails.length){setMessage({text:'Mova ou exclua os e-mails antes de remover este grupo.',error:true});return;}
  if(!window.confirm('Excluir o grupo "'+group.nome+'"?'))return;
  setBusy(true);setMessage(null);
  try{await api('/grupos/'+group.id,'DELETE');await reload();setMessage({text:'Grupo excluído.',error:false});}
  catch(error){setMessage({text:String(error),error:true});}finally{setBusy(false);}
 }
 async function reorder(target:string,parent:string|null){
  const d=drag;setDrag(null);setOver(null);
  if(!canEdit||busy||search.trim()||!d||d.id===target||d.parent!==parent)return;
  const ids=parent===null?groups.map(g=>g.id):groups.find(g=>g.id===parent)?.emails.map(e=>e.id)||[];
  const from=ids.indexOf(d.id),to=ids.indexOf(target);
  if(from<0||to<0)return;
  ids.splice(from,1);ids.splice(to,0,d.id);
  const previous=groups;
  if(parent===null){setGroups(current=>[...current].sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id)));}
  else{setGroups(current=>current.map(g=>g.id===parent?{...g,emails:[...g.emails].sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id))}:g));}
  setBusy(true);setMessage(null);
  try{await api('/ordenar','PATCH',{grupoId:parent,ids});await reload();setMessage({text:'Ordem atualizada.',error:false});}
  catch(error){setGroups(previous);setMessage({text:String(error),error:true});}finally{setBusy(false);}
 }
 const dragAllowed=Boolean(canEdit&&!busy&&!search.trim());
 function dragStart(event:DragEvent<HTMLElement>,type:'grupo'|'email',id:string,parent:string|null){
  if(!dragAllowed){event.preventDefault();return;}event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',id);setDrag({type,id,parent});
 }
 function dragOver(event:DragEvent<HTMLElement>,target:string,parent:string|null){
  if(drag?.parent===parent&&drag.id!==target){event.preventDefault();setOver(target);}
 }
 return <div className="admin-dashboard official-emails-admin">
  <div className="admin-dashboard-header"><div><span className="admin-kicker">SERVIÇOS MUNICIPAIS</span><h1>E-mails oficiais</h1><p>Gerencie os contatos institucionais por setor e mantenha a lista pública atualizada.</p></div><div className="admin-dashboard-actions"><Link className="admin-button admin-button-outline" target="_blank" href="/serviços/emails">Visualizar página ↗</Link>{canEdit&&<><button className="admin-button admin-button-outline" onClick={startGroup}>Gerir grupos</button><button className="admin-button admin-button-primary" disabled={!groups.length} onClick={()=>newEmail()}>+ Novo e-mail</button></>}</div></div>
  {message&&<div role={message.error?'alert':'status'} className={'admin-alert '+(message.error?'admin-alert-error':'admin-alert-ok')}>{message.text}<button type="button" aria-label="Fechar aviso" onClick={()=>setMessage(null)}>×</button></div>}
  <div className="admin-stats"><div className="admin-stat"><span>E-mails cadastrados</span><strong>{total}</strong><small>Contatos públicos</small></div><div className="admin-stat"><span>Grupos</span><strong>{groups.length}</strong><small>Setores organizados</small></div><div className="admin-stat"><span>Grupos ativos</span><strong>{groups.filter(g=>g.emails.length).length}</strong><small>Com contatos cadastrados</small></div><div className="admin-stat"><span>Resultados</span><strong>{filtered.reduce((sum,g)=>sum+g.emails.length,0)}</strong><small>Conforme a pesquisa</small></div></div>
  {formOpen&&<section className="admin-panel official-emails-editor"><div className="admin-panel-title"><div><span className="admin-step">{editing?'EDITAR CONTATO':'NOVO CONTATO'}</span><h2>{editing?'Editar e-mail':'Cadastrar e-mail oficial'}</h2></div></div><form className="official-emails-form" onSubmit={saveEmail}>
   <div className="admin-two-fields"><div className="admin-field"><label htmlFor="email-name">Nome do setor <b>*</b></label><input id="email-name" required maxLength={160} placeholder="Ex.: Secretaria de Saúde" value={nome} onChange={e=>setNome(e.target.value)}/></div><div className="admin-field"><label htmlFor="email-address">E-mail <b>*</b></label><input id="email-address" type="email" required maxLength={254} placeholder="contato@dominio.gov.br" value={email} onChange={e=>setEmail(e.target.value)}/></div></div>
   <div className="admin-field"><label htmlFor="email-group">Grupo <b>*</b></label><select id="email-group" required value={grupoId} onChange={e=>setGrupoId(e.target.value)}><option value="">Selecione um grupo</option>{groups.map(g=><option key={g.id} value={g.id}>{g.nome}</option>)}</select></div>
   <div className="health-admin-actions"><button type="submit" disabled={busy} className="admin-button admin-button-primary">{busy?'Salvando...':'Salvar e-mail'}</button><button type="button" className="admin-button admin-button-outline" onClick={()=>setFormOpen(false)}>Cancelar</button></div>
  </form></section>}
  <section className="admin-panel"><div className="admin-panel-title"><div><h2>Contatos cadastrados</h2><p>Arraste os itens pela alça para alterar a ordem dentro de cada grupo.</p></div><span className="admin-results">{total} e-mail(s)</span></div>
   <div className="admin-toolbar"><label className="admin-search-filter"><span aria-hidden="true">⌕</span><input aria-label="Buscar e-mails" placeholder="Pesquisar nome, endereço ou grupo..." value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
   {loading?<div className="admin-empty">Carregando contatos...</div>:filtered.length===0?<div className="admin-empty"><h3>Nenhum grupo encontrado</h3><p>Crie um grupo para organizar os e-mails oficiais.</p>{canEdit&&<button className="admin-button admin-button-primary" onClick={startGroup}>+ Criar grupo</button>}</div>:
   <div className="official-emails-admin-groups">{filtered.map(g=><div className={'official-email-admin-group '+(over===g.id?'drag-over':'')} key={g.id}>
    <div className="official-email-admin-group-head" onDragOver={event=>dragOver(event,g.id,null)} onDrop={event=>{event.preventDefault();void reorder(g.id,null);}} onDragLeave={()=>setOver(null)}>
     <span className="health-admin-grip" draggable={dragAllowed} onDragStart={event=>dragStart(event,'grupo',g.id,null)} onDragEnd={()=>{setDrag(null);setOver(null);}} title="Arrastar grupo">⠿</span><strong>{g.nome}</strong><span className="official-admin-count">{g.emails.length} e-mail(s)</span>{canEdit&&<button type="button" className="admin-button admin-button-outline" onClick={()=>newEmail(g.id)}>+ Contato</button>}
    </div>
    {g.emails.length?<div className="official-email-admin-list">{g.emails.map(item=><div key={item.id} className={'official-email-admin-row '+(over===item.id?'drag-over':'')} onDragOver={event=>dragOver(event,item.id,g.id)} onDrop={event=>{event.preventDefault();void reorder(item.id,g.id);}} onDragLeave={()=>setOver(null)}>
     <span className="health-admin-grip" draggable={dragAllowed} onDragStart={event=>dragStart(event,'email',item.id,g.id)} onDragEnd={()=>{setDrag(null);setOver(null);}} title="Arrastar contato">⠿</span><div><strong>{item.nome}</strong><small>{item.email}</small></div>{canEdit&&<div className="admin-row-actions"><button type="button" onClick={()=>editEmail(item)}>Editar</button><button type="button" disabled={busy} className="admin-danger-link" onClick={()=>void removeEmail(item)}>Excluir</button></div>}
    </div>)}</div>:<p className="official-email-admin-empty">Nenhum contato neste grupo.</p>}
   </div>)}</div>}
  </section>
  {manager&&<div className="official-email-modal-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setManager(false);}}><section className="admin-panel official-email-modal" role="dialog" aria-modal="true" aria-label="Gerenciar grupos"><div className="admin-panel-title"><div><h2>Gerenciar grupos</h2><p>Cadastre ou renomeie os setores e departamentos.</p></div><button type="button" className="admin-button admin-button-outline" onClick={()=>setManager(false)}>Fechar</button></div>
   <form className="official-emails-form" onSubmit={saveGroup}><div className="admin-field"><label htmlFor="official-group-name">Nome do grupo</label><input id="official-group-name" autoFocus required minLength={2} maxLength={120} placeholder="Ex.: Administração e Finanças" value={groupName} onChange={e=>setGroupName(e.target.value)}/></div><div className="health-admin-actions"><button type="submit" className="admin-button admin-button-primary" disabled={busy}>{editingGroup?'Salvar alteração':'Criar grupo'}</button>{editingGroup&&<button className="admin-button admin-button-outline" type="button" onClick={()=>{setEditingGroup(null);setGroupName('');}}>Cancelar edição</button>}</div></form>
   <div className="official-email-modal-list">{groups.map(g=><div key={g.id}><div><strong>{g.nome}</strong><small>{g.emails.length} contato(s)</small></div><div className="admin-row-actions"><button type="button" onClick={()=>{setEditingGroup(g.id);setGroupName(g.nome);}}>Editar</button><button type="button" disabled={busy} className="admin-danger-link" onClick={()=>void removeGroup(g)}>Excluir</button></div></div>)}</div>
  </section></div>}
 </div>;
}
