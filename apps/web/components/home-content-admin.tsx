'use client';
import Link from 'next/link';
import {useEffect,useState,type FormEvent,type DragEvent} from 'react';
type Kind='acessos'|'fotos';
type Entry={id:string;titulo:string;ordem:number;ativo:boolean;url?:string;novaGuia?:boolean;arquivo?:string};
type Draft={titulo:string;url:string;novaGuia:boolean;ativo:boolean;arquivo:string};
const blank:Draft={titulo:'',url:'/',novaGuia:false,ativo:true,arquivo:''};
async function request<T>(kind:Kind,path='',method='GET',data?:unknown):Promise<T>{
 const res=await fetch('/api/admin-proxy/admin/home/'+kind+path,{method,cache:'no-store',headers:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data)});
 if(res.status===401){window.location.assign('/admin/login');throw Error('Sessão expirada');}
 if(!res.ok)throw Error('Erro '+res.status+': '+(await res.text()).slice(0,230));
 return res.json() as Promise<T>;
}
export function HomeContentAdmin({kind}:{kind:Kind}){
 const photos=kind==='fotos';
 const maxPhotos=6;
 const [items,setItems]=useState<Entry[]>([]),[loading,setLoading]=useState(true);
 const [draft,setDraft]=useState<Draft>({...blank}),[editing,setEditing]=useState<string|null>(null);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 const [selected,setSelected]=useState<File|null>(null),[dragged,setDragged]=useState<string|null>(null);
 async function reload(){setItems(await request<Entry[]>(kind));}
 useEffect(()=>{let alive=true;request<Entry[]>(kind).then(data=>{if(alive)setItems(data);}).catch(e=>{if(alive)setError(String(e));}).finally(()=>{if(alive)setLoading(false);});return()=>{alive=false};},[kind]);
 function reset(){setDraft({...blank});setEditing(null);setSelected(null);setError('');}
 function edit(item:Entry){setDraft({titulo:item.titulo,url:item.url||'/',novaGuia:item.novaGuia||false,ativo:item.ativo,arquivo:item.arquivo||''});setEditing(item.id);setSelected(null);window.scrollTo({top:0,behavior:'smooth'});}
 async function save(e:FormEvent){e.preventDefault();setBusy(true);setError('');setMessage('');
  try{
   if(photos&&!editing&&items.length>=maxPhotos)throw Error('O limite de 6 imagens foi atingido. Exclua uma foto antes de cadastrar outra.');
   let arquivo=draft.arquivo;
   if(photos&&selected){
    if(selected.size>4*1024*1024)throw Error('Imagem maior que 4 MB');
    const form=new FormData();form.append('arquivo',selected);
    const resp=await fetch('/api/admin-capa-comunicado',{method:'POST',body:form});
    const result=await resp.json() as {arquivo?:string;error?:string};
    if(!resp.ok||!result.arquivo)throw Error(result.error||'Falha no upload');arquivo=result.arquivo;
   }
   if(photos&&!arquivo)throw Error('Selecione uma fotografia da cidade');
   const data=photos?{titulo:draft.titulo,arquivo,ativo:draft.ativo,ordem:editing?items.find(i=>i.id===editing)?.ordem||0:items.length}:{titulo:draft.titulo,url:draft.url,novaGuia:draft.novaGuia,ativo:draft.ativo,ordem:editing?items.find(i=>i.id===editing)?.ordem||0:items.length};
   await request(kind,editing?'/'+editing:'',editing?'PATCH':'POST',data);
   await reload();reset();setMessage('Registro salvo com sucesso.');
  }catch(e){setError(String(e));}finally{setBusy(false);}
 }
 async function remove(item:Entry){if(!window.confirm('Excluir "'+item.titulo+'"?'))return;setBusy(true);setError('');
  try{await request(kind,'/'+item.id,'DELETE');await reload();setMessage('Registro excluído.');if(editing===item.id)reset();}
  catch(e){setError(String(e));}finally{setBusy(false);}
 }
 async function order(target:string){
  if(!dragged||dragged===target)return;
  const arr=[...items],from=arr.findIndex(x=>x.id===dragged),to=arr.findIndex(x=>x.id===target);
  if(from<0||to<0)return;
  const [item]=arr.splice(from,1);arr.splice(to,0,item);setItems(arr);setDragged(null);
  try{await request(kind,'/ordenar','POST',{ids:arr.map(x=>x.id)});await reload();}
  catch(e){setError(String(e));await reload();}
 }
 function onDrop(e:DragEvent<HTMLElement>,id:string){e.preventDefault();void order(id);}
 return <div className="admin-dashboard home-content-admin">
  <div className="admin-dashboard-header"><div><span className="admin-kicker">CONTEÚDO / PÁGINA INICIAL</span><h1>{photos?'Imagens da Cidade':'Acesso Rápido'}</h1><p>{photos?'Selecione e ordene até 6 fotografias para o carrossel da página inicial.':'Gerencie os atalhos objetivos e sem descrições na página inicial.'}</p></div><Link href="/" target="_blank" className="admin-button admin-button-outline">Ver home ↗</Link></div>
  {error&&<div className="admin-alert admin-alert-error" role="alert">{error}</div>}{message&&<div className="admin-alert admin-alert-ok" role="status">{message}</div>}
  {photos&&<div className="home-photo-limit"><span><strong>{items.length} de 6</strong> imagens cadastradas</span><div className="home-photo-limit-meter" role="progressbar" aria-label="Imagens cadastradas" aria-valuenow={Math.min(items.length,6)} aria-valuemin={0} aria-valuemax={6}><span style={{width:Math.min(items.length/6*100,100)+'%'}}/></div>{items.length>=6&&<small>Limite atingido: exclua uma foto para incluir outra.</small>}</div>}
  <section className="admin-panel home-content-editor"><div className="admin-panel-title"><div><span className="admin-step">{editing?'EDIÇÃO':'NOVO ITEM'}</span><h2>{editing?'Editar item':photos?'Adicionar fotografia':'Adicionar acesso rápido'}</h2></div></div>
  <form className="home-content-form" onSubmit={save}>
   <div className="admin-field"><label htmlFor="hc-title">{photos?'Título / legenda da foto':'Nome do acesso'} <b>*</b></label><input id="hc-title" maxLength={photos?130:110} required value={draft.titulo} onChange={e=>setDraft(p=>({...p,titulo:e.target.value}))} placeholder={photos?'Ex.: Praça central de Guarará':'Ex.: Portal da Transparência'}/></div>
   {photos?<div className="admin-field"><label htmlFor="hc-photo">Foto da cidade {editing?'':'*'}</label><input id="hc-photo" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setSelected(e.target.files?.[0]||null)}/><small>PNG, JPG ou WebP, até 4 MB. Prefira fotografias horizontais.</small>{draft.arquivo&&<img className="hc-photo-preview" src={'/api/capas-comunicados/'+draft.arquivo} alt="Imagem atual"/>}</div>:<><div className="admin-field"><label htmlFor="hc-url">Link <b>*</b></label><input id="hc-url" value={draft.url} required onChange={e=>setDraft(p=>({...p,url:e.target.value}))} placeholder="/transparencia ou https://..."/></div><label className="admin-check"><input type="checkbox" checked={draft.novaGuia} onChange={e=>setDraft(p=>({...p,novaGuia:e.target.checked}))}/> Abrir em nova guia</label></>}
   <label className="admin-check"><input type="checkbox" checked={draft.ativo} onChange={e=>setDraft(p=>({...p,ativo:e.target.checked}))}/> Exibir na página pública</label>
   <div className="health-admin-actions"><button type="submit" disabled={busy||(photos&&!editing&&items.length>=maxPhotos)} className="admin-button admin-button-primary">{busy?'Salvando...':editing?'Salvar alterações':'Cadastrar item'}</button>{editing&&<button className="admin-button admin-button-outline" type="button" onClick={reset}>Cancelar edição</button>}</div>
  </form></section>
  <section className="admin-panel"><div className="admin-panel-title"><div><h2>Itens cadastrados</h2><p>Arraste pelo marcador para alterar a ordem de exibição.</p></div><span className="admin-results">{items.length} item(ns)</span></div>
   {loading?<div className="admin-empty">Carregando itens...</div>:items.length?<div className="home-admin-list">{items.map(item=><div key={item.id} className={'home-admin-item'+(dragged===item.id?' is-dragging':'')} draggable onDragStart={e=>{e.dataTransfer.effectAllowed='move';setDragged(item.id);}} onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(e,item.id)} onDragEnd={()=>setDragged(null)}>
    <span className="home-admin-grip" aria-label="Arrastar para ordenar" title="Arrastar para ordenar">⠿</span>
    {photos&&item.arquivo&&<img className="home-admin-thumb" src={'/api/capas-comunicados/'+item.arquivo} alt=""/>}
    <div className="home-admin-item-info"><strong>{item.titulo}</strong><small>{photos?'Foto do carrossel':item.url} · {item.ativo?'Visível':'Oculto'}</small></div>
    <div className="admin-row-actions"><button type="button" onClick={()=>edit(item)}>Editar</button><button className="admin-danger-link" type="button" disabled={busy} onClick={()=>void remove(item)}>Excluir</button></div>
   </div>)}</div>:<div className="admin-empty">Nenhum item cadastrado ainda.</div>}
  </section>
 </div>;
}
