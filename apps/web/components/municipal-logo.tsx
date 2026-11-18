'use client';
import {useEffect,useState} from 'react';
type Asset={version:number}|null;
export function MunicipalLogo({className='',alt='Logo oficial da Prefeitura Municipal de Guarará'}:{className?:string;alt?:string}){
 const [version,setVersion]=useState<number|null>(null),[loaded,setLoaded]=useState(false),[failed,setFailed]=useState(false);
 useEffect(()=>{
  let active=true;const controller=new AbortController();
  fetch('/api/identidade/status',{cache:'no-store',signal:controller.signal}).then(r=>r.ok?r.json():Promise.reject()).then((data:{logo:Asset})=>{
   if(active&&data.logo){setVersion(data.logo.version);setFailed(false);}
  }).catch(()=>{});
  return()=>{active=false;controller.abort();};
 },[]);
 const src='/api/identidade/logo'+(version!==null?'?v='+version:'');
 return <span className={'municipal-logo '+className+(loaded&&!failed?' has-image':' is-placeholder')}>
  <span className="municipal-logo-skeleton" aria-hidden="true"/>
  {!failed&&<img key={src} src={src} alt={alt} onLoad={()=>setLoaded(true)} onError={()=>{setFailed(true);setLoaded(false);}}/>}
 </span>;
}
