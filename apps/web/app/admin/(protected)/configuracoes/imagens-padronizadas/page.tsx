'use client';
import {useEffect,useState,type FormEvent} from 'react';
import Link from 'next/link';
type Category={id:string;nome:string;slug:string;capaArquivo:string|null};
type Cover={file:string;mime:string;version:number};
export default function ImagensPadronizadas(){
 const [cover,setCover]=useState<Cover|null>(null),[file,setFile]=useState<File|null>(null);
 const [banner,setBanner]=useState<Cover|null>(null),[bannerFile,setBannerFile]=useState<File|null>(null),[bannerBusy,setBannerBusy]=useState(false);
 const [categories,setCategories]=useState<Category[]>([]);
 const [categoryFiles,setCategoryFiles]=useState<Record<string,File|null>>({});
 const [savingCategory,setSavingCategory]=useState<string|null>(null);
 const [role,setRole]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
 const [message,setMessage]=useState<{error:boolean;text:string}|null>(null);
 useEffect(()=>{let active=true;(async()=>{try{
  const session=await fetch('/api/admin-session',{cache:'no-store'});
  if(!session.ok){window.location.assign('/admin/login');return;}
  const [user,data,groups]=await Promise.all([session.json() as Promise<{papel:string}>,fetch('/api/admin-imagens-padronizadas',{cache:'no-store'}).then(r=>r.json() as Promise<{capaComunicados:Cover|null;bannerHome:Cover|null}>),fetch('/api/admin-proxy/admin/comunicados/categorias',{cache:'no-store'}).then(r=>r.ok?r.json() as Promise<Category[]>:Promise.resolve([] as Category[]))]);
  if(active){setRole(user.papel);setCover(data.capaComunicados);setBanner(data.bannerHome);setCategories(groups);}
 }catch(e){if(active)setMessage({text:String(e),error:true});}finally{if(active)setLoading(false);}})();return()=>{active=false};},[]);
 async function upload(e:FormEvent){e.preventDefault();if(!file)return;setBusy(true);setMessage(null);
  try{const form=new FormData();form.append('arquivo',file);
   const res=await fetch('/api/admin-imagens-padronizadas',{method:'POST',body:form});
   const data=await res.json() as {capaComunicados?:Cover;error?:string};
   if(!res.ok||!data.capaComunicados)throw Error(data.error||'Falha ao enviar imagem');
   setCover(data.capaComunicados);setFile(null);
   setMessage({text:'Capa padrão atualizada para os comunicados.',error:false});
  }catch(e){setMessage({text:String(e),error:true});}finally{setBusy(false);}
 }

 async function uploadBanner(e:FormEvent){
  e.preventDefault();if(!bannerFile)return;
  setBannerBusy(true);setMessage(null);
  try{
   if(bannerFile.size>4*1024*1024)throw new Error('O arquivo deve ter no máximo 4 MB.');
   const dimensions=await new Promise<{width:number;height:number}>((resolve,reject)=>{
    const img=new Image(),url=URL.createObjectURL(bannerFile);
    img.onload=()=>{const result={width:img.naturalWidth,height:img.naturalHeight};URL.revokeObjectURL(url);resolve(result);};
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Não foi possível ler a imagem.'));};
    img.src=url;
   });
   if(dimensions.width!==1600||dimensions.height!==600)throw new Error('O banner deve ter exatamente 1600 × 600 pixels.');
   const form=new FormData();form.append('tipo','banner-home');form.append('arquivo',bannerFile);
   const response=await fetch('/api/admin-imagens-padronizadas',{method:'POST',body:form});
   const data=await response.json() as {bannerHome?:Cover;error?:string};
   if(!response.ok||!data.bannerHome)throw new Error(data.error||'Falha ao enviar banner');
   setBanner(data.bannerHome);setBannerFile(null);
   setMessage({error:false,text:'Banner da página inicial atualizado com sucesso.'});
  }catch(error){setMessage({error:true,text:error instanceof Error?error.message:'Falha no envio do banner'});}
  finally{setBannerBusy(false);}
 }

 async function saveCategoryCover(category:Category){
  const chosen=categoryFiles[category.id];if(!chosen)return;
  setSavingCategory(category.id);setMessage(null);
  try{
   if(chosen.size>4*1024*1024)throw Error('Imagem deve ter no máximo 4 MB');
   const form=new FormData();form.append('arquivo',chosen);
   const upload=await fetch('/api/admin-capa-comunicado',{method:'POST',body:form});
   const result=await upload.json() as {arquivo?:string;error?:string};
   if(!upload.ok||!result.arquivo)throw Error(result.error||'Erro ao enviar capa');
   const response=await fetch('/api/admin-proxy/admin/comunicados/categorias/'+category.id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome:category.nome,slug:category.slug,capaArquivo:result.arquivo})});
   if(!response.ok)throw Error('Não foi possível vincular a capa à categoria.');
   setCategories(current=>current.map(item=>item.id===category.id?{...item,capaArquivo:result.arquivo!}:item));
   setCategoryFiles(current=>({...current,[category.id]:null}));
   setMessage({error:false,text:'Capa da categoria '+category.nome+' atualizada.'});
  }catch(e){setMessage({error:true,text:String(e)});}finally{setSavingCategory(null);}
 }
 return <div className="admin-dashboard"><div className="admin-dashboard-header"><div><span className="admin-kicker">CONFIGURAÇÕES / PORTAL</span><h1>Imagens padronizadas</h1><p>Gerencie os elementos visuais usados automaticamente nos conteúdos do portal.</p></div></div>
 {message&&<div className={'admin-alert '+(message.error?'admin-alert-error':'admin-alert-ok')}>{message.text}</div>}

 <section className="admin-panel home-banner-admin-panel">
  <div className="admin-panel-title"><div><span className="admin-step">PÁGINA INICIAL</span><h2>Banner da home</h2><p>Imagem institucional exibida imediatamente abaixo do header, antes do conteúdo da página inicial.</p></div></div>
  <div className="home-banner-admin-content">
   <div className="home-banner-admin-preview">{banner?<img src={'/api/banner-home?v='+banner.version} alt="Banner atual da página inicial"/>:<div className="home-banner-admin-empty"><strong>Banner não configurado</strong><span>Envie uma imagem para ativar esta seção na home.</span></div>}</div>
   {!loading&&(role==='ADMINISTRADOR'||role==='GESTOR')&&<form onSubmit={e=>void uploadBanner(e)} className="standard-cover-form">
    <label htmlFor="banner-home-file">Imagem do banner</label>
    <input id="banner-home-file" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setBannerFile(e.target.files?.[0]||null)}/>
    <small>Resolução obrigatória: <strong>1600 × 600 pixels</strong> (proporção 8:3). PNG, JPG ou WebP, até 4 MB.</small>
    <button type="submit" className="admin-button admin-button-primary" disabled={!bannerFile||bannerBusy}>{bannerBusy?'Enviando banner...':'Salvar banner da home'}</button>
   </form>}
  </div>
 </section>
 <div className="admin-panel standard-cover-panel"><div className="admin-panel-title"><div><span className="admin-step">COMUNICADOS</span><h2>Capa padrão dos comunicados</h2><p>Essa imagem será exibida na home, na lista de comunicados e nas páginas individuais.</p></div></div>
 <div className="standard-cover-content">
  <div className="standard-cover-preview">{cover?<img src={'/api/capa-comunicados?v='+cover.version} alt="Capa padrão atual dos comunicados"/>:<span>Nenhuma capa configurada</span>}</div>
  {!loading&&(role==='ADMINISTRADOR'||role==='GESTOR')&&<form onSubmit={upload} className="standard-cover-form"><label htmlFor="cover-file">Selecionar imagem</label><input id="cover-file" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setFile(e.target.files?.[0]||null)}/><small>PNG, JPG ou WebP — até 4 MB. Recomendado: 1600 × 900 pixels (16:9).</small><button type="submit" className="admin-button admin-button-primary" disabled={!file||busy}>{busy?'Enviando...':'Salvar imagem padrão'}</button></form>}
 </div></div>
 <section className="admin-panel standard-categories-panel"><div className="admin-panel-title"><div><span className="admin-step">CAPAS POR CATEGORIA</span><h2>Imagens padrão das categorias</h2><p>Cada categoria pode ter sua própria capa. Comunicados sem capa exclusiva usam a capa da categoria e, na ausência desta, a imagem geral acima.</p></div><Link className="admin-button admin-button-outline" href="/admin/comunicados/categorias">Gerenciar categorias →</Link></div>
 <div className="standard-category-grid">{categories.length?categories.map(category=><div className="standard-category-card" key={category.id}>
  <div className="standard-category-image">{category.capaArquivo?<img src={'/api/capas-comunicados/'+category.capaArquivo} alt={'Capa da categoria '+category.nome}/>:cover?<img src={'/api/capa-comunicados?v='+cover.version} alt="Capa geral aplicada provisoriamente"/>:<span>Sem imagem padrão</span>}</div>
  <div><strong>{category.nome}</strong><small>{category.capaArquivo?'Capa exclusiva da categoria':'Usa a capa geral'}</small></div>
  {(role==='ADMINISTRADOR'||role==='GESTOR')&&<div className="standard-category-upload"><input aria-label={'Enviar capa para '+category.nome} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setCategoryFiles(p=>({...p,[category.id]:e.target.files?.[0]||null}))}/><button className="admin-button admin-button-outline" type="button" disabled={!categoryFiles[category.id]||savingCategory!==null} onClick={()=>void saveCategoryCover(category)}>{savingCategory===category.id?'Enviando...':'Salvar capa'}</button></div>}
 </div>):<div className="admin-empty">Nenhuma categoria cadastrada. <Link href="/admin/comunicados/categorias">Criar primeira categoria →</Link></div>}</div>
 </section></div>;
}
