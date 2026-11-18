'use client';
import {useEffect,useRef,useState,type ReactNode,type ClipboardEvent} from 'react';

type Props={value:string;onChange:(next:string)=>void;id?:string};
const escapeHtml=(text:string)=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const safeLink=(value:string)=>/^(https?:\/\/|mailto:)/i.test(value)?value:'#';
function toHtml(value:string){
 const rows=value.split(/\r?\n/);let html='',list:string|null=null;
 const endList=()=>{if(list){html+='</'+list+'>';list=null;}};
 const inline=(text:string)=>escapeHtml(text)
  .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,(_all,label,url)=>'<a href="'+url+'">'+label+'</a>')
  .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g,'<em>$1</em>');
 for(const raw of rows){
  const line=raw.trim();
  if(!line){endList();continue;}
  const bullet=/^[-*] /.test(line),numbered=/^\d+\. /.test(line);
  if(bullet||numbered){
   const kind=bullet?'ul':'ol';
   if(list!==kind){endList();html+='<'+kind+'>';list=kind;}
   html+='<li>'+inline(line.replace(bullet?/^[-*] /:/^\d+\. /,''))+'</li>';continue;
  }
  endList();
  if(line.startsWith('### '))html+='<h3>'+inline(line.slice(4))+'</h3>';
  else if(line.startsWith('## '))html+='<h2>'+inline(line.slice(3))+'</h2>';
  else if(line.startsWith('> '))html+='<blockquote>'+inline(line.slice(2))+'</blockquote>';
  else html+='<p>'+inline(line)+'</p>';
 }
 endList();return html;
}
function toMarkdown(root:HTMLElement){
 function children(node:Node):string{return Array.from(node.childNodes).map(child).join('');}
 function child(node:Node):string{
  if(node.nodeType===Node.TEXT_NODE)return node.textContent||'';
  if(node.nodeType!==Node.ELEMENT_NODE)return '';
  const el=node as HTMLElement,tag=el.tagName.toLowerCase(),text=children(el);
  if(tag==='strong'||tag==='b')return '**'+text+'**';
  if(tag==='em'||tag==='i')return '*'+text+'*';
  if(tag==='a'){const url=safeLink(el.getAttribute('href')||'');return url==='#'?text:'['+text+']('+url+')';}
  if(tag==='br')return '\n';
  if(tag==='h2')return '\n## '+text+'\n';
  if(tag==='h3')return '\n### '+text+'\n';
  if(tag==='blockquote')return '\n> '+text+'\n';
  if(tag==='li')return text.trim().replace(/\n+/g,' ')+'\n';
  if(tag==='ul')return '\n'+Array.from(el.children).map(li=>'- '+children(li)+'\n').join('')+'\n';
  if(tag==='ol')return '\n'+Array.from(el.children).map((li,i)=>(i+1)+'. '+children(li)+'\n').join('')+'\n';
  if(tag==='p'||tag==='div')return '\n'+text+'\n';
  return text;
 }
 return Array.from(root.childNodes).map(child).join('').replace(/\n{3,}/g,'\n\n').trim();
}
export function RichTextEditor({value,onChange,id='comunicado-conteudo'}:Props){
 const ref=useRef<HTMLDivElement>(null);
 const last=useRef<string|null>(null);
 const [words,setWords]=useState(0);
 useEffect(()=>{
  const el=ref.current;if(!el)return;
  if(last.current!==value){el.innerHTML=toHtml(value);last.current=value;}
  setWords(value.trim()?value.trim().split(/\s+/).length:0);
 },[value]);
 function sync(){
  const next=toMarkdown(ref.current!);
  last.current=next;
  onChange(next.slice(0,30000));
 }
 function command(name:string,argument?:string){
  const el=ref.current;if(!el)return;
  el.focus();document.execCommand(name,false,argument);
  sync();
 }
 function link(){
  const input=window.prompt('Endereço do link (https:// ou mailto:)', 'https://');
  if(!input)return;
  const url=input.trim();
  if(!/^(https?:\/\/|mailto:)/i.test(url)){window.alert('Use um endereço iniciado por https:// ou mailto:');return;}
  command('createLink',url);
 }
 function paste(e:ClipboardEvent<HTMLDivElement>){
  e.preventDefault();const text=e.clipboardData.getData('text/plain');
  document.execCommand('insertText',false,text);sync();
 }
 return <div className="rich-editor rich-editor-wysiwyg">
  <div className="rich-toolbar" role="toolbar" aria-label="Ferramentas de formatação">
   <button type="button" aria-label="Negrito" title="Negrito" onMouseDown={e=>e.preventDefault()} onClick={()=>command('bold')}><strong>B</strong></button>
   <button type="button" aria-label="Itálico" title="Itálico" onMouseDown={e=>e.preventDefault()} onClick={()=>command('italic')}><em>I</em></button>
   <span className="rich-toolbar-divider"/>
   <button type="button" title="Parágrafo" onMouseDown={e=>e.preventDefault()} onClick={()=>command('formatBlock','p')}>Texto</button>
   <button type="button" title="Subtítulo" onMouseDown={e=>e.preventDefault()} onClick={()=>command('formatBlock','h2')}>H2</button>
   <button type="button" title="Título menor" onMouseDown={e=>e.preventDefault()} onClick={()=>command('formatBlock','h3')}>H3</button>
   <span className="rich-toolbar-divider"/>
   <button type="button" title="Marcadores" onMouseDown={e=>e.preventDefault()} onClick={()=>command('insertUnorderedList')}>☷ Lista</button>
   <button type="button" title="Lista numerada" onMouseDown={e=>e.preventDefault()} onClick={()=>command('insertOrderedList')}>1. Lista</button>
   <button type="button" title="Criar link" onMouseDown={e=>e.preventDefault()} onClick={link}>↗ Link</button>
  </div>
  <div id={id} ref={ref} role="textbox" aria-label="Descrição do comunicado" aria-multiline="true" contentEditable suppressContentEditableWarning className="rich-editor-visual rich-content" onInput={sync} onPaste={paste} data-placeholder="Escreva o comunicado aqui. Selecione um trecho para aplicar negrito, itálico ou inserir um link."/>
  <div className="rich-editor-footer"><span>Editor visual: a formatação aparece enquanto você escreve.</span><span>{words} palavras · {value.length.toLocaleString('pt-BR')} / 30.000</span></div>
 </div>;
}
function textParts(text:string):ReactNode[]{
 const pattern=/(\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
 const result:ReactNode[]=[];let last=0,found:RegExpExecArray|null;
 while((found=pattern.exec(text))){
  if(found.index>last)result.push(text.slice(last,found.index));
  if(found[1])result.push(<a key={found.index} href={safeLink(found[3])} target="_blank" rel="noopener noreferrer">{found[2]}</a>);
  else if(found[4])result.push(<strong key={found.index}>{found[4]}</strong>);
  else if(found[5])result.push(<em key={found.index}>{found[5]}</em>);
  last=pattern.lastIndex;
 }
 if(last<text.length)result.push(text.slice(last));
 return result;
}
export function RichTextContent({value}:{value:string}){
 const lines=value.split(/\r?\n/),elements:ReactNode[]=[];
 let i=0;
 while(i<lines.length){
  const trimmed=lines[i].trim();
  if(!trimmed){i++;continue;}
  if(trimmed.startsWith('### ')){elements.push(<h3 key={i}>{textParts(trimmed.slice(4))}</h3>);i++;continue;}
  if(trimmed.startsWith('## ')){elements.push(<h2 key={i}>{textParts(trimmed.slice(3))}</h2>);i++;continue;}
  if(trimmed.startsWith('> ')){elements.push(<blockquote key={i}>{textParts(trimmed.slice(2))}</blockquote>);i++;continue;}
  const bullet=/^[-*] /.test(trimmed),numbered=/^\d+\. /.test(trimmed);
  if(bullet||numbered){
   const initial=i,li:ReactNode[]=[];
   while(i<lines.length){
    const current=lines[i].trim();
    if(bullet?!/^[-*] /.test(current):!/^\d+\. /.test(current))break;
    li.push(<li key={i}>{textParts(current.replace(bullet?/^[-*] /:/^\d+\. /,''))}</li>);i++;
   }
   elements.push(bullet?<ul key={initial}>{li}</ul>:<ol key={initial}>{li}</ol>);continue;
  }
  const start=i,paragraph:string[]=[];
  while(i<lines.length){
   const current=lines[i].trim();
   if(!current||current.startsWith('## ')||current.startsWith('### ')||current.startsWith('> ')||/^[-*] /.test(current)||/^\d+\. /.test(current))break;
   paragraph.push(current);i++;
  }
  if(paragraph.length)elements.push(<p key={start}>{textParts(paragraph.join(' '))}</p>);
  else i++;
 }
 return <div className="rich-content">{elements}</div>;
}
