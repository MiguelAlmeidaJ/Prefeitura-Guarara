'use client';
import {useEffect,useMemo,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {folhaCategorias,meses,type Categoria} from './folha-pagamento-publica';
type Entry={id:string;ano:number;mes:number;link:string;publicado:boolean};
type Draft=Omit<Entry,'id'>;
const yearNow=()=>Number(new Intl.DateTimeFormat('en-US',{year:'numeric',timeZone:'America/Sao_Paulo'}).format(new Date()));
const currentMonth=()=>Number(new Intl.DateTimeFormat('en-US',{month:'numeric',timeZone:'America/Sao_Paulo'}).format(new Date()));
const blank=():Draft=>({ano:yearNow(),mes:currentMonth(),link:'',publicado:true});
async function request<T>(cat:Categoria,path='',method='GET',body?:unknown):Promise<T>{
 const response=await fetch('/api/admin-proxy/admin/folha-pagamento/'+cat+path,{method,cache:'no-store',headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 if(response.status===401){window.location.assign('/admin/login');throw Error('Sessão expirada');}
 if(!response.ok)throw Error('Erro '+response.status+': '+(await response.text()).slice(0,450));
 return response.json() as Promise<T>;
}
export function FolhaPagamentoAdmin({categoria}:{categoria:Categoria}){
 const [items,setItems]=useState<Entry[]>([]);
 const [actor,setActor]=useState<{papel:string}|null>(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState<{text:string;error:boolean}|null>(null);
 const [editor,setEditor]=useState(false);
 const [editing,setEditing]=useState<string|null>(null);
 const [draft,setDraft]=useState<Draft>(blank);
 const [filter,setFilter]=useState('');
 const info=folhaCategorias.find(x=>x.slug===categoria)!;
 const canEdit=actor?.papel==='ADMINISTRADOR'||actor?.papel==='GESTOR';
 async function reload(){setItems(await request<Entry[]>(categoria));}
 useEffect(()=>{let active=true;(async()=>{try{
  const session=await fetch('/api/admin-session',{cache:'no-store'});
  if(!session.ok){window.location.assign('/admin/login');return;}
  const [user,rows]=await Promise.all([session.json() as Promise<{papel:string}>,request<Entry[]>(categoria)]);
  if(active){setActor(user);setItems(rows);}
 }catch(e){if(active)setNotice({text:String(e),error:true});}finally{if(active)setLoading(false);}})();return()=>{active=false};},[categoria]);
 const years=[...new Set(items.map(x=>x.ano))].sort((a,b)=>b-a);
 const filtered=useMemo(()=>items.filter(x=>!filter||String(x.ano)===filter),[items,filter]);
 function create(){setEditing(null);setDraft(blank());setEditor(true);setNotice(null);}
 function edit(item:Entry){setEditing(item.id);setDraft({ano:item.ano,mes:item.mes,link:item.link,publicado:item.publicado});setEditor(true);setNotice(null);}
 async function save(e:FormEvent){e.preventDefault();setBusy(true);setNotice(null);try{
  await request(categoria,editing?'/'+editing:'',editing?'PATCH':'POST',draft);await reload();setEditor(false);setNotice({text:'Competência salva com sucesso.',error:false});
 }catch(error){setNotice({text:String(error),error:true});}finally{setBusy(false);}}
 async function remove(item:Entry){if(!window.confirm('Excluir '+meses[item.mes-1]+'/'+item.ano+'?'))return;setBusy(true);setNotice(null);try{
  await request(categoria,'/'+item.id,'DELETE');await reload();setNotice({text:'Competência excluída.',error:false});
 }catch(error){setNotice({text:String(error),error:true});}finally{setBusy(false);}}
 return <div className="admin-dashboard payroll-admin">
  <div className="admin-dashboard-header"><div><span className="admin-kicker">TRANSPARÊNCIA · FOLHA DE PAGAMENTO</span><h1>{info.nome}</h1><p>Cadastre a competência e o link oficial de cada demonstrativo mensal.</p></div><div className="admin-dashboard-actions"><Link className="admin-button admin-button-outline" href="/admin/transparencia/folha-de-pagamento">← Categorias</Link><Link className="admin-button admin-button-outline" href={'/transparencia/folha-de-pagamento/'+categoria} target="_blank">Ver página ↗</Link>{canEdit&&<button className="admin-button admin-button-primary" type="button" onClick={create}>+ Nova competência</button>}</div></div>
  {notice&&<div className={'admin-alert '+(notice.error?'admin-alert-error':'admin-alert-ok')} role={notice.error?'alert':'status'}>{notice.text}<button type="button" aria-label="Fechar aviso" onClick={()=>setNotice(null)}>×</button></div>}
  <div className="admin-stats"><div className="admin-stat"><span>Competências cadastradas</span><strong>{items.length}</strong><small>Total da categoria</small></div><div className="admin-stat"><span>Publicadas</span><strong>{items.filter(x=>x.publicado).length}</strong><small>Disponíveis ao cidadão</small></div><div className="admin-stat"><span>Rascunhos</span><strong>{items.filter(x=>!x.publicado).length}</strong><small>Não aparecem no portal</small></div><div className="admin-stat"><span>Exercícios</span><strong>{years.length}</strong><small>Anos com registros</small></div></div>
  {editor&&<section className="admin-panel payroll-admin-editor"><div className="admin-panel-title"><div><span className="admin-step">{editing?'EDITAR COMPETÊNCIA':'NOVA COMPETÊNCIA'}</span><h2>{editing?'Editar folha':'Cadastrar folha de pagamento'}</h2><p>Uma competência por mês e ano em cada categoria.</p></div></div><form className="payroll-admin-form" onSubmit={save}>
   <div className="admin-two-fields"><div className="admin-field"><label htmlFor="folha-ano">Ano <b>*</b></label><input id="folha-ano" type="number" required min="1900" max="2200" value={draft.ano} onChange={e=>setDraft(p=>({...p,ano:Number(e.target.value)}))}/></div><div className="admin-field"><label htmlFor="folha-mes">Mês <b>*</b></label><select id="folha-mes" value={draft.mes} onChange={e=>setDraft(p=>({...p,mes:Number(e.target.value)}))}>{meses.map((m,index)=><option key={m} value={index+1}>{m}</option>)}</select></div></div>
   <div className="admin-field"><label htmlFor="folha-link">Link do documento <b>*</b></label><input id="folha-link" type="url" pattern="https?://.+" required maxLength={2048} placeholder="https://.../folha.pdf" value={draft.link} onChange={e=>setDraft(p=>({...p,link:e.target.value}))}/><small>Informe um endereço público válido para o documento.</small></div>
   <label className="admin-check"><input type="checkbox" checked={draft.publicado} onChange={e=>setDraft(p=>({...p,publicado:e.target.checked}))}/> Publicar competência no portal</label>
   <div className="health-admin-actions"><button type="submit" className="admin-button admin-button-primary" disabled={busy}>{busy?'Salvando...':'Salvar competência'}</button><button type="button" className="admin-button admin-button-outline" onClick={()=>setEditor(false)}>Cancelar</button></div>
  </form></section>}
  <section className="admin-panel"><div className="admin-panel-title"><div><h2>Competências cadastradas</h2><p>Ordenadas do mês mais recente para o mais antigo.</p></div><span className="admin-results">{filtered.length} resultado(s)</span></div>
   <div className="admin-toolbar acts-filters"><select aria-label="Filtrar exercício" value={filter} onChange={e=>setFilter(e.target.value)}><option value="">Todos os exercícios</option>{years.map(y=><option key={y} value={y}>{y}</option>)}</select></div>
   {loading?<div className="admin-empty">Carregando competências...</div>:filtered.length===0?<div className="admin-empty"><h3>Nenhuma competência encontrada</h3><p>Cadastre a primeira folha ou altere o filtro.</p></div>:<div className="admin-table-scroll"><table className="admin-pages-table"><thead><tr><th>Competência</th><th>Exercício</th><th>Situação</th><th>Documento</th><th>Ações</th></tr></thead><tbody>{filtered.map(x=><tr key={x.id}><td><strong>{meses[x.mes-1]}</strong></td><td>{x.ano}</td><td><span className={'acts-status '+(x.publicado?'is-public':'')}>{x.publicado?'Publicado':'Rascunho'}</span></td><td><a href={x.link} target="_blank" rel="noopener noreferrer">Visualizar ↗</a></td><td><div className="admin-row-actions">{canEdit&&<><button type="button" onClick={()=>edit(x)}>Editar</button><button type="button" className="admin-danger-link" disabled={busy} onClick={()=>void remove(x)}>Excluir</button></>}</div></td></tr>)}</tbody></table></div>}
  </section>
 </div>;
}
