'use client';
import {useEffect,useMemo,useState,type FormEvent,type DragEvent} from 'react';
import Link from 'next/link';
type Protocolo={id:string;nome:string;link:string;ordem:number};
async function request<T>(path:string,method='GET',body?:unknown):Promise<T>{
 const response=await fetch('/api/admin-proxy/admin/protocolos'+path,{method,cache:'no-store',headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 if(response.status===401){window.location.assign('/admin/login');throw new Error('Sessão expirada');}
 if(!response.ok)throw new Error('Erro '+response.status+': '+(await response.text()).slice(0,350));
 return response.json() as Promise<T>;
}
export default function AdminProtocolo(){
 const [items,setItems]=useState<Protocolo[]>([]);
 const [actor,setActor]=useState<{papel:string}|null>(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState<{text:string;error:boolean}|null>(null);
 const [editing,setEditing]=useState<string|null>(null);
 const [formOpen,setFormOpen]=useState(false);
 const [nome,setNome]=useState('');
 const [link,setLink]=useState('');
 const [search,setSearch]=useState('');
 const [dragId,setDragId]=useState<string|null>(null);
 const [dragOver,setDragOver]=useState<string|null>(null);
 const canManage=actor?.papel==='ADMINISTRADOR'||actor?.papel==='GESTOR';
 useEffect(()=>{let active=true;(async()=>{try{
  const response=await fetch('/api/admin-session',{cache:'no-store'});
  if(!response.ok){window.location.assign('/admin/login');return;}
  const [user,list]=await Promise.all([response.json() as Promise<{papel:string}>,request<Protocolo[]>('')]);
  if(active){setActor(user);setItems(list);}
 }catch(error){if(active)setNotice({text:String(error),error:true});}finally{if(active)setLoading(false);}})();return()=>{active=false};},[]);
 const filtered=useMemo(()=>items.filter(item=>item.nome.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR').trim())),[items,search]);
 async function reload(){setItems(await request<Protocolo[]>(''));}
 function create(){setEditing(null);setNome('');setLink('');setFormOpen(true);setNotice(null);}
 function edit(item:Protocolo){setEditing(item.id);setNome(item.nome);setLink(item.link);setFormOpen(true);setNotice(null);}
 async function save(event:FormEvent){
  event.preventDefault();setBusy(true);setNotice(null);
  try{await request(editing?'/'+editing:'',editing?'PATCH':'POST',{nome,link});await reload();setFormOpen(false);setNotice({text:'Formulário salvo com sucesso.',error:false});}
  catch(error){setNotice({text:String(error),error:true});}finally{setBusy(false);}
 }
 async function remove(item:Protocolo){
  if(!window.confirm('Excluir "'+item.nome+'"?'))return;
  setBusy(true);setNotice(null);
  try{await request('/'+item.id,'DELETE');await reload();setNotice({text:'Formulário excluído.',error:false});}
  catch(error){setNotice({text:String(error),error:true});}finally{setBusy(false);}
 }
 async function reorder(source:string,target:string){
  setDragId(null);setDragOver(null);
  if(!canManage||busy||source===target)return;
  const ids=items.map(item=>item.id),from=ids.indexOf(source),to=ids.indexOf(target);
  if(from<0||to<0)return;
  ids.splice(from,1);ids.splice(to,0,source);
  const before=items;
  setItems(previous=>previous.map(item=>({...item,ordem:ids.indexOf(item.id)})).sort((a,b)=>a.ordem-b.ordem));
  setBusy(true);setNotice(null);
  try{await request('/ordenar','PATCH',{ids});setNotice({text:'Ordem atualizada.',error:false});}
  catch(error){setItems(before);setNotice({text:String(error),error:true});}finally{setBusy(false);}
 }
 return <div className="admin-dashboard protocol-admin">
  <div className="admin-dashboard-header"><div><span className="admin-kicker">SERVIÇOS MUNICIPAIS</span><h1>Protocolos e formulários</h1><p>Organize os requerimentos disponíveis para download no portal público.</p></div>
  <div className="admin-dashboard-actions"><Link className="admin-button admin-button-outline" target="_blank" href="/serviços/protocolo">Ver página ↗</Link>{canManage&&<button className="admin-button admin-button-primary" type="button" onClick={create}>+ Novo protocolo</button>}</div></div>
  {notice&&<div className={'admin-alert '+(notice.error?'admin-alert-error':'admin-alert-ok')} role={notice.error?'alert':'status'}>{notice.text}<button aria-label="Fechar aviso" type="button" onClick={()=>setNotice(null)}>×</button></div>}
  <div className="admin-stats"><div className="admin-stat"><span>Formulários</span><strong>{items.length}</strong><small>Disponíveis no portal</small></div><div className="admin-stat"><span>Resultados</span><strong>{filtered.length}</strong><small>Conforme a pesquisa</small></div><div className="admin-stat"><span>Serviço</span><strong className="protocol-stat-label">Protocolo</strong><small>Consulta pública</small></div><div className="admin-stat"><span>Download</span><strong className="protocol-stat-label">PDF</strong><small>Links para arquivos</small></div></div>
  {formOpen&&<section className="admin-panel protocol-admin-editor"><div className="admin-panel-title"><div><span className="admin-step">{editing?'EDITAR PROTOCOLO':'NOVO PROTOCOLO'}</span><h2>{editing?'Editar formulário':'Cadastrar formulário'}</h2><p>Informe apenas o nome e o endereço do arquivo PDF.</p></div></div>
  <form className="protocol-admin-form" onSubmit={save}><div className="admin-field"><label htmlFor="protocol-name">Nome <b>*</b></label><input id="protocol-name" required maxLength={180} value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex.: Requerimento de alvará sanitário"/></div>
  <div className="admin-field"><label htmlFor="protocol-link">Link do PDF <b>*</b></label><input id="protocol-link" required type="url" pattern="https?://.+" maxLength={2048} value={link} onChange={e=>setLink(e.target.value)} placeholder="https://site.gov.br/documento.pdf"/><small>Utilize um endereço público HTTPS que forneça o arquivo PDF.</small></div>
  <div className="health-admin-actions"><button className="admin-button admin-button-primary" disabled={busy}>{busy?'Salvando...':editing?'Salvar alterações':'Cadastrar protocolo'}</button><button className="admin-button admin-button-outline" type="button" onClick={()=>setFormOpen(false)}>Cancelar</button></div></form></section>}
  <section className="admin-panel"><div className="admin-panel-title"><div><h2>Formulários cadastrados</h2><p>Arraste pela alça para reorganizar a ordem, ou edite e exclua os formulários.</p></div><span className="admin-results">{items.length} item(ns)</span></div>
  <div className="admin-toolbar"><label className="admin-search-filter"><span aria-hidden="true">⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar pelo nome..." aria-label="Pesquisar protocolos"/></label></div>
  {loading?<div className="admin-empty">Carregando formulários...</div>:filtered.length===0?<div className="admin-empty"><h3>{items.length?'Nenhum resultado':'Nenhum formulário cadastrado'}</h3><p>{items.length?'Experimente outra pesquisa.':'Cadastre o primeiro protocolo para disponibilizar documentos.'}</p></div>:
  <div className="admin-table-scroll"><table className="admin-pages-table"><thead><tr><th>Ordem</th><th>Nome</th><th>Link</th><th>Ações</th></tr></thead><tbody>{filtered.map(item=><tr key={item.id} className={dragOver===item.id?'health-admin-drag-over':''} onDragOver={(event:DragEvent<HTMLTableRowElement>)=>{if(!canManage||busy||!dragId||search.trim())return;event.preventDefault();setDragOver(item.id);}} onDragLeave={()=>setDragOver(null)} onDrop={event=>{event.preventDefault();if(dragId&&!search.trim())void reorder(dragId,item.id);}}>
   <td><span className="health-admin-grip" draggable={Boolean(canManage&&!busy&&!search.trim())} onDragStart={event=>{event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',item.id);setDragId(item.id);}} onDragEnd={()=>{setDragId(null);setDragOver(null);}} title="Arraste para ordenar">⠿</span>{item.ordem+1}</td>
   <td><strong>{item.nome}</strong></td><td><a href={item.link} rel="noopener noreferrer" target="_blank" className="protocol-admin-preview">Visualizar PDF ↗</a></td>
   <td><div className="admin-row-actions">{canManage&&<><button type="button" onClick={()=>edit(item)}>Editar</button><button type="button" className="admin-danger-link" disabled={busy} onClick={()=>void remove(item)}>Excluir</button></>}</div></td></tr>)}</tbody></table></div>}
  </section>
  <div className="admin-help-card"><div><strong>Sobre o download</strong><p>O arquivo deve estar acessível publicamente. O comportamento de download depende também dos cabeçalhos enviados pelo servidor que hospeda o PDF.</p></div><Link className="admin-button admin-button-outline" href="/serviços/protocolo" target="_blank">Visualizar protocolos ↗</Link></div>
 </div>;
}
