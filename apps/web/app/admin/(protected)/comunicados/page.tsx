'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState,type FormEvent} from 'react';
import {RichTextEditor} from '../../../../components/rich-text-editor';
type Item={id:string;titulo:string;slug:string;resumo:string|null;conteudo:string;publicado:boolean;publicadoEm:string|null;atualizadoEm:string};
type Form={titulo:string;slug:string;resumo:string;conteudo:string;publicado:boolean};
const blank:Form={titulo:'',slug:'',resumo:'',conteudo:'',publicado:false};
const slugify=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,185);
async function api<T>(path='',method='GET',body?:unknown):Promise<T>{
 const response=await fetch('/api/admin-proxy/admin/comunicados'+path,{method,cache:'no-store',headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 if(response.status===401){window.location.assign('/admin/login');throw Error('Sua sessão expirou');}
 if(!response.ok)throw Error('Erro '+response.status+': '+(await response.text()).slice(0,450));
 return response.json() as Promise<T>;
}
export default function AdminComunicados(){
 const [items,setItems]=useState<Item[]>([]),[role,setRole]=useState(''),[loading,setLoading]=useState(true);
 const [notice,setNotice]=useState<{error:boolean;text:string}|null>(null),[busy,setBusy]=useState(false);
 const [editor,setEditor]=useState(false),[editing,setEditing]=useState<string|null>(null);
 const [form,setForm]=useState<Form>(blank),[search,setSearch]=useState('');
 const [coverVersion,setCoverVersion]=useState(0),[coverAvailable,setCoverAvailable]=useState(false);
 const canPublish=role==='ADMINISTRADOR'||role==='GESTOR';
 async function refresh(){setItems(await api<Item[]>(''));}
 useEffect(()=>{let alive=true;(async()=>{try{
  const response=await fetch('/api/admin-session',{cache:'no-store'});
  if(!response.ok){window.location.assign('/admin/login');return;}
  const [user,list,images]=await Promise.all([response.json() as Promise<{papel:string}>,api<Item[]>(''),fetch('/api/admin-imagens-padronizadas',{cache:'no-store'}).then(r=>r.json() as Promise<{capaComunicados:{version:number}|null}>).catch(()=>({capaComunicados:null}))]);
  if(alive){setRole(user.papel);setItems(list);setCoverAvailable(Boolean(images.capaComunicados));setCoverVersion(images.capaComunicados?.version||0);}
 }catch(e){if(alive)setNotice({error:true,text:String(e)});}finally{if(alive)setLoading(false);}})();return()=>{alive=false};},[]);
 const filtered=useMemo(()=>items.filter(i=>(i.titulo+' '+i.slug).toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))),[items,search]);
 function start(){setEditing(null);setForm({...blank});setEditor(true);setNotice(null);}
 function edit(item:Item){setEditing(item.id);setForm({titulo:item.titulo,slug:item.slug,resumo:item.resumo||'',conteudo:item.conteudo,publicado:item.publicado});setEditor(true);setNotice(null);}
 function field<K extends keyof Form>(name:K,value:Form[K]){setForm(p=>({...p,[name]:value}));}
 async function save(e:FormEvent){e.preventDefault();setBusy(true);setNotice(null);
  try{
   const payload={...form,slug:slugify(form.slug)||slugify(form.titulo),resumo:form.resumo.trim()||null};
   await api(editing?'/'+editing:'',editing?'PATCH':'POST',payload);
   await refresh();setEditor(false);setNotice({error:false,text:'Comunicado salvo com sucesso.'});
  }catch(e){setNotice({error:true,text:String(e)});}finally{setBusy(false);}
 }
 async function remove(item:Item){if(!window.confirm('Excluir permanentemente "'+item.titulo+'"?'))return;setBusy(true);setNotice(null);
  try{await api('/'+item.id,'DELETE');await refresh();setNotice({error:false,text:'Comunicado excluído.'});}
  catch(e){setNotice({error:true,text:String(e)});}finally{setBusy(false);}
 }
 return <div className="admin-dashboard comunicados-admin">
  <div className="admin-dashboard-header"><div><span className="admin-kicker">COMUNICAÇÃO INSTITUCIONAL</span><h1>Comunicados</h1><p>Publique avisos oficiais com formatação de texto e capa padronizada.</p></div><div className="admin-dashboard-actions"><Link className="admin-button admin-button-outline" href="/admin/configuracoes/imagens-padronizadas">Imagem padrão ↗</Link><Link className="admin-button admin-button-outline" href="/comunicados" target="_blank">Ver página pública ↗</Link><button className="admin-button admin-button-primary" type="button" onClick={start}>+ Novo comunicado</button></div></div>
 {notice&&<div className={'admin-alert '+(notice.error?'admin-alert-error':'admin-alert-ok')} role={notice.error?'alert':'status'}>{notice.text}<button type="button" onClick={()=>setNotice(null)}>×</button></div>}
 <div className="admin-stats"><div className="admin-stat"><span>Total</span><strong>{items.length}</strong><small>Comunicados cadastrados</small></div><div className="admin-stat"><span>Publicados</span><strong>{items.filter(i=>i.publicado).length}</strong><small>Visíveis no site</small></div><div className="admin-stat"><span>Rascunhos</span><strong>{items.filter(i=>!i.publicado).length}</strong><small>Em preparação</small></div><div className="admin-stat"><span>Capa padrão</span><strong className="comunicados-admin-cover-stat">{coverAvailable?'Ativa':'Pendente'}</strong><small>Configuração visual</small></div></div>
 {editor&&<section className="admin-panel comunicados-editor-panel"><div className="admin-panel-title"><div><span className="admin-step">{editing?'EDITAR COMUNICADO':'NOVO COMUNICADO'}</span><h2>{editing?'Editar comunicado':'Cadastrar comunicado'}</h2><p>O conteúdo pode ter subtítulos, negritos, listas e links.</p></div></div>
  <form className="comunicados-admin-form" onSubmit={save}><div className="admin-field"><label htmlFor="notice-title">Título <b>*</b></label><input id="notice-title" required maxLength={180} value={form.titulo} placeholder="Ex.: Aviso sobre atendimento municipal" onChange={e=>setForm(p=>({...p,titulo:e.target.value,slug:(!editing&&p.slug===slugify(p.titulo))?slugify(e.target.value):p.slug}))}/></div>
   <div className="admin-field"><label htmlFor="notice-slug">Endereço da publicação <b>*</b></label><div className="admin-slug"><span>/comunicados/</span><input id="notice-slug" required maxLength={190} value={form.slug} onChange={e=>field('slug',slugify(e.target.value))}/></div></div>
   <div className="admin-field"><label htmlFor="notice-summary">Resumo para os cartões (opcional)</label><textarea id="notice-summary" rows={3} maxLength={400} value={form.resumo} onChange={e=>field('resumo',e.target.value)} placeholder="Apresentação breve do comunicado na home e na listagem..."/></div>
   <div className="admin-field"><label htmlFor="comunicado-conteudo">Descrição / conteúdo <b>*</b></label><RichTextEditor value={form.conteudo} onChange={v=>field('conteudo',v)}/></div>
   <div className="standard-cover-inline"><div className="standard-cover-inline-image">{coverAvailable?<img alt="Capa padrão" src={'/api/capa-comunicados?v='+coverVersion}/>:<span>Capa não configurada</span>}</div><div><strong>Imagem de capa</strong><p>Todos os comunicados utilizam a capa definida nas imagens padronizadas.</p><Link href="/admin/configuracoes/imagens-padronizadas">Gerenciar imagem padrão →</Link></div></div>
   {canPublish?<label className="admin-check"><input type="checkbox" checked={form.publicado} onChange={e=>field('publicado',e.target.checked)}/> Publicar comunicado no site</label>:<p className="comunicados-admin-note">Seu perfil pode salvar rascunhos. A publicação deve ser feita por um gestor.</p>}
   <div className="health-admin-actions"><button className="admin-button admin-button-primary" type="submit" disabled={busy||(!canPublish&&form.publicado)}>{busy?'Salvando...':'Salvar comunicado'}</button><button className="admin-button admin-button-outline" type="button" onClick={()=>setEditor(false)}>Cancelar</button></div>
  </form></section>}
 <section className="admin-panel"><div className="admin-panel-title"><div><h2>Comunicados cadastrados</h2><p>Gerencie comunicados publicados e rascunhos.</p></div><span className="admin-results">{filtered.length} resultado(s)</span></div><div className="admin-toolbar"><label className="admin-search-filter"><span aria-hidden="true">⌕</span><input aria-label="Pesquisar comunicados" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar por título..."/></label></div>
 {loading?<div className="admin-empty">Carregando comunicados...</div>:!filtered.length?<div className="admin-empty"><h3>Nenhum comunicado encontrado</h3><p>Crie um comunicado para começar a publicar notícias da Prefeitura.</p></div>:<div className="admin-table-scroll"><table className="admin-pages-table"><thead><tr><th>Comunicado</th><th>Data</th><th>Status</th><th>Ações</th></tr></thead><tbody>{filtered.map(item=><tr key={item.id}><td><strong>{item.titulo}</strong><span>{item.resumo||item.slug}</span></td><td>{new Intl.DateTimeFormat('pt-BR').format(new Date(item.atualizadoEm))}</td><td><span className={'acts-status '+(item.publicado?'is-public':'')}>{item.publicado?'Publicado':'Rascunho'}</span></td><td><div className="admin-row-actions"><button type="button" onClick={()=>edit(item)}>Editar</button>{item.publicado&&<Link target="_blank" href={'/comunicados/'+item.slug}>Visualizar ↗</Link>}{canPublish&&<button className="admin-danger-link" type="button" disabled={busy} onClick={()=>void remove(item)}>Excluir</button>}</div></td></tr>)}</tbody></table></div>}</section>
 </div>;
}
