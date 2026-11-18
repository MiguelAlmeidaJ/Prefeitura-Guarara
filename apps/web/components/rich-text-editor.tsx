'use client';
import {useState,type ReactNode} from 'react';
type Props={value:string;onChange:(next:string)=>void;id?:string};
function transform(value:string,start:number,end:number,before:string,after=before){
 const text=value.slice(start,end)||'texto';
 return value.slice(0,start)+before+text+after+value.slice(end);
}
export function RichTextEditor({value,onChange,id='comunicado-conteudo'}:Props){
 const [preview,setPreview]=useState(false);
 function format(before:string,after?:string){
  const el=document.getElementById(id) as HTMLTextAreaElement|null;
  if(!el)return;
  const s=el.selectionStart,e=el.selectionEnd;
  onChange(transform(value,s,e,before,after));
  requestAnimationFrame(()=>{el.focus();el.setSelectionRange(s+before.length,e+before.length);});
 }
 function line(prefix:string){
  const el=document.getElementById(id) as HTMLTextAreaElement|null;if(!el)return;
  const start=value.lastIndexOf('\n',Math.max(0,el.selectionStart-1))+1;
  onChange(value.slice(0,start)+prefix+value.slice(start));
  requestAnimationFrame(()=>el.focus());
 }
 return <div className="rich-editor">
  <div className="rich-toolbar" role="toolbar" aria-label="Ferramentas de formatação">
   <button type="button" title="Negrito" aria-label="Negrito" onClick={()=>format('**')}><strong>B</strong></button>
   <button type="button" title="Itálico" aria-label="Itálico" onClick={()=>format('*')}><em>I</em></button>
   <span className="rich-toolbar-divider"/>
   <button type="button" onClick={()=>line('## ')} title="Subtítulo">H2</button>
   <button type="button" onClick={()=>line('### ')} title="Título menor">H3</button>
   <span className="rich-toolbar-divider"/>
   <button type="button" onClick={()=>line('- ')} title="Lista com marcadores">☷ Lista</button>
   <button type="button" onClick={()=>line('1. ')} title="Lista numerada">1. Lista</button>
   <button type="button" onClick={()=>line('> ')} title="Citação">❝</button>
   <button type="button" onClick={()=>format('[','](https://)')} title="Inserir link">↗ Link</button>
   <span className="rich-toolbar-spacer"/>
   <button type="button" className={preview?'is-selected':''} onClick={()=>setPreview(v=>!v)}>{preview?'Editar texto':'Pré-visualizar'}</button>
  </div>
  {preview?<div className="rich-preview"><RichTextContent value={value}/></div>:<textarea id={id} className="rich-editor-input" value={value} onChange={e=>onChange(e.target.value)} required rows={13} maxLength={30000} placeholder="Escreva seu comunicado... Use a barra acima para formatar títulos, listas, destaques e links."/>}
  <div className="rich-editor-footer"><span>Editor com formatação e prévia. A publicação preserva títulos, negrito, listas e links de maneira segura.</span><span>{value.length.toLocaleString('pt-BR')} / 30.000</span></div>
 </div>;
}
function inline(text:string):ReactNode[]{
 const pattern=/(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
 const parts:ReactNode[]=[];let end=0;let match:RegExpExecArray|null;
 while((match=pattern.exec(text))){
  if(match.index>end)parts.push(text.slice(end,match.index));
  if(match[1])parts.push(<a key={match.index} href={match[3]} target="_blank" rel="noopener noreferrer">{match[2]}</a>);
  else if(match[4])parts.push(<strong key={match.index}>{match[4]}</strong>);
  else if(match[5])parts.push(<em key={match.index}>{match[5]}</em>);
  end=pattern.lastIndex;
 }
 if(end<text.length)parts.push(text.slice(end));return parts;
}
export function RichTextContent({value}:{value:string}){
 const lines=value.split(/\r?\n/);const out:ReactNode[]=[];
 let index=0;
 while(index<lines.length){
  const line=lines[index],trim=line.trim();
  if(!trim){index++;continue;}
  if(trim.startsWith('### ')){out.push(<h3 key={index}>{inline(trim.slice(4))}</h3>);index++;continue;}
  if(trim.startsWith('## ')){out.push(<h2 key={index}>{inline(trim.slice(3))}</h2>);index++;continue;}
  if(trim.startsWith('> ')){out.push(<blockquote key={index}>{inline(trim.slice(2))}</blockquote>);index++;continue;}
  if(/^[-*] /.test(trim)||/^\d+\. /.test(trim)){
   const numbered=/^\d+\. /.test(trim),children:ReactNode[]=[];
   const first=index;
   while(index<lines.length){
    const current=lines[index].trim();
    if(numbered?!/^\d+\. /.test(current):!/^[-*] /.test(current))break;
    children.push(<li key={index}>{inline(current.replace(numbered?/^\d+\. /:/^[-*] /,''))}</li>);index++;
   }
   out.push(numbered?<ol key={first}>{children}</ol>:<ul key={first}>{children}</ul>);continue;
  }
  const first=index,paragraph:string[]=[];
  while(index<lines.length&&lines[index].trim()&&!/^(?:##?\#? |[-*] |\d+\. |> )/.test(lines[index].trim()))paragraph.push(lines[index++].trim());
  if(paragraph.length)out.push(<p key={first}>{inline(paragraph.join(' '))}</p>);
  else{out.push(<p key={index}>{inline(lines[index])}</p>);index++;}
 }
 return <div className="rich-content">{out}</div>;
}
