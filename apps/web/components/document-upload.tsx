'use client';
import {useId,useState,type ChangeEvent} from 'react';

type Props={value:string;onChange:(value:string)=>void;label?:string;accept?:string;disabled?:boolean};
export function DocumentUpload({value,onChange,label='Enviar documento',accept='.pdf,.doc,.docx,.xls,.xlsx,.pptx,.odt,.ods,.png,.jpg,.jpeg,.webp',disabled=false}:Props){
 const id=useId(),[busy,setBusy]=useState(false),[error,setError]=useState(''),[filename,setFilename]=useState('');
 async function upload(event:ChangeEvent<HTMLInputElement>){
  const file=event.target.files?.[0];if(!file)return;
  if(file.size>15*1024*1024){setError('O arquivo deve ter no máximo 15 MB.');event.target.value='';return;}
  setBusy(true);setError('');
  try{
   const body=new FormData();body.append('arquivo',file);
   const response=await fetch('/api/admin-arquivos',{method:'POST',body});
   const result=await response.json() as {url?:string;nome?:string;error?:string};
   if(!response.ok||!result.url)throw Error(result.error||'Falha ao enviar arquivo');
   onChange(result.url);setFilename(result.nome||file.name);
  }catch(e){setError(e instanceof Error?e.message:'Não foi possível enviar o arquivo');}
  finally{setBusy(false);event.target.value='';}
 }
 return <div className="document-upload">
  <div className="document-upload-heading"><span>Ou envie um arquivo diretamente</span><span>Máx. 15 MB</span></div>
  <label htmlFor={id} className={'document-upload-control'+(busy?' is-busy':'')}><span aria-hidden="true">↑</span>{busy?'Enviando arquivo...':label}</label>
  <input id={id} type="file" accept={accept} disabled={disabled||busy} onChange={e=>void upload(e)}/>
  <small>PDF, Word, Excel, PowerPoint, ODT, ODS ou imagem. Após o upload, o endereço acima será preenchido automaticamente.</small>
  {filename&&<p className="document-upload-success" role="status">✓ {filename} enviado com sucesso</p>}
  {error&&<p className="document-upload-error" role="alert">{error}</p>}
  {value.includes('/api/arquivos/')&&<a className="document-upload-preview" href={value} target="_blank" rel="noopener noreferrer">Visualizar arquivo enviado ↗</a>}
 </div>;
}
