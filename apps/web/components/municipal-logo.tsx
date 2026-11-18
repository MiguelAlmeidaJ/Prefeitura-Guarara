'use client';
import {useEffect,useState} from 'react';

/** Identidade oficial: nunca renderiza texto, brasão ou letra substituta. */
export function MunicipalLogo({className='',alt='Logo oficial da Prefeitura Municipal de Guarará'}:{className?:string;alt?:string}){
 const [loaded,setLoaded]=useState(false);
 const [failed,setFailed]=useState(false);
 useEffect(()=>{setLoaded(false);setFailed(false);},[]);
 return <span className={'municipal-logo '+className+(loaded&&!failed?' has-image':' is-placeholder')}>
  <span className="municipal-logo-skeleton" aria-hidden="true"/>
  {!failed&&<img src="/api/identidade/logo" alt={alt} onLoad={()=>setLoaded(true)} onError={()=>{setFailed(true);setLoaded(false);}}/>}
 </span>;
}
