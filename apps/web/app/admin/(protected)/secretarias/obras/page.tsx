'use client';
import {DocumentUpload} from '../../../../components/document-upload';
import {useEffect,useMemo,useState,type FormEvent} from 'react';

type Option={id:string;nome:string};
type Options={categorias:Option[];recursos:Option[]};
type Obra={id:string;ano:number;numero:string;objeto:string;categoriaId:string;recursoId:string;inicio:string;comprovacaoUrl:string;categoria:Option;recurso:Option};
type Draft={ano:number;numero:string;objeto:string;categoriaId:string;recursoId:string;inicio:string;comprovacaoUrl:string};
type Notice={text:string;error:boolean};
const today=()=>{
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const field=(type:string)=>parts.find(part=>part.type===type)?.value||'';
 return field('year')+'-'+field('month')+'-'+field('day');
};
const blank=():Draft=>({ano:Number(today().slice(0,4)),numero:'',objeto:'',categoriaId:'',recursoId:'',inicio:today(),comprovacaoUrl:''});
async function api<T>(path:string,method='GET',body?:unknown):Promise<T>{
 const response=await fetch('/api/admin-proxy/admin/obras-publicas'+path,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
 if(response.status===401){window.location.assign('/admin/login');throw Error('Sessão expirada');}
 if(!response.ok){const result=(await response.text()).slice(0,500);throw Error('Erro '+response.status+': '+result);}
 return response.json() as Promise<T>;
}
function dateValue(iso:string){return iso.slice(0,10);}
function formatDate(iso:string){return dateValue(iso).split('-').reverse().join('/');}
export default function ObrasAdmin(){
 const [user,setUser]=useState<{papel:string}|null>(null);
 const [obras,setObras]=useState<Obra[]>([]);
 const [options,setOptions]=useState<Options>({categorias:[],recursos:[]});
 const [draft,setDraft]=useState<Draft>(blank);
 const [editing,setEditing]=useState<string|null>(null);
 const [editingOpen,setEditingOpen]=useState(false);
 const [notice,setNotice]=useState<Notice|null>(null);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [search,setSearch]=useState('');
 const [categoryText,setCategoryText]=useState('');
 const [categoryOpen,setCategoryOpen]=useState(false);
 const [modal,setModal]=useState<'categorias'|'recursos'|null>(null);
 const [optionName,setOptionName]=useState('');
 const [optionEditing,setOptionEditing]=useState<string|null>(null);
 const canManage=user?.papel==='ADMINISTRADOR'||user?.papel==='GESTOR';
 async function reload(){
  const [items,selects]=await Promise.all([api<Obra[]>(''),api<Options>('/opcoes')]);
  setObras(items);setOptions(selects);
  return selects;
 }
 useEffect(()=>{let active=true;(async()=>{
  try{
   const session=await fetch('/api/admin-session',{cache:'no-store'});
   if(!session.ok){window.location.assign('/admin/login');return;}
   const actor=await session.json() as {papel:string};
   const [records,selects]=await Promise.all([api<Obra[]>(''),api<Options>('/opcoes')]);
   if(active){setUser(actor);setObras(records);setOptions(selects);}
  }catch(error){if(active)setNotice({text:String(error),error:true});}
  finally{if(active)setLoading(false);}
 })();return()=>{active=false;};},[]);
 const filtered=useMemo(()=>obras.filter(item=>(item.ano+' '+item.numero+' '+item.objeto+' '+item.categoria.nome+' '+item.recurso.nome).toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR').trim())),[obras,search]);
 const matches=options.categorias.filter(category=>category.nome.toLocaleLowerCase('pt-BR').includes(categoryText.toLocaleLowerCase('pt-BR').trim()));
 const exact=options.categorias.some(category=>category.nome.toLocaleLowerCase('pt-BR')===categoryText.trim().toLocaleLowerCase('pt-BR'));
 function newObra(){setEditing(null);setDraft(blank());setCategoryText('');setEditingOpen(true);setNotice(null);window.scrollTo({top:0,behavior:'smooth'});}
 function edit(item:Obra){setEditing(item.id);setDraft({ano:item.ano,numero:item.numero,objeto:item.objeto,categoriaId:item.categoriaId,recursoId:item.recursoId,inicio:dateValue(item.inicio),comprovacaoUrl:item.comprovacaoUrl});setCategoryText(item.categoria.nome);setEditingOpen(true);setNotice(null);window.scrollTo({top:0,behavior:'smooth'});}
 function selectCategory(item:Option){setDraft(prev=>({...prev,categoriaId:item.id}));setCategoryText(item.nome);setCategoryOpen(false);}
 async function quickCreateCategory(){
  const name=categoryText.trim();
  if(name.length<2)return;
  setBusy(true);setNotice(null);
  try{
   const created=await api<Option>('/categorias','POST',{nome:name});
   const selects=await reload();
   selectCategory(selects.categorias.find(x=>x.id===created.id)||created);
   setNotice({text:'Categoria criada e selecionada.',error:false});
  }catch(error){setNotice({text:String(error),error:true});}finally{setBusy(false);}
 }
 async function save(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(!draft.categoriaId||!draft.recursoId){setNotice({text:'Escolha uma categoria e um recurso antes de salvar.',error:true});return;}
  setBusy(true);setNotice(null);
  try{
   await api(editing?'/'+editing:'',editing?'PATCH':'POST',draft);
   await reload();setEditingOpen(false);setEditing(null);setNotice({text:'Obra salva com sucesso.',error:false});
  }catch(error){setNotice({text:String(error),error:true});}finally{setBusy(false);}
 }
 async function remove(item:Obra){
  if(!window.confirm('Excluir a obra '+item.numero+'/'+item.ano+'?'))return;
  setBusy(true);setNotice(null);
  try{await api('/'+item.id,'DELETE');await reload();setNotice({text:'Obra excluída.',error:false});}
  catch(error){setNotice({text:String(error),error:true});}finally{setBusy(false);}
 }
 function openManager(kind:'categorias'|'recursos'){setModal(kind);setOptionName('');setOptionEditing(null);setCategoryOpen(false);}
 async function saveOption(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(!modal)return;
  setBusy(true);setNotice(null);
  try{
   const created=await api<Option>('/'+modal+(optionEditing?'/'+optionEditing:''),optionEditing?'PATCH':'POST',{nome:optionName.trim()});
   const selects=await reload();
   if(modal==='categorias'&&draft.categoriaId===created.id)setCategoryText(created.nome);
   if(modal==='categorias'&&!optionEditing&&!draft.categoriaId){setDraft(prev=>({...prev,categoriaId:created.id}));setCategoryText(created.nome);}
   setOptionEditing(null);setOptionName('');setNotice({text:'Cadastro auxiliar salvo.',error:false});
  }catch(error){setNotice({text:String(error),error:true});}finally{setBusy(false);}
 }
 async function deleteOption(item:Option){
  if(!modal||!window.confirm('Excluir "'+item.nome+'"?'))return;
  setBusy(true);setNotice(null);
  try{
   await api('/'+modal+'/'+item.id,'DELETE');
   await reload();
   if(modal==='categorias'&&draft.categoriaId===item.id){setDraft(prev=>({...prev,categoriaId:''}));setCategoryText('');}
   if(modal==='recursos'&&draft.recursoId===item.id)setDraft(prev=>({...prev,recursoId:''}));
   setNotice({text:'Cadastro auxiliar excluído.',error:false});
  }catch(error){setNotice({text:String(error),error:true});}finally{setBusy(false);}
 }
 const list=modal?options[modal]:[];
 return <div className="admin-dashboard obras-admin">
  <div className="admin-dashboard-header"><div><span className="admin-kicker">GESTÃO MUNICIPAL</span><h1>{editingOpen?(editing?'Editar obra pública':'Cadastrar obra pública'):'Obras públicas'}</h1><p>Controle os registros, categorias, fontes de recursos e links de comprovação.</p></div><div className="admin-dashboard-actions">{canManage&&(editingOpen?<button className="admin-button admin-button-outline" onClick={()=>setEditingOpen(false)}>← Voltar à listagem</button>:<button className="admin-button admin-button-primary" onClick={newObra}>+ Cadastrar obra</button>)}</div></div>
  {notice&&<div className={'admin-alert '+(notice.error?'admin-alert-error':'admin-alert-ok')} role={notice.error?'alert':'status'}>{notice.text}<button type="button" onClick={()=>setNotice(null)} aria-label="Fechar mensagem">×</button></div>}
  {loading?<section className="admin-panel obras-loading">Carregando obras...</section>:editingOpen?<form onSubmit={save} className="admin-editor-grid"><section className="admin-panel obras-editor-panel">
    <div className="admin-panel-title"><div><span className="admin-step">DADOS DA OBRA</span><h2>Informações da obra</h2><p>Preencha os dados que serão exibidos na página pública.</p></div></div>
    <div className="obras-form-fields">
     <div className="obras-two-fields"><div className="admin-field"><label htmlFor="obra-ano">Ano <b>*</b></label><input id="obra-ano" type="number" min="1900" max="2200" required value={draft.ano} onChange={e=>setDraft(prev=>({...prev,ano:Number(e.target.value)}))}/></div><div className="admin-field"><label htmlFor="obra-numero">Número <b>*</b></label><input id="obra-numero" required maxLength={60} placeholder="Ex.: 001/2026" value={draft.numero} onChange={e=>setDraft(prev=>({...prev,numero:e.target.value}))}/></div></div>
     <div className="admin-field"><label htmlFor="obra-objeto">Objeto <b>*</b></label><textarea id="obra-objeto" rows={4} required maxLength={6000} placeholder="Descreva o objeto da obra..." value={draft.objeto} onChange={e=>setDraft(prev=>({...prev,objeto:e.target.value}))}/></div>
     <div className="obras-two-fields">
      <div className="admin-field obras-category-field"><label htmlFor="obra-categoria">Categoria <b>*</b></label><div className="obras-category-input"><input id="obra-categoria" role="combobox" aria-expanded={categoryOpen} aria-controls="obras-category-options" autoComplete="off" value={categoryText} placeholder="Digite ou selecione a categoria" onFocus={()=>setCategoryOpen(true)} onChange={e=>{setCategoryText(e.target.value);setDraft(prev=>({...prev,categoriaId:''}));setCategoryOpen(true);}}/><button type="button" onClick={()=>setCategoryOpen(prev=>!prev)} aria-label="Exibir categorias">⌄</button></div>
      {categoryOpen&&<div className="obras-category-options" id="obras-category-options" role="listbox">{matches.map(category=><button type="button" role="option" aria-selected={draft.categoriaId===category.id} key={category.id} onClick={()=>selectCategory(category)}>{category.nome}</button>)}{categoryText.trim().length>=2&&!exact&&<button type="button" className="obras-create-option" disabled={busy} onClick={()=>void quickCreateCategory()}>+ Criar categoria “{categoryText.trim()}”</button>}{!matches.length&&categoryText.trim().length<2&&<span>Nenhuma categoria encontrada</span>}</div>}
      <button type="button" className="obras-manage-link" onClick={()=>openManager('categorias')}>Gerir categorias ↗</button></div>
      <div className="admin-field"><label htmlFor="obra-recurso">Recurso <b>*</b></label><select id="obra-recurso" required value={draft.recursoId} onChange={e=>setDraft(prev=>({...prev,recursoId:e.target.value}))}><option value="">Selecione um recurso</option>{options.recursos.map(recurso=><option key={recurso.id} value={recurso.id}>{recurso.nome}</option>)}</select><button type="button" className="obras-manage-link" onClick={()=>openManager('recursos')}>Gerir recursos ↗</button></div>
     </div>
     <div className="obras-two-fields"><div className="admin-field"><label htmlFor="obra-inicio">Início <b>*</b></label><input id="obra-inicio" type="date" required value={draft.inicio} onChange={e=>setDraft(prev=>({...prev,inicio:e.target.value}))}/></div><div className="admin-field"><label htmlFor="obra-link">Link de comprovação <b>*</b></label><input id="obra-link" type="url" pattern="https?://.+" required maxLength={2000} placeholder="https://..." value={draft.comprovacaoUrl} onChange={e=>setDraft(prev=>({...prev,comprovacaoUrl:e.target.value}))}/><DocumentUpload value={draft.comprovacaoUrl} onChange={v=>setDraft(prev=>({...prev,comprovacaoUrl:v}))}/></div></div>
    </div>
   </section>
   <aside className="admin-editor-aside"><section className="admin-panel"><div className="admin-panel-title"><div><h2>Publicação</h2><p>Dados salvos ficam públicos imediatamente.</p></div></div><div className="admin-save-box"><button type="submit" disabled={busy||!canManage} className="admin-button admin-button-primary">{busy?'Salvando...':editing?'Salvar alterações':'Cadastrar obra'}</button><button type="button" className="admin-button admin-button-outline" onClick={()=>setEditingOpen(false)}>Cancelar</button></div></section></aside>
  </form>:<>
   <div className="admin-stats"><div className="admin-stat"><span>Obras cadastradas</span><strong>{obras.length}</strong><small>Registros publicados</small></div><div className="admin-stat"><span>Categorias</span><strong>{options.categorias.length}</strong><small>Tipos de obra</small></div><div className="admin-stat"><span>Recursos</span><strong>{options.recursos.length}</strong><small>Fontes cadastradas</small></div><div className="admin-stat"><span>Anos</span><strong>{new Set(obras.map(item=>item.ano)).size}</strong><small>Períodos com registros</small></div></div>
   <section className="admin-panel"><div className="admin-panel-title"><div><h2>Obras cadastradas</h2><p>Pesquise por número, objeto, categoria ou recurso.</p></div><span className="admin-results">{filtered.length} resultado(s)</span></div>
    <div className="admin-toolbar"><label className="admin-search-filter"><span aria-hidden="true">⌕</span><input aria-label="Pesquisar obras" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar obras..."/></label></div>
    {filtered.length===0?<div className="admin-empty"><h3>Nenhuma obra encontrada</h3><p>Cadastre uma obra ou ajuste os filtros.</p></div>:<div className="admin-table-scroll"><table className="admin-pages-table"><thead><tr><th>Número / Ano</th><th>Objeto</th><th>Categoria</th><th>Recurso</th><th>Início</th><th>Ações</th></tr></thead><tbody>{filtered.map(item=><tr key={item.id}><td><strong>{item.numero}</strong><span>{item.ano}</span></td><td className="obras-object-cell">{item.objeto}</td><td>{item.categoria.nome}</td><td>{item.recurso.nome}</td><td>{formatDate(item.inicio)}</td><td><div className="admin-row-actions"><a target="_blank" rel="noopener noreferrer" href={item.comprovacaoUrl}>Comprovação ↗</a>{canManage&&<><button type="button" onClick={()=>edit(item)}>Editar</button><button type="button" disabled={busy} className="admin-danger-link" onClick={()=>void remove(item)}>Excluir</button></>}</div></td></tr>)}</tbody></table></div>}
   </section>
   {canManage&&<div className="admin-help-card"><div><strong>Cadastros auxiliares</strong><p>Gerencie as categorias e os tipos de recursos utilizados pelas obras.</p></div><div className="obras-quick-actions"><button type="button" className="admin-button admin-button-outline" onClick={()=>openManager('categorias')}>Categorias</button><button type="button" className="admin-button admin-button-outline" onClick={()=>openManager('recursos')}>Recursos</button></div></div>}
  </>}
  {modal&&<div className="obras-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(null);}}><section className="obras-modal admin-panel" role="dialog" aria-modal="true" aria-label={'Gerir '+modal}><div className="admin-panel-title"><div><span className="admin-step">CADASTROS AUXILIARES</span><h2>Gerir {modal}</h2><p>Crie, altere ou exclua os valores disponíveis na seleção.</p></div><button type="button" className="menu-editor-close" onClick={()=>setModal(null)}>Fechar ×</button></div>
   <form className="obras-modal-form" onSubmit={saveOption}><div className="admin-field"><label htmlFor="option-nome">{modal==='categorias'?'Nome da categoria':'Nome do recurso'}</label><input autoFocus id="option-nome" required minLength={2} maxLength={120} value={optionName} onChange={e=>setOptionName(e.target.value)} placeholder={modal==='categorias'?'Ex.: Pavimentação':'Ex.: Recursos próprios'}/></div><div className="obras-quick-actions"><button className="admin-button admin-button-primary" disabled={busy} type="submit">{optionEditing?'Salvar alteração':'Adicionar'}</button>{optionEditing&&<button type="button" className="admin-button admin-button-outline" onClick={()=>{setOptionEditing(null);setOptionName('');}}>Cancelar edição</button>}</div></form>
   <div className="obras-modal-list">{list.length===0?<p className="muted">Nenhum item cadastrado.</p>:list.map(item=><div key={item.id}><strong>{item.nome}</strong><div className="admin-row-actions"><button type="button" onClick={()=>{setOptionEditing(item.id);setOptionName(item.nome);}}>Editar</button><button type="button" className="admin-danger-link" disabled={busy} onClick={()=>void deleteOption(item)}>Excluir</button></div></div>)}</div>
  </section></div>}
 </div>;
}
