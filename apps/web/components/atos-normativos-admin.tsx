'use client';
import {useEffect,useMemo,useState,type FormEvent} from 'react';
import Link from 'next/link';
type Tipo='leis'|'decretos'|'portarias';
type Ato={id:string;ano:number;numero:string;titulo:string;ementa:string|null;processo:string|null;link:string;acao:'BAIXAR'|'VISUALIZAR';publicado:boolean};
type Draft=Omit<Ato,'id'>;
const config:{[K in Tipo]:string}={leis:'Leis Municipais',decretos:'Decretos Municipais',portarias:'Portarias Municipais'};
const newDraft=():Draft=>({ano:Number(new Intl.DateTimeFormat('en-US',{year:'numeric',timeZone:'America/Sao_Paulo'}).format(new Date())),numero:'',titulo:'',ementa:null,processo:null,link:'',acao:'VISUALIZAR',publicado:true});
async function api<T>(tipo:Tipo,path='',method='GET',body?:unknown){
 const response=await fetch('/api/admin-proxy/admin/atos-normativos/'+tipo+path,{method,cache:'no-store',headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 if(response.status===401){window.location.assign('/admin/login');throw Error('Sessão expirada');}
 if(!response.ok)throw Error('Erro '+response.status+': '+(await response.text()).slice(0,350));
 return response.json() as Promise<T>;
}
export function AtosNormativosAdmin({tipo}:{tipo:Tipo}){
 const [items,setItems]=useState<Ato[]>([]);
 const [user,setUser]=useState<{papel:string}|null>(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState<{text:string;error:boolean}|null>(null);
 const [search,setSearch]=useState('');
 const [year,setYear]=useState('');
 const [editor,setEditor]=useState(false);
 const [editing,setEditing]=useState<string|null>(null);
 const [draft,setDraft]=useState<Draft>(newDraft);
 const canEdit=user?.papel==='ADMINISTRADOR'||user?.papel==='GESTOR';
 async function refresh(){setItems(await api<Ato[]>(tipo));}
 useEffect(()=>{let alive=true;(async()=>{try{
  const session=await fetch('/api/admin-session',{cache:'no-store'});
  if(!session.ok){window.location.assign('/admin/login');return;}
  const [actor,data]=await Promise.all([session.json() as Promise<{papel:string}>,api<Ato[]>(tipo)]);
  if(alive){setUser(actor);setItems(data);}
 }catch(e){if(alive)setNotice({text:String(e),error:true});}finally{if(alive)setLoading(false);}})();return()=>{alive=false;};},[tipo]);
 const years=useMemo(()=>[...new Set(items.map(i=>i.ano))].sort((a,b)=>b-a),[items]);
 const filtered=useMemo(()=>items.filter(i=>(!year||String(i.ano)===year)&&(!search||(i.numero+' '+i.titulo+' '+(i.ementa||'')+' '+(i.processo||'')).toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR')))),[items,year,search]);
 function start(){setEditing(null);setDraft(newDraft());setEditor(true);setNotice(null);window.scrollTo({top:0,behavior:'smooth'});}
 function edit(item:Ato){const {id,...data}=item;setEditing(id);setDraft(data);setEditor(true);setNotice(null);window.scrollTo({top:0,behavior:'smooth'});}
 async function save(e:FormEvent){e.preventDefault();setBusy(true);setNotice(null);try{await api(tipo,editing?'/'+editing:'',editing?'PATCH':'POST',draft);await refresh();setEditor(false);setNotice({text:'Documento salvo com sucesso.',error:false});}catch(e){setNotice({text:String(e),error:true});}finally{setBusy(false);}}
 async function remove(i:Ato){if(!window.confirm('Excluir o documento '+i.numero+'/'+i.ano+'?'))return;setBusy(true);setNotice(null);try{await api(tipo,'/'+i.id,'DELETE');await refresh();setNotice({text:'Documento excluído.',error:false});}catch(e){setNotice({text:String(e),error:true});}finally{setBusy(false);}}
 function change<K extends keyof Draft>(key:K,value:Draft[K]){setDraft(prev=>({...prev,[key]:value}));}
 return <div className="admin-dashboard acts-admin">
  <div className="admin-dashboard-header"><div><span className="admin-kicker">TRANSPARÊNCIA · LEGISLAÇÃO</span><h1>{config[tipo]}</h1><p>Cadastre e mantenha atualizados os documentos oficiais publicados no portal.</p></div><div className="admin-dashboard-actions"><Link href={'/transparencia/'+tipo} target="_blank" className="admin-button admin-button-outline">Ver página pública ↗</Link>{canEdit&&<button type="button" className="admin-button admin-button-primary" onClick={start}>+ Novo documento</button>}</div></div>
  {notice&&<div className={'admin-alert '+(notice.error?'admin-alert-error':'admin-alert-ok')} role={notice.error?'alert':'status'}>{notice.text}<button type="button" onClick={()=>setNotice(null)} aria-label="Fechar aviso">×</button></div>}
  <div className="admin-stats"><div className="admin-stat"><span>Total de documentos</span><strong>{items.length}</strong><small>Incluindo rascunhos</small></div><div className="admin-stat"><span>Publicados</span><strong>{items.filter(i=>i.publicado).length}</strong><small>Disponíveis aos cidadãos</small></div><div className="admin-stat"><span>Rascunhos</span><strong>{items.filter(i=>!i.publicado).length}</strong><small>Não aparecem no site</small></div><div className="admin-stat"><span>Exercícios</span><strong>{years.length}</strong><small>Anos cadastrados</small></div></div>
  {editor&&<section className="admin-panel acts-editor"><div className="admin-panel-title"><div><span className="admin-step">{editing?'EDIÇÃO':'CADASTRO'}</span><h2>{editing?'Editar documento':'Novo documento'}</h2><p>Informe número, exercício, identificação e link oficial.</p></div></div><form className="acts-form" onSubmit={save}>
   <div className="admin-two-fields"><div className="admin-field"><label htmlFor="ato-ano">Ano <b>*</b></label><input id="ato-ano" type="number" min={1900} max={2200} required value={draft.ano} onChange={e=>change('ano',Number(e.target.value))}/></div><div className="admin-field"><label htmlFor="ato-num">Número <b>*</b></label><input id="ato-num" maxLength={60} required placeholder="Ex.: 1261" value={draft.numero} onChange={e=>change('numero',e.target.value)}/></div></div>
   <div className="admin-field"><label htmlFor="ato-title">Identificação / título <b>*</b></label><input id="ato-title" maxLength={250} required placeholder={tipo==='leis'?'Ex.: Lei nº 1261/2026':tipo==='decretos'?'Ex.: Decreto nº 001/2026':'Ex.: Portaria nº 001/2026'} value={draft.titulo} onChange={e=>change('titulo',e.target.value)}/></div>
   <div className="admin-field"><label htmlFor="ato-ementa">Ementa / descrição</label><textarea id="ato-ementa" rows={4} maxLength={6000} value={draft.ementa||''} onChange={e=>change('ementa',e.target.value||null)} placeholder="Resumo do conteúdo do documento..."/></div>
   <div className="admin-two-fields"><div className="admin-field"><label htmlFor="ato-processo">Processo (opcional)</label><input id="ato-processo" maxLength={160} value={draft.processo||''} onChange={e=>change('processo',e.target.value||null)} placeholder="Número ou referência do processo"/></div><div className="admin-field"><label htmlFor="ato-acao">Tipo de acesso</label><select id="ato-acao" value={draft.acao} onChange={e=>change('acao',e.target.value as Draft['acao'])}><option value="VISUALIZAR">Visualizar</option><option value="BAIXAR">Baixar PDF</option></select></div></div>
   <div className="admin-field"><label htmlFor="ato-link">Link do arquivo <b>*</b></label><input id="ato-link" type="url" required pattern="https?://.+" maxLength={2048} value={draft.link} onChange={e=>change('link',e.target.value)} placeholder="https://portal.gov.br/documento.pdf"/><small>Use um link HTTP(S) público e verificado.</small></div>
   <label className="admin-check"><input type="checkbox" checked={draft.publicado} onChange={e=>change('publicado',e.target.checked)}/> Publicar documento imediatamente</label>
   <div className="health-admin-actions"><button className="admin-button admin-button-primary" type="submit" disabled={busy}>{busy?'Salvando...':editing?'Salvar alterações':'Cadastrar documento'}</button><button type="button" className="admin-button admin-button-outline" onClick={()=>setEditor(false)}>Cancelar</button></div>
  </form></section>}
  <section className="admin-panel"><div className="admin-panel-title"><div><h2>Documentos cadastrados</h2><p>Pesquise por identificação, ementa ou número e filtre por exercício.</p></div><span className="admin-results">{filtered.length} resultado(s)</span></div>
   <div className="admin-toolbar acts-filters"><label className="admin-search-filter"><span aria-hidden="true">⌕</span><input aria-label="Pesquisar documentos" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Número, título, ementa ou processo..."/></label><select aria-label="Filtrar ano" value={year} onChange={e=>setYear(e.target.value)}><option value="">Todos os exercícios</option>{years.map(y=><option key={y} value={y}>{y}</option>)}</select></div>
   {loading?<div className="admin-empty">Carregando documentos...</div>:filtered.length===0?<div className="admin-empty"><h3>Nenhum documento encontrado</h3><p>Cadastre um documento ou ajuste os filtros.</p></div>:<div className="admin-table-scroll"><table className="admin-pages-table"><thead><tr><th>Número / Ano</th><th>Identificação</th><th>Status</th><th>Acesso</th><th>Ações</th></tr></thead><tbody>{filtered.map(i=><tr key={i.id}><td><strong>{i.numero}</strong><span>{i.ano}</span></td><td><strong>{i.titulo}</strong><span>{i.ementa?.slice(0,120)||'Sem ementa'}</span></td><td><span className={'acts-status '+(i.publicado?'is-public':'')}>{i.publicado?'Publicado':'Rascunho'}</span></td><td><a href={i.link} target="_blank" rel="noopener noreferrer">Abrir ↗</a></td><td><div className="admin-row-actions">{canEdit&&<><button type="button" onClick={()=>edit(i)}>Editar</button><button type="button" disabled={busy} className="admin-danger-link" onClick={()=>void remove(i)}>Excluir</button></>}</div></td></tr>)}</tbody></table></div>}
  </section>
 </div>;
}
