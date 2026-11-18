'use client';
import {useEffect,useState,type FormEvent} from 'react';
type Cover={file:string;mime:string;version:number};
export default function ImagensPadronizadas(){
 const [cover,setCover]=useState<Cover|null>(null),[file,setFile]=useState<File|null>(null);
 const [role,setRole]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
 const [message,setMessage]=useState<{error:boolean;text:string}|null>(null);
 useEffect(()=>{let active=true;(async()=>{try{
  const session=await fetch('/api/admin-session',{cache:'no-store'});
  if(!session.ok){window.location.assign('/admin/login');return;}
  const [user,data]=await Promise.all([session.json() as Promise<{papel:string}>,fetch('/api/admin-imagens-padronizadas',{cache:'no-store'}).then(r=>r.json() as Promise<{capaComunicados:Cover|null}>)]);
  if(active){setRole(user.papel);setCover(data.capaComunicados);}
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
 return <div className="admin-dashboard"><div className="admin-dashboard-header"><div><span className="admin-kicker">CONFIGURAÇÕES / PORTAL</span><h1>Imagens padronizadas</h1><p>Gerencie os elementos visuais usados automaticamente nos conteúdos do portal.</p></div></div>
 {message&&<div className={'admin-alert '+(message.error?'admin-alert-error':'admin-alert-ok')}>{message.text}</div>}
 <div className="admin-panel standard-cover-panel"><div className="admin-panel-title"><div><span className="admin-step">COMUNICADOS</span><h2>Capa padrão dos comunicados</h2><p>Essa imagem será exibida na home, na lista de comunicados e nas páginas individuais.</p></div></div>
 <div className="standard-cover-content">
  <div className="standard-cover-preview">{cover?<img src={'/api/capa-comunicados?v='+cover.version} alt="Capa padrão atual dos comunicados"/>:<span>Nenhuma capa configurada</span>}</div>
  {!loading&&(role==='ADMINISTRADOR'||role==='GESTOR')&&<form onSubmit={upload} className="standard-cover-form"><label htmlFor="cover-file">Selecionar imagem</label><input id="cover-file" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setFile(e.target.files?.[0]||null)}/><small>PNG, JPG ou WebP — até 4 MB. Recomendado: 1600 × 900 pixels (16:9).</small><button type="submit" className="admin-button admin-button-primary" disabled={!file||busy}>{busy?'Enviando...':'Salvar imagem padrão'}</button></form>}
 </div></div></div>;
}
