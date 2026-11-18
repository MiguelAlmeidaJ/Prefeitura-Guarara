'use client';
import {DocumentUpload} from '../../../components/document-upload';

import {useEffect,useMemo,useState,type FormEvent} from 'react';
import Link from 'next/link';

type PageType='GRID_LINKS'|'TABELA_SIMPLES'|'TABELA_ABAS';
type Status='RASCUNHO'|'PUBLICADA'|'ARQUIVADA';
type Page={id:string;titulo:string;slug:string;tipo:PageType;estado:Status;subtitulo:string|null;ordem:number;conteudo:unknown;atualizadoEm?:string};
type Table={id:string;nome:string};
type LinkItem={texto:string;url:string;novaAba:boolean};
type TabItem={titulo:string;tabelaId:string};
type Draft={id:string;titulo:string;slug:string;subtitulo:string;tipo:PageType;ordem:number;links:LinkItem[];tabelaId:string;abas:TabItem[]};
type User={nome:string;papel:string};
const emptyDraft=():Draft=>({id:'',titulo:'',slug:'',subtitulo:'',tipo:'GRID_LINKS',ordem:0,links:[{texto:'',url:'',novaAba:true}],tabelaId:'',abas:[{titulo:'Geral',tabelaId:''}]});
const labelType:Record<PageType,string>={GRID_LINKS:'Grade de links',TABELA_SIMPLES:'Tabela simples',TABELA_ABAS:'Tabela com abas'};
const labelStatus:Record<Status,string>={RASCUNHO:'Rascunho',PUBLICADA:'Publicada',ARQUIVADA:'Arquivada'};
function normalizeSlug(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,180);}
function parseDraft(page:Page):Draft{
 const content=page.conteudo as Record<string,unknown>|null;
 const links=Array.isArray(content?.links)?(content.links as LinkItem[]):[];
 const tabs=Array.isArray(content?.abas)?(content.abas as TabItem[]):[];
 return {id:page.id,titulo:page.titulo,slug:page.slug,subtitulo:page.subtitulo||'',tipo:page.tipo,ordem:page.ordem,
  links:links.map(x=>({texto:x.texto||'',url:x.url||'',novaAba:x.novaAba===true})),
  tabelaId:typeof content?.tabelaId==='string'?content.tabelaId:'',
  abas:tabs.map(x=>({titulo:x.titulo||'',tabelaId:x.tabelaId||''}))};
}
function contentOf(draft:Draft){
 if(draft.tipo==='GRID_LINKS')return {links:draft.links};
 if(draft.tipo==='TABELA_SIMPLES')return {tabelaId:draft.tabelaId};
 return {abas:draft.abas};
}
async function request<T>(path:string,method='GET',body?:unknown):Promise<T>{
 const response=await fetch('/api/admin-proxy/'+path,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
 if(response.status===401){window.location.assign('/admin/login');throw Error('Sessão expirada');}
 if(!response.ok){const message=(await response.text()).slice(0,350);throw Error('Erro '+response.status+': '+message);}
 return response.json() as Promise<T>;
}
export default function Admin(){
 const [user,setUser]=useState<User|null>(null);
 const [pages,setPages]=useState<Page[]>([]);
 const [tables,setTables]=useState<Table[]>([]);
 const [draft,setDraft]=useState<Draft>(emptyDraft);
 const [mode,setMode]=useState<'list'|'editor'>('list');
 const [filter,setFilter]=useState<'TODAS'|Status>('TODAS');
 const [query,setQuery]=useState('');
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState<{text:string;error:boolean}|null>(null);
 const [autoSlug,setAutoSlug]=useState(true);
 async function reload(){
  const [pageData,tableData]=await Promise.all([request<Page[]>('admin/paginas'),request<Table[]>('admin/tabelas')]);
  setPages(pageData);setTables(tableData);
 }
 useEffect(()=>{
  let active=true;
  fetch('/api/admin-session',{cache:'no-store'}).then(async response=>{if(!response.ok)throw Error('Sessão expirada');return response.json() as Promise<User>;})
  .then(async data=>{if(!active)return;setUser(data);await reload();})
  .catch(err=>{if(active)setMessage({text:String(err),error:true});});
  return()=>{active=false;};
 },[]);
 const filtered=useMemo(()=>pages.filter(p=>(filter==='TODAS'||p.estado===filter)&&
  (p.titulo+' '+p.slug).toLowerCase().includes(query.toLowerCase().trim())),[pages,filter,query]);
 const counts={total:pages.length,published:pages.filter(p=>p.estado==='PUBLICADA').length,drafts:pages.filter(p=>p.estado==='RASCUNHO').length,archived:pages.filter(p=>p.estado==='ARQUIVADA').length};
 function newPage(){setDraft(emptyDraft());setAutoSlug(true);setMode('editor');setMessage(null);window.scrollTo({top:0,behavior:'smooth'});}
 function edit(page:Page){setDraft(parseDraft(page));setAutoSlug(false);setMode('editor');setMessage(null);window.scrollTo({top:0,behavior:'smooth'});}
 function exitEditor(){setMode('list');setMessage(null);}
 async function save(event:FormEvent){
  event.preventDefault();setBusy(true);setMessage(null);
  if(draft.tipo==='TABELA_SIMPLES'&&!draft.tabelaId){setBusy(false);setMessage({text:'Selecione uma tabela para esta página.',error:true});return;}
  if(draft.tipo==='TABELA_ABAS'&&(!draft.abas.length||draft.abas.some(tab=>!tab.titulo.trim()||!tab.tabelaId))){setBusy(false);setMessage({text:'Informe um título e uma tabela para cada aba.',error:true});return;}
  try{
   const payload={titulo:draft.titulo.trim(),slug:draft.slug,subtitulo:draft.subtitulo,tipo:draft.tipo,ordem:draft.ordem,conteudo:contentOf(draft)};
   await request('admin/paginas'+(draft.id?'/'+draft.id:''),draft.id?'PATCH':'POST',payload);
   await reload();setMode('list');setMessage({text:'Página salva com sucesso.',error:false});
  }catch(err){setMessage({text:String(err),error:true});}finally{setBusy(false);}
 }
 async function change(page:Page,estado:Status){
  if(estado==='PUBLICADA'&&!window.confirm('Publicar a página "'+page.titulo+'"?'))return;
  setBusy(true);setMessage(null);
  try{await request('admin/paginas/'+page.id+'/estado','PATCH',{estado});await reload();setMessage({text:'Status atualizado com sucesso.',error:false});}
  catch(err){setMessage({text:String(err),error:true});}finally{setBusy(false);}
 }
 async function remove(page:Page){
  if(!window.confirm('Excluir definitivamente a página "'+page.titulo+'"?'))return;
  setBusy(true);
  try{await request('admin/paginas/'+page.id,'DELETE');await reload();setMessage({text:'Página excluída.',error:false});}
  catch(err){setMessage({text:String(err),error:true});}finally{setBusy(false);}
 }
 const canPublish=user?.papel!=='EDITOR';
 const canDelete=user?.papel==='ADMINISTRADOR';
 return <div className="admin-dashboard">
  <div className="admin-dashboard-header"><div><span className="admin-kicker">GESTÃO DE CONTEÚDO</span><h1>{mode==='editor'?(draft.id?'Editar página':'Criar nova página'):'Páginas do portal'}</h1><p>{mode==='editor'?'Organize as informações e configure o conteúdo exibido no site.':'Gerencie publicações, organize conteúdos e mantenha o portal atualizado.'}</p></div>
   <div className="admin-dashboard-actions">{mode==='editor'?<button type="button" className="admin-button admin-button-outline" onClick={exitEditor}>← Voltar às páginas</button>:<button type="button" className="admin-button admin-button-primary" onClick={newPage}>+ Nova página</button>}</div>
  </div>
  {message&&<div className={'admin-alert '+(message.error?'admin-alert-error':'admin-alert-ok')} role={message.error?'alert':'status'}>{message.text}<button type="button" aria-label="Fechar aviso" onClick={()=>setMessage(null)}>×</button></div>}
  {mode==='list'?<>
    <div className="admin-stats">
     <div className="admin-stat"><span>Total de páginas</span><strong>{counts.total}</strong><small>Conteúdos cadastrados</small></div>
     <div className="admin-stat"><span>Publicadas</span><strong>{counts.published}</strong><small>Visíveis no portal</small></div>
     <div className="admin-stat"><span>Rascunhos</span><strong>{counts.drafts}</strong><small>Aguardando publicação</small></div>
     <div className="admin-stat"><span>Arquivadas</span><strong>{counts.archived}</strong><small>Fora de circulação</small></div>
    </div>
    <section className="admin-panel">
     <div className="admin-panel-title"><div><h2>Gerenciar páginas</h2><p>Visualize, edite e publique conteúdos do portal.</p></div><span className="admin-results">{filtered.length} resultado(s)</span></div>
     <div className="admin-toolbar"><label className="admin-search-filter"><span aria-hidden="true">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por título ou endereço..." aria-label="Buscar páginas"/></label>
      <select aria-label="Filtrar por status" value={filter} onChange={e=>setFilter(e.target.value as typeof filter)}><option value="TODAS">Todos os status</option><option value="PUBLICADA">Publicadas</option><option value="RASCUNHO">Rascunhos</option><option value="ARQUIVADA">Arquivadas</option></select>
     </div>
     {filtered.length===0?<div className="admin-empty"><span aria-hidden="true">▤</span><h3>{pages.length===0?'Sua primeira página começa aqui':'Nenhuma página encontrada'}</h3><p>{pages.length===0?'Cadastre páginas institucionais usando o editor visual.':'Ajuste a pesquisa ou selecione outro status.'}</p>{pages.length===0&&<button className="admin-button admin-button-primary" onClick={newPage}>+ Criar página</button>}</div>:
     <div className="admin-table-scroll"><table className="admin-pages-table"><thead><tr><th>Página</th><th>Tipo</th><th>Status</th><th>Ordem</th><th>Ações</th></tr></thead><tbody>{filtered.map(page=><tr key={page.id}><td><strong>{page.titulo}</strong><span>/{page.slug}</span></td><td>{labelType[page.tipo]}</td><td><span className={'admin-status admin-status-'+page.estado.toLowerCase()}>{labelStatus[page.estado]}</span></td><td>{page.ordem}</td><td><div className="admin-row-actions"><button onClick={()=>edit(page)} type="button">Editar</button>{page.estado==='PUBLICADA'&&<Link href={'/p/'+page.slug} target="_blank" rel="noopener noreferrer">Ver ↗</Link>}{canPublish&&<button disabled={busy} onClick={()=>change(page,page.estado==='PUBLICADA'?'RASCUNHO':'PUBLICADA')} type="button">{page.estado==='PUBLICADA'?'Despublicar':'Publicar'}</button>}{canDelete&&<button disabled={busy} className="admin-danger-link" onClick={()=>remove(page)} type="button">Excluir</button>}</div></td></tr>)}</tbody></table></div>}
    </section>
    <div className="admin-help-card"><div><strong>Precisa gerenciar documentos ou tabelas?</strong><p>Cadastre tabelas reutilizáveis e vincule os conteúdos às páginas.</p></div><Link href="/admin/tabelas" className="admin-button admin-button-outline">Gerenciar tabelas →</Link></div>
   </>:<form onSubmit={save} className="admin-editor-grid">
    <div className="admin-editor-main">
     <section className="admin-panel admin-editor-section"><div className="admin-panel-title"><div><span className="admin-step">01 · INFORMAÇÕES BÁSICAS</span><h2>Dados da página</h2><p>Defina como esta página será identificada no portal.</p></div></div>
      <div className="admin-field"><label htmlFor="page-title">Título da página <b>*</b></label><input id="page-title" required maxLength={180} placeholder="Ex.: Serviços ao cidadão" value={draft.titulo} onChange={e=>{const title=e.target.value;setDraft(prev=>({...prev,titulo:title,...(autoSlug?{slug:normalizeSlug(title)}:{})}));}}/></div>
      <div className="admin-field"><label htmlFor="page-slug">Endereço (slug) <b>*</b></label><div className="admin-slug"><span>/p/</span><input id="page-slug" required maxLength={180} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="servicos-ao-cidadao" value={draft.slug} onChange={e=>{setAutoSlug(false);setDraft(prev=>({...prev,slug:normalizeSlug(e.target.value)}));}}/></div><small>Endereço amigável da página. Somente letras minúsculas, números e hífens.</small></div>
      <div className="admin-field"><label htmlFor="page-subtitle">Descrição ou subtítulo</label><textarea id="page-subtitle" rows={3} maxLength={500} placeholder="Uma breve descrição que aparecerá abaixo do título..." value={draft.subtitulo} onChange={e=>setDraft(prev=>({...prev,subtitulo:e.target.value}))}/></div>
     </section>
     <section className="admin-panel admin-editor-section"><div className="admin-panel-title"><div><span className="admin-step">02 · CONTEÚDO</span><h2>Estrutura da página</h2><p>Escolha o formato e preencha as informações visualmente.</p></div></div>
      <div className="admin-page-types">
       {(['GRID_LINKS','TABELA_SIMPLES','TABELA_ABAS'] as PageType[]).map(t=><button type="button" key={t} className={'admin-type-option '+(draft.tipo===t?'selected':'')} onClick={()=>setDraft(prev=>({...prev,tipo:t}))} aria-pressed={draft.tipo===t}><span className="admin-type-symbol" aria-hidden="true">{t==='GRID_LINKS'?'▦':t==='TABELA_SIMPLES'?'▤':'▣'}</span><strong>{labelType[t]}</strong><small>{t==='GRID_LINKS'?'Cartões com links úteis':t==='TABELA_SIMPLES'?'Uma tabela cadastrada':'Tabelas divididas em abas'}</small></button>)}
      </div>
      {draft.tipo==='GRID_LINKS'&&<div className="admin-content-block"><div className="admin-content-head"><h3>Links e serviços</h3><span>{draft.links.length} link(s)</span></div>
       {draft.links.map((link,index)=><div className="admin-link-card" key={index}><div className="admin-link-title"><strong>Link {index+1}</strong><button type="button" onClick={()=>setDraft(prev=>({...prev,links:prev.links.filter((_,i)=>i!==index)}))}>Remover</button></div><div className="admin-two-fields"><div className="admin-field"><label htmlFor={'link-name-'+index}>Nome do link</label><input id={'link-name-'+index} required maxLength={160} placeholder="Ex.: Portal da transparência" value={link.texto} onChange={e=>setDraft(prev=>({...prev,links:prev.links.map((item,i)=>i===index?{...item,texto:e.target.value}:item)}))}/></div><div className="admin-field"><label htmlFor={'link-url-'+index}>URL de destino</label><input id={'link-url-'+index} required type="url" pattern="https?://.+" placeholder="https://..." value={link.url} onChange={e=>setDraft(prev=>({...prev,links:prev.links.map((item,i)=>i===index?{...item,url:e.target.value}:item)}))}/><DocumentUpload value={link.url} onChange={v=>setDraft(prev=>({...prev,links:prev.links.map((item,i)=>i===index?{...item,url:v}:item)}))}/></div></div><label className="admin-check"><input type="checkbox" checked={link.novaAba} onChange={e=>setDraft(prev=>({...prev,links:prev.links.map((item,i)=>i===index?{...item,novaAba:e.target.checked}:item)}))}/> Abrir em nova aba</label></div>)}
       <button type="button" className="admin-button admin-button-outline" disabled={draft.links.length>=200} onClick={()=>setDraft(prev=>({...prev,links:[...prev.links,{texto:'',url:'',novaAba:true}]}))}>+ Adicionar link</button>
      </div>}
      {draft.tipo==='TABELA_SIMPLES'&&<div className="admin-content-block"><div className="admin-field"><label htmlFor="page-table">Tabela vinculada <b>*</b></label><select id="page-table" value={draft.tabelaId} required onChange={e=>setDraft(prev=>({...prev,tabelaId:e.target.value}))}><option value="">Selecione uma tabela</option>{tables.map(table=><option key={table.id} value={table.id}>{table.nome}</option>)}</select></div><p className="admin-hint">Ainda não tem uma tabela? <Link href="/admin/tabelas">Cadastre no gerenciador de tabelas →</Link></p></div>}
      {draft.tipo==='TABELA_ABAS'&&<div className="admin-content-block"><div className="admin-content-head"><h3>Abas de conteúdo</h3><span>{draft.abas.length} aba(s)</span></div>{draft.abas.map((tab,index)=><div className="admin-link-card" key={index}><div className="admin-link-title"><strong>Aba {index+1}</strong><button type="button" onClick={()=>setDraft(prev=>({...prev,abas:prev.abas.filter((_,i)=>i!==index)}))}>Remover</button></div><div className="admin-two-fields"><div className="admin-field"><label htmlFor={'tab-title-'+index}>Título da aba</label><input id={'tab-title-'+index} required maxLength={120} placeholder="Ex.: Ano 2026" value={tab.titulo} onChange={e=>setDraft(prev=>({...prev,abas:prev.abas.map((item,i)=>i===index?{...item,titulo:e.target.value}:item)}))}/></div><div className="admin-field"><label htmlFor={'tab-table-'+index}>Tabela</label><select id={'tab-table-'+index} required value={tab.tabelaId} onChange={e=>setDraft(prev=>({...prev,abas:prev.abas.map((item,i)=>i===index?{...item,tabelaId:e.target.value}:item)}))}><option value="">Selecione uma tabela</option>{tables.map(table=><option key={table.id} value={table.id}>{table.nome}</option>)}</select></div></div></div>)}<button type="button" className="admin-button admin-button-outline" disabled={draft.abas.length>=40} onClick={()=>setDraft(prev=>({...prev,abas:[...prev.abas,{titulo:'',tabelaId:''}]}))}>+ Adicionar aba</button></div>}
     </section>
    </div>
    <aside className="admin-editor-aside"><section className="admin-panel admin-editor-section"><div className="admin-panel-title"><div><h2>Publicação</h2><p>Configurações da página</p></div></div><div className="admin-field"><label htmlFor="page-order">Ordem de exibição</label><input id="page-order" type="number" min="0" max="99999" required value={draft.ordem} onChange={e=>setDraft(prev=>({...prev,ordem:Number(e.target.value)}))}/><small>Números menores aparecem primeiro.</small></div><div className="admin-save-box"><button className="admin-button admin-button-primary" type="submit" disabled={busy}>{busy?'Salvando...':draft.id?'Salvar alterações':'Salvar rascunho'}</button><button type="button" className="admin-button admin-button-outline" onClick={exitEditor}>Cancelar</button></div>{draft.id&&<p className="admin-hint">Para publicar ou despublicar, volte à lista de páginas.</p>}</section></aside>
   </form>}
 </div>;
}
