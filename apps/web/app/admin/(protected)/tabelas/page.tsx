'use client';
import {DocumentUpload} from '../../../components/document-upload';

import {useEffect,useMemo,useState,type FormEvent} from 'react';
import Link from 'next/link';

type Column={chave:string;titulo:string;tipo:'TEXTO'|'LINK';multiplos:boolean};
type CellLink={texto:string;url:string};
type Cell=string|CellLink|CellLink[];
type TableRow=Record<string,Cell>;
type Table={id:string;nome:string;descricao:string|null;colunas:Column[];linhas:TableRow[];atualizadoEm?:string};
type FormData=Omit<Table,'id'|'atualizadoEm'>;
type User={nome:string;papel:string};
type Notice={text:string;error:boolean};

const emptyLink=():CellLink=>({texto:'',url:''});
const initial=():FormData=>({nome:'',descricao:'',colunas:[{chave:'nome',titulo:'Nome',tipo:'TEXTO',multiplos:false}],linhas:[]});
const emptyCell=(column:Column):Cell=>column.tipo==='TEXTO'?'':column.multiplos?[]:emptyLink();
const toLink=(value:Cell|undefined):CellLink=>value&&!Array.isArray(value)&&typeof value==='object'?value as CellLink:emptyLink();
const toLinks=(value:Cell|undefined):CellLink[]=>Array.isArray(value)?value as CellLink[]:[];
async function request<T>(path:string,method='GET',body?:unknown):Promise<T>{
 const response=await fetch('/api/admin-proxy/'+path,{method,headers:{'Content-Type':'application/json'},cache:'no-store',body:body===undefined?undefined:JSON.stringify(body)});
 if(response.status===401){window.location.assign('/admin/login');throw Error('Sessão expirada');}
 if(!response.ok)throw Error('Erro '+response.status+': '+(await response.text()).slice(0,350));
 return response.json() as Promise<T>;
}
export default function TablesAdmin(){
 const [user,setUser]=useState<User|null>(null);
 const [tables,setTables]=useState<Table[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState<Notice|null>(null);
 const [search,setSearch]=useState('');
 const [mode,setMode]=useState<'list'|'editor'>('list');
 const [editing,setEditing]=useState<string|null>(null);
 const [form,setForm]=useState<FormData>(initial);

 useEffect(()=>{
  let active=true;
  (async()=>{
   try{
    const sessionResponse=await fetch('/api/admin-session',{cache:'no-store'});
    if(!sessionResponse.ok){window.location.assign('/admin/login');return;}
    const session=await sessionResponse.json() as User;
    const list=await request<Table[]>('admin/tabelas');
    if(active){setUser(session);setTables(list);}
   }catch(error){if(active)setNotice({text:String(error),error:true});}
   finally{if(active)setLoading(false);}
  })();
  return()=>{active=false;};
 },[]);

 const filtered=useMemo(()=>tables.filter(t=>(t.nome+' '+(t.descricao||'')).toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR'))),[tables,search]);
 const totalColumns=tables.reduce((sum,t)=>sum+t.colunas.length,0);
 const totalRows=tables.reduce((sum,t)=>sum+t.linhas.length,0);
 const linkColumns=tables.reduce((sum,t)=>sum+t.colunas.filter(c=>c.tipo==='LINK').length,0);

 async function reload(){setTables(await request<Table[]>('admin/tabelas'));}
 function newTable(){setEditing(null);setForm(initial());setNotice(null);setMode('editor');window.scrollTo({top:0,behavior:'smooth'});}
 function edit(table:Table){setEditing(table.id);setForm({nome:table.nome,descricao:table.descricao??'',colunas:table.colunas.map(c=>({...c})),linhas:table.linhas.map(row=>({...row}))});setNotice(null);setMode('editor');window.scrollTo({top:0,behavior:'smooth'});}
 function back(){setMode('list');setNotice(null);}
 function updateColumn(index:number,change:Partial<Column>){
  setForm(previous=>{
   const old=previous.colunas[index];
   const columns=previous.colunas.map((column,i)=>i===index?{...column,...change}:column);
   const updated=columns[index];
   const rows=previous.linhas.map(row=>{
    const next={...row};
    if(updated.chave!==old.chave){next[updated.chave]=row[old.chave]??emptyCell(updated);delete next[old.chave];}
    if(updated.tipo!==old.tipo||updated.multiplos!==old.multiplos)next[updated.chave]=emptyCell(updated);
    return next;
   });
   return {...previous,colunas:columns,linhas:rows};
  });
 }
 function addColumn(){
  setForm(previous=>{
   let number=previous.colunas.length+1;
   while(previous.colunas.some(c=>c.chave==='coluna'+number))number++;
   const column:Column={chave:'coluna'+number,titulo:'Nova coluna',tipo:'TEXTO',multiplos:false};
   return {...previous,colunas:[...previous.colunas,column],linhas:previous.linhas.map(row=>({...row,[column.chave]:''}))};
  });
 }
 function removeColumn(index:number){
  setForm(previous=>{
   const key=previous.colunas[index].chave;
   return {...previous,colunas:previous.colunas.filter((_,i)=>i!==index),linhas:previous.linhas.map(row=>{const next={...row};delete next[key];return next;})};
  });
 }
 function addRow(){
  setForm(previous=>({...previous,linhas:[...previous.linhas,Object.fromEntries(previous.colunas.map(column=>[column.chave,emptyCell(column)]))]}));
 }
 function updateCell(rowIndex:number,key:string,value:Cell){
  setForm(previous=>({...previous,linhas:previous.linhas.map((row,i)=>i===rowIndex?{...row,[key]:value}:row)}));
 }
 function changeLink(rowIndex:number,column:Column,linkIndex:number,change:Partial<CellLink>){
  const current=form.linhas[rowIndex][column.chave];
  if(column.multiplos){
   const links=toLinks(current).map((link,i)=>i===linkIndex?{...link,...change}:link);
   updateCell(rowIndex,column.chave,links);
  }else updateCell(rowIndex,column.chave,{...toLink(current),...change});
 }
 async function save(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setNotice(null);
  if(new Set(form.colunas.map(c=>c.chave)).size!==form.colunas.length){setNotice({text:'As chaves das colunas precisam ser diferentes.',error:true});return;}
  if(form.linhas.length>5000){setNotice({text:'Uma tabela pode ter até 5.000 registros.',error:true});return;}
  setBusy(true);
  try{
   await request(editing?'admin/tabelas/'+editing:'admin/tabelas',editing?'PATCH':'POST',form);
   await reload();
   setMode('list');setNotice({text:'Tabela salva com sucesso.',error:false});
  }catch(error){setNotice({text:String(error),error:true});}
  finally{setBusy(false);}
 }
 async function remove(table:Table){
  if(user?.papel!=='ADMINISTRADOR')return;
  if(!window.confirm('Excluir a tabela "'+table.nome+'"? Esta ação não pode ser desfeita.'))return;
  setBusy(true);setNotice(null);
  try{await request('admin/tabelas/'+table.id,'DELETE');await reload();setNotice({text:'Tabela excluída com sucesso.',error:false});}
  catch(error){setNotice({text:String(error),error:true});}
  finally{setBusy(false);}
 }
 return <div className="admin-dashboard admin-tables-dashboard">
  <div className="admin-dashboard-header">
   <div><span className="admin-kicker">GESTÃO DE CONTEÚDO</span><h1>{mode==='editor'?(editing?'Editar tabela':'Criar nova tabela'):'Tabelas reutilizáveis'}</h1><p>{mode==='editor'?'Configure colunas, registros e documentos vinculados de forma visual.':'Organize registros e documentos para reutilizá-los nas páginas do portal.'}</p></div>
   <div className="admin-dashboard-actions">{mode==='list'?<button className="admin-button admin-button-primary" type="button" onClick={newTable}>+ Nova tabela</button>:<button type="button" className="admin-button admin-button-outline" onClick={back}>← Voltar às tabelas</button>}</div>
  </div>
  {notice&&<div role={notice.error?'alert':'status'} className={'admin-alert '+(notice.error?'admin-alert-error':'admin-alert-ok')}>{notice.text}<button type="button" aria-label="Fechar aviso" onClick={()=>setNotice(null)}>×</button></div>}
  {loading?<section className="admin-panel admin-tables-loading">Carregando tabelas...</section>:mode==='list'?<>
   <div className="admin-stats">
    <div className="admin-stat"><span>Tabelas cadastradas</span><strong>{tables.length}</strong><small>Estruturas reutilizáveis</small></div>
    <div className="admin-stat"><span>Total de registros</span><strong>{totalRows}</strong><small>Linhas armazenadas</small></div>
    <div className="admin-stat"><span>Colunas cadastradas</span><strong>{totalColumns}</strong><small>Campos configurados</small></div>
    <div className="admin-stat"><span>Colunas de links</span><strong>{linkColumns}</strong><small>Campos para documentos e URLs</small></div>
   </div>
   <section className="admin-panel">
    <div className="admin-panel-title"><div><h2>Gerenciar tabelas</h2><p>Edite informações ou cadastre uma nova estrutura.</p></div><span className="admin-results">{filtered.length} resultado(s)</span></div>
    <div className="admin-toolbar"><label className="admin-search-filter"><span aria-hidden="true">⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar tabelas pelo nome ou descrição..." aria-label="Buscar tabelas"/></label></div>
    {filtered.length===0?<div className="admin-empty"><span aria-hidden="true">▤</span><h3>{tables.length===0?'Crie sua primeira tabela':'Nenhuma tabela encontrada'}</h3><p>{tables.length===0?'Organize documentos e registros com colunas personalizadas.':'Experimente buscar por outro termo.'}</p>{tables.length===0&&<button type="button" className="admin-button admin-button-primary" onClick={newTable}>+ Criar tabela</button>}</div>:
     <div className="admin-table-scroll"><table className="admin-pages-table admin-tables-list"><thead><tr><th>Tabela</th><th>Colunas</th><th>Registros</th><th>Atualização</th><th>Ações</th></tr></thead><tbody>{filtered.map(table=><tr key={table.id}><td><strong>{table.nome}</strong><span>{table.descricao||'Sem descrição'}</span></td><td>{table.colunas.length}</td><td>{table.linhas.length}</td><td>{table.atualizadoEm?new Date(table.atualizadoEm).toLocaleDateString('pt-BR'):'—'}</td><td><div className="admin-row-actions"><button type="button" onClick={()=>edit(table)}>Editar</button>{user?.papel==='ADMINISTRADOR'&&<button type="button" className="admin-danger-link" disabled={busy} onClick={()=>remove(table)}>Excluir</button>}</div></td></tr>)}</tbody></table></div>}
   </section>
   <div className="admin-help-card"><div><strong>Use suas tabelas em páginas públicas</strong><p>Ao criar uma página, escolha os formatos Tabela simples ou Tabela com abas e vincule uma tabela cadastrada.</p></div><Link href="/admin" className="admin-button admin-button-outline">Gerenciar páginas →</Link></div>
  </>:<form onSubmit={save} className="admin-editor-grid">
   <div className="admin-editor-main">
    <section className="admin-panel admin-editor-section">
     <div className="admin-panel-title"><div><span className="admin-step">01 · INFORMAÇÕES BÁSICAS</span><h2>Dados da tabela</h2><p>Escolha um nome descritivo para localizar esta estrutura no painel.</p></div></div>
     <div className="admin-field"><label htmlFor="table-name">Nome da tabela <b>*</b></label><input id="table-name" required maxLength={180} value={form.nome} placeholder="Ex.: Legislação municipal" onChange={e=>setForm(previous=>({...previous,nome:e.target.value}))}/></div>
     <div className="admin-field"><label htmlFor="table-description">Descrição</label><textarea id="table-description" rows={3} maxLength={500} placeholder="Explique quais informações esta tabela reúne..." value={form.descricao??''} onChange={e=>setForm(previous=>({...previous,descricao:e.target.value}))}/></div>
    </section>
    <section className="admin-panel admin-editor-section">
     <div className="admin-panel-title"><div><span className="admin-step">02 · ESTRUTURA</span><h2>Colunas da tabela</h2><p>Crie campos de texto ou de links, inclusive com múltiplos documentos.</p></div></div>
     <div className="admin-content-block admin-tables-content">
      <div className="admin-content-head"><h3>{form.colunas.length} coluna(s)</h3><button type="button" className="admin-button admin-button-outline" disabled={form.colunas.length>=20} onClick={addColumn}>+ Adicionar coluna</button></div>
      {form.colunas.map((column,index)=><div className="admin-link-card" key={index}>
       <div className="admin-link-title"><strong>Coluna {index+1}</strong><button type="button" disabled={form.colunas.length<=1} onClick={()=>removeColumn(index)}>Remover</button></div>
       <div className="admin-two-fields"><div className="admin-field"><label htmlFor={'column-title-'+index}>Título <b>*</b></label><input id={'column-title-'+index} required maxLength={120} value={column.titulo} placeholder="Ex.: Documento" onChange={e=>updateColumn(index,{titulo:e.target.value})}/></div>
       <div className="admin-field"><label htmlFor={'column-key-'+index}>Chave interna <b>*</b></label><input id={'column-key-'+index} required maxLength={80} pattern="[a-zA-Z][a-zA-Z0-9_]*" value={column.chave} placeholder="documento" onChange={e=>updateColumn(index,{chave:e.target.value})}/></div></div>
       <div className="admin-field admin-tables-type"><label htmlFor={'column-type-'+index}>Tipo da coluna</label><select id={'column-type-'+index} value={column.tipo} onChange={e=>updateColumn(index,{tipo:e.target.value as Column['tipo'],multiplos:false})}><option value="TEXTO">Texto</option><option value="LINK">Link / documento</option></select></div>
       {column.tipo==='LINK'&&<label className="admin-check"><input type="checkbox" checked={column.multiplos} onChange={e=>updateColumn(index,{multiplos:e.target.checked})}/> Permitir vários links por célula</label>}
      </div>)}
     </div>
    </section>
    <section className="admin-panel admin-editor-section">
     <div className="admin-panel-title"><div><span className="admin-step">03 · REGISTROS</span><h2>Linhas da tabela</h2><p>Preencha as informações que serão exibidas nas páginas vinculadas.</p></div></div>
     <div className="admin-content-block admin-tables-content">
      <div className="admin-content-head"><h3>{form.linhas.length} registro(s)</h3><button className="admin-button admin-button-outline" type="button" disabled={form.linhas.length>=5000} onClick={addRow}>+ Adicionar registro</button></div>
      {form.linhas.length===0?<div className="admin-mini-empty"><strong>Nenhum registro adicionado</strong><p>Você pode salvar uma tabela vazia ou começar adicionando uma linha.</p></div>:form.linhas.map((row,rowIndex)=><fieldset className="admin-link-card admin-table-record" key={rowIndex}>
       <legend>Registro {rowIndex+1}</legend>
       {form.colunas.map(column=><div className="admin-field admin-record-field" key={column.chave}>
        <label>{column.titulo}</label>
        {column.tipo==='TEXTO'?<textarea rows={2} maxLength={2000} value={typeof row[column.chave]==='string'?row[column.chave] as string:''} onChange={e=>updateCell(rowIndex,column.chave,e.target.value)} placeholder={'Digite '+column.titulo.toLocaleLowerCase('pt-BR')}/>:
         <div className="admin-record-links">
          {(column.multiplos?toLinks(row[column.chave]):[toLink(row[column.chave])]).map((link,linkIndex)=><div className="admin-record-link" key={linkIndex}>
            <div className="admin-two-fields"><div className="admin-field"><label htmlFor={'link-label-'+rowIndex+'-'+column.chave+'-'+linkIndex}>Texto do link</label><input id={'link-label-'+rowIndex+'-'+column.chave+'-'+linkIndex} required maxLength={200} placeholder="Nome do documento" value={link.texto} onChange={e=>changeLink(rowIndex,column,linkIndex,{texto:e.target.value})}/></div>
            <div className="admin-field"><label htmlFor={'link-url-'+rowIndex+'-'+column.chave+'-'+linkIndex}>Endereço (URL)</label><input id={'link-url-'+rowIndex+'-'+column.chave+'-'+linkIndex} required type="url" pattern="https?://.+" placeholder="https://..." value={link.url} onChange={e=>changeLink(rowIndex,column,linkIndex,{url:e.target.value})}/><DocumentUpload value={link.url} onChange={v=>changeLink(rowIndex,column,linkIndex,{url:v})}/></div></div>
            {column.multiplos&&<button className="admin-inline-remove" type="button" onClick={()=>updateCell(rowIndex,column.chave,toLinks(row[column.chave]).filter((_,i)=>i!==linkIndex))}>Remover link</button>}
           </div>)}
          {column.multiplos&&<button type="button" className="admin-button admin-button-outline" disabled={toLinks(row[column.chave]).length>=30} onClick={()=>updateCell(rowIndex,column.chave,[...toLinks(row[column.chave]),emptyLink()])}>+ Adicionar link</button>}
         </div>}
       </div>)}
       <button type="button" className="admin-inline-remove" onClick={()=>setForm(previous=>({...previous,linhas:previous.linhas.filter((_,index)=>index!==rowIndex)}))}>Remover registro</button>
      </fieldset>)}
     </div>
    </section>
   </div>
   <aside className="admin-editor-aside"><section className="admin-panel admin-editor-section"><div className="admin-panel-title"><div><h2>{editing?'Editar tabela':'Nova tabela'}</h2><p>Revise a estrutura antes de salvar.</p></div></div><div className="admin-tables-summary"><div><span>Colunas</span><strong>{form.colunas.length}</strong></div><div><span>Registros</span><strong>{form.linhas.length}</strong></div><div><span>Campos de links</span><strong>{form.colunas.filter(c=>c.tipo==='LINK').length}</strong></div></div><div className="admin-save-box"><button type="submit" className="admin-button admin-button-primary" disabled={busy}>{busy?'Salvando...':editing?'Salvar alterações':'Criar tabela'}</button><button type="button" className="admin-button admin-button-outline" onClick={back}>Cancelar</button></div><p className="admin-hint admin-tables-sidehint">Alterações em tabelas reutilizadas afetam as páginas vinculadas.</p></section></aside>
  </form>}
 </div>;
}
