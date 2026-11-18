'use client';
import {useEffect,useState,type ChangeEvent} from 'react';
type Asset={file:string;mime:string;version:number};
type Identity={logo:Asset|null;favicon:Asset|null};
const accepts={logo:'image/png,image/jpeg,image/webp',favicon:'image/png,image/jpeg,image/webp,image/x-icon,.ico'};
export default function IdentidadePage(){
 const [identity,setIdentity]=useState<Identity>({logo:null,favicon:null});
 const [role,setRole]=useState('');
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState<'logo'|'favicon'|null>(null);
 const [message,setMessage]=useState<{error:boolean;text:string}|null>(null);
 const [files,setFiles]=useState<{logo:File|null;favicon:File|null}>({logo:null,favicon:null});
 useEffect(()=>{let active=true;(async()=>{try{
  const session=await fetch('/api/admin-session',{cache:'no-store'});
  if(!session.ok){window.location.assign('/admin/login');return;}
  const [actor,config]=await Promise.all([session.json() as Promise<{papel:string}>,fetch('/api/admin-identidade',{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error('Não foi possível carregar identidade');return r.json() as Promise<Identity>})]);
  if(active){setRole(actor.papel);setIdentity(config);}
 }catch(error){if(active)setMessage({error:true,text:String(error)});}finally{if(active)setLoading(false);}})();return()=>{active=false;};},[]);
 const canEdit=role==='ADMINISTRADOR'||role==='GESTOR';
 function choose(kind:'logo'|'favicon',event:ChangeEvent<HTMLInputElement>){setFiles(p=>({...p,[kind]:event.target.files?.[0]||null}));setMessage(null);}
 async function send(kind:'logo'|'favicon'){
  const file=files[kind];if(!file)return;
  setBusy(kind);setMessage(null);
  try{
   const form=new FormData();form.append('tipo',kind);form.append('arquivo',file);
   const res=await fetch('/api/admin-identidade',{method:'POST',body:form});
   if(!res.ok){const data=await res.json() as {error?:string};throw Error(data.error||'Falha ao enviar arquivo');}
   setIdentity(await res.json() as Identity);setFiles(p=>({...p,[kind]:null}));
   setMessage({error:false,text:(kind==='logo'?'Logo':'Favicon')+' atualizado com sucesso. Atualize a página pública para conferir.'});
  }catch(e){setMessage({error:true,text:String(e)});}finally{setBusy(null);}
 }
 return <div className="admin-dashboard identity-admin"><div className="admin-dashboard-header"><div><span className="admin-kicker">CONFIGURAÇÕES DO PORTAL</span><h1>Identidade visual</h1><p>Personalize a marca e o ícone exibidos no site oficial de Guarará.</p></div></div>
 {message&&<div className={'admin-alert '+(message.error?'admin-alert-error':'admin-alert-ok')} role={message.error?'alert':'status'}>{message.text}<button type="button" aria-label="Fechar mensagem" onClick={()=>setMessage(null)}>×</button></div>}
 {loading?<div className="admin-panel identity-loading">Carregando configurações...</div>:<div className="identity-admin-grid">{(['logo','favicon'] as const).map(kind=><section className="admin-panel identity-admin-card" key={kind}>
  <div className="admin-panel-title"><div><span className="admin-step">{kind==='logo'?'MARCA INSTITUCIONAL':'ÍCONE DO NAVEGADOR'}</span><h2>{kind==='logo'?'Logo oficial':'Favicon'}</h2><p>{kind==='logo'?'Será exibida no cabeçalho público.':'Será exibido na aba do navegador e nos favoritos.'}</p></div></div>
  <div className="identity-preview">{identity[kind]?<img alt={kind==='logo'?'Logo atual':'Favicon atual'} src={'/api/identidade/'+kind+'?v='+identity[kind]!.version} />:<div className="identity-preview-empty">{kind==='logo'?'Nenhuma logo enviada':'Usando ícone padrão G'}</div>}</div>
  {canEdit&&<div className="identity-upload-area"><label htmlFor={'upload-'+kind}>Escolher {kind==='logo'?'logo':'favicon'}</label><input id={'upload-'+kind} type="file" accept={accepts[kind]} onChange={e=>choose(kind,e)}/><small>{kind==='logo'?'PNG, JPG ou WebP. Prefira fundo transparente.':'PNG, JPG, WebP ou ICO. Recomendado: imagem quadrada.'} Máximo 2 MB.</small><button type="button" className="admin-button admin-button-primary" disabled={!files[kind]||Boolean(busy)} onClick={()=>void send(kind)}>{busy===kind?'Enviando...':'Salvar '+(kind==='logo'?'logo':'favicon')}</button></div>}
 </section>)}</div>}
 <section className="admin-help-card"><div><strong>Persistência dos arquivos</strong><p>As imagens são armazenadas em disco, fora da pasta de compilação do Next.js. Faça backup da pasta de identidade, especialmente antes de mover o portal para outro servidor.</p></div></section>
 </div>;
}
