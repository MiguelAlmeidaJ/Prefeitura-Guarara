'use client';
import Link from 'next/link';
import {useEffect,useState,type FormEvent} from 'react';
type Category={id:string;nome:string;slug:string;capaArquivo:string|null;_count:{comunicados:number}};
type Draft={nome:string;slug:string;capaArquivo:string|null};
const slugify=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,105);
async function req<T>(path='',method='GET',body?:unknown):Promise<T>{
 const response=await fetch('/api/admin-proxy/admin/comunicados/categorias'+path,{method,headers:{'Content-Type':'application/json'},cache:'no-store',body:body===undefined?undefined:JSON.stringify(body)});
 if(response.status===401){window.location.assign('/admin/login');throw Error('Sua sessão expirou');}
 if(!response.ok){const message=await response.text();throw Error('Erro '+response.status+': '+message.slice(0,240));}
 return response.json() as Promise<T>;
}
export default function CategoriasComunicados(){
 const [items,setItems]=useState<Category[]>([]);
 const [role,setRole]=useState('');
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const [editing,setEditing]=useState<string|null>(null),[draft,setDraft]=useState<Draft>({nome:'',slug:'',capaArquivo:null});
 const [file,setFile]=useState<File|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const canManage=role==='ADMINISTRADOR'||role==='GESTOR';
 async function reload(){setItems(await req<Category[]>());}
 useEffect(()=>{let active=true;(async()=>{try{
  const session=await fetch('/api/admin-session',{cache:'no-store'});
  if(!session.ok){window.location.assign('/admin/login');return;}
  const [user,records]=await Promise.all([session.json() as Promise<{papel:string}>,req<Category[]>()]);
  if(active){setItems(records);setRole(user.papel);}
 }catch(e){if(active)setError(String(e));}finally{if(active)setLoading(false);}})();return()=>{active=false};},[]);
 function reset(){setEditing(null);setDraft({nome:'',slug:'',capaArquivo:null});setFile(null);setError('');}
 function edit(item:Category){setEditing(item.id);setDraft({nome:item.nome,slug:item.slug,capaArquivo:item.capaArquivo});setFile(null);setError('');window.scrollTo({top:0,behavior:'smooth'});}
 async function save(event:FormEvent){event.preventDefault();setBusy(true);setError('');setNotice('');
  try{
   let capaArquivo=draft.capaArquivo;
   if(file){
    if(file.size>4*1024*1024)throw Error('Capa deve ter no máximo 4 MB.');
    const body=new FormData();body.append('arquivo',file);
    const response=await fetch('/api/admin-capa-comunicado',{method:'POST',body});
    const data=await response.json() as {arquivo?:string;error?:string};
    if(!response.ok||!data.arquivo)throw Error(data.error||'Falha no envio da capa');
    capaArquivo=data.arquivo;
   }
   await req(editing?'/'+editing:'',editing?'PATCH':'POST',{...draft,slug:slugify(draft.slug||draft.nome),capaArquivo});
   await reload();reset();setNotice('Categoria salva com sucesso.');
  }catch(e){setError(String(e));}finally{setBusy(false);}
 }
 async function remove(item:Category){
  if(!window.confirm('Excluir a categoria '+item.nome+'?'))return;
  setBusy(true);setError('');setNotice('');
  try{await req('/'+item.id,'DELETE');await reload();if(editing===item.id)reset();setNotice('Categoria excluída.');}
  catch(e){setError(String(e));}finally{setBusy(false);}
 }
 return <div className="admin-dashboard categories-admin">
  <div className="admin-dashboard-header"><div><span className="admin-kicker">COMUNICAÇÃO INSTITUCIONAL</span><h1>Categorias dos comunicados</h1><p>Organize as notícias oficiais e defina uma imagem de capa padrão para cada categoria.</p></div><div className="admin-dashboard-actions"><Link className="admin-button admin-button-outline" href="/admin/comunicados">← Comunicados</Link></div></div>
  {error&&<div className="admin-alert admin-alert-error" role="alert">{error}</div>}
  {notice&&<div className="admin-alert admin-alert-ok" role="status">{notice}</div>}
  {canManage&&<section className="admin-panel categories-editor">
   <div className="admin-panel-title"><div><span className="admin-step">{editing?'EDITAR CATEGORIA':'NOVA CATEGORIA'}</span><h2>{editing?'Atualizar categoria':'Cadastrar categoria'}</h2><p>Ex.: Avisos, Educação, Saúde, Licitações.</p></div></div>
   <form className="categories-form" onSubmit={save}>
    <div className="admin-two-fields"><div className="admin-field"><label htmlFor="category-name">Nome <b>*</b></label><input id="category-name" required maxLength={100} value={draft.nome} onChange={e=>setDraft(p=>({...p,nome:e.target.value,slug:!editing&&p.slug===slugify(p.nome)?slugify(e.target.value):p.slug}))}/></div><div className="admin-field"><label htmlFor="category-slug">Identificador <b>*</b></label><input id="category-slug" required value={draft.slug} maxLength={110} onChange={e=>setDraft(p=>({...p,slug:slugify(e.target.value)}))}/></div></div>
    <div className="admin-field"><label htmlFor="category-cover-file">Capa padrão da categoria (opcional)</label><input id="category-cover-file" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setFile(e.target.files?.[0]||null)}/><small>PNG, JPG ou WebP; máximo 4 MB, proporção recomendada 16:9.</small></div>
    {draft.capaArquivo&&<div className="category-current-image"><img src={'/api/capas-comunicados/'+draft.capaArquivo} alt="Capa atual da categoria"/><button type="button" className="admin-button admin-button-outline" onClick={()=>{setDraft(p=>({...p,capaArquivo:null}));setFile(null);}}>Retirar capa</button></div>}
    <div className="health-admin-actions"><button className="admin-button admin-button-primary" disabled={busy} type="submit">{busy?'Salvando...':editing?'Salvar alterações':'Criar categoria'}</button>{editing&&<button type="button" className="admin-button admin-button-outline" onClick={reset}>Cancelar edição</button>}</div>
   </form>
  </section>}
  <section className="admin-panel"><div className="admin-panel-title"><div><h2>Categorias cadastradas</h2><p>A exclusão fica bloqueada enquanto houver comunicados vinculados.</p></div><span className="admin-results">{items.length} categoria(s)</span></div>
  {loading?<div className="admin-empty">Carregando categorias...</div>:items.length===0?<div className="admin-empty"><h3>Nenhuma categoria cadastrada</h3><p>Crie uma categoria para atribuir capas padrão diferentes aos comunicados.</p></div>:<div className="categories-list">{items.map(item=><div className="categories-row" key={item.id}>
   <div className="categories-thumb">{item.capaArquivo?<img src={'/api/capas-comunicados/'+item.capaArquivo} alt=""/>:<span>Sem capa</span>}</div>
   <div className="categories-info"><strong>{item.nome}</strong><small>{item._count.comunicados} comunicado(s) · /{item.slug}</small></div>
   {canManage&&<div className="admin-row-actions"><button type="button" onClick={()=>edit(item)}>Editar</button><button type="button" disabled={busy||item._count.comunicados>0} className="admin-danger-link" onClick={()=>void remove(item)}>Excluir</button></div>}
  </div>)}</div>}
  </section>
 </div>;
}
