'use client';
import {useEffect,useMemo,useState,type FormEvent,type DragEvent} from 'react';
import Link from 'next/link';

type Kind='PAS'|'CONSELHO'|'PORTARIA'|'ESCALA'|'MEDICAMENTO'|'ESTOQUE';
type Item={id:string;tipo:Kind;categoria:string|null;titulo:string;descricao:string|null;ano:number|null;link:string;textoBotao:string|null;linkSecundario:string|null;textoBotaoSecundario:string|null;destaque:boolean;ordem:number};
type Data={configuracao:Config|null;conteudos:Item[]};
type Config={nomeSecretario:string|null;telefone:string|null;endereco:string|null;horario:string|null;descricao:string|null};
type Form=Omit<Item,'id'>;
const kinds:[Kind,string][]=[['PAS','Planos de saúde (PAS)'],['CONSELHO','Conselho Municipal de Saúde'],['PORTARIA','Portarias'],['ESCALA','Escalas de atendimento'],['MEDICAMENTO','Medicamentos e farmácia'],['ESTOQUE','Estoque de medicamentos']];
const names=Object.fromEntries(kinds) as Record<Kind,string>;
const configBlank=():Config=>({nomeSecretario:null,telefone:null,endereco:null,horario:null,descricao:null});
const empty=(type:Kind='PAS'):Form=>({tipo:type,categoria:null,titulo:'',descricao:null,ano:Number(new Date().toLocaleDateString('en-US',{year:'numeric',timeZone:'America/Sao_Paulo'}).split('/').pop()),link:'',textoBotao:null,linkSecundario:null,textoBotaoSecundario:null,destaque:false,ordem:0});
async function request<T>(path:string,method='GET',body?:unknown):Promise<T>{
 const response=await fetch('/api/admin-proxy/admin/saude'+path,{method,headers:{'Content-Type':'application/json'},cache:'no-store',body:body===undefined?undefined:JSON.stringify(body)});
 if(response.status===401){window.location.assign('/admin/login');throw Error('Sessão expirada');}
 if(!response.ok)throw Error('Erro '+response.status+': '+(await response.text()).slice(0,400));
 return response.json() as Promise<T>;
}
export default function SaudeAdmin(){
 const [data,setData]=useState<Data>({configuracao:null,conteudos:[]});
 const [config,setConfig]=useState<Config>(configBlank);
 const [user,setUser]=useState<{papel:string}|null>(null);
 const [tab,setTab]=useState<Kind|'CONFIG'>('PAS');
 const [editing,setEditing]=useState<string|null>(null);
 const [form,setForm]=useState<Form>(empty);
 const [editor,setEditor]=useState(false);
 const [busy,setBusy]=useState(false);
 const [dragId,setDragId]=useState<string|null>(null);
 const [dragOver,setDragOver]=useState<string|null>(null);
 const [loading,setLoading]=useState(true);
 const [message,setMessage]=useState<{text:string;error:boolean}|null>(null);
 const canManage=user?.papel==='ADMINISTRADOR'||user?.papel==='GESTOR';
 useEffect(()=>{let active=true;(async()=>{
  try{
   const response=await fetch('/api/admin-session',{cache:'no-store'});
   if(!response.ok){window.location.assign('/admin/login');return;}
   const actor=await response.json() as {papel:string};
   const content=await request<Data>('');
   if(active){setUser(actor);setData(content);setConfig({...configBlank(),...(content.configuracao||{})});}
  }catch(e){if(active)setMessage({text:String(e),error:true});}finally{if(active)setLoading(false);}
 })();return()=>{active=false};},[]);
 async function reload(){const content=await request<Data>('');setData(content);setConfig({...configBlank(),...(content.configuracao||{})});}
 const filtered=useMemo(()=>data.conteudos.filter(item=>tab!=='CONFIG'&&item.tipo===tab).sort((a,b)=>a.ordem-b.ordem||a.titulo.localeCompare(b.titulo,'pt-BR')),[data.conteudos,tab]);
 function newEntry(){if(tab==='CONFIG')return;setEditing(null);setForm({...empty(tab),ordem:filtered.length});setEditor(true);setMessage(null);}
 function editEntry(item:Item){setEditing(item.id);setForm({tipo:item.tipo,categoria:item.categoria??null,titulo:item.titulo,descricao:item.descricao,ano:item.ano,link:item.link,textoBotao:item.textoBotao,linkSecundario:item.linkSecundario,textoBotaoSecundario:item.textoBotaoSecundario,destaque:item.destaque,ordem:item.ordem});setEditor(true);setMessage(null);}
 async function save(event:FormEvent){
  event.preventDefault();setBusy(true);setMessage(null);
  try{
   const payload:Form={...form};
   if(tab==='ESTOQUE'){
    if(payload.ano===null)throw Error('Informe o ano do estoque');
    payload.titulo='Estoque de medicamentos '+payload.ano;
    payload.descricao=null;payload.textoBotao='Baixar PDF';payload.linkSecundario=null;payload.textoBotaoSecundario=null;payload.destaque=false;
   }
   if(tab==='PORTARIA'){
    payload.ano=null;payload.textoBotao=null;payload.linkSecundario=null;payload.textoBotaoSecundario=null;payload.destaque=false;
   }
   await request('/conteudos'+(editing?'/'+editing:''),editing?'PATCH':'POST',payload);
   await reload();setEditor(false);setEditing(null);setMessage({text:'Conteúdo salvo com sucesso.',error:false});
  }catch(e){setMessage({text:String(e),error:true});}finally{setBusy(false);}
 }
 async function saveConfig(event:FormEvent){
  event.preventDefault();setBusy(true);setMessage(null);
  try{await request('/configuracao','PATCH',config);await reload();setMessage({text:'Informações da secretaria atualizadas.',error:false});}
  catch(e){setMessage({text:String(e),error:true});}finally{setBusy(false);}
 }
 async function remove(item:Item){
  if(!window.confirm('Excluir "'+item.titulo+'"?'))return;
  setBusy(true);setMessage(null);
  try{await request('/conteudos/'+item.id,'DELETE');await reload();setMessage({text:'Conteúdo excluído.',error:false});}
  catch(e){setMessage({text:String(e),error:true});}finally{setBusy(false);}
 }
 async function reorder(sourceId:string,targetId:string){
  setDragId(null);setDragOver(null);
  if(!canManage||busy||tab==='CONFIG'||sourceId===targetId)return;
  const ids=filtered.map(item=>item.id);
  const from=ids.indexOf(sourceId),to=ids.indexOf(targetId);
  if(from<0||to<0)return;
  ids.splice(from,1);ids.splice(to,0,sourceId);
  const previous=data.conteudos;
  setData(current=>({...current,conteudos:current.conteudos.map(item=>item.tipo===tab?{...item,ordem:ids.indexOf(item.id)}:item)}));
  setBusy(true);setMessage(null);
  try{
   await request('/ordenar','PATCH',{tipo:tab,ids});
   setMessage({text:'Ordem atualizada e salva.',error:false});
  }catch(error){setData(current=>({...current,conteudos:previous}));setMessage({text:String(error),error:true});}
  finally{setBusy(false);}
 }
 const setField=<K extends keyof Form>(field:K,value:Form[K])=>setForm(previous=>({...previous,[field]:value}));
 const configField=<K extends keyof Config>(field:K,value:Config[K])=>setConfig(previous=>({...previous,[field]:value}));
 return <div className="admin-dashboard health-admin">
  <div className="admin-dashboard-header"><div><span className="admin-kicker">SECRETARIAS · SAÚDE</span><h1>Gestão da Saúde</h1><p>Edite informações, documentos, planos, escalas de atendimento e medicamentos.</p></div><Link className="admin-button admin-button-outline" href="/secretarias/saude" target="_blank">Visualizar página ↗</Link></div>
  {message&&<div className={'admin-alert '+(message.error?'admin-alert-error':'admin-alert-ok')} role={message.error?'alert':'status'}>{message.text}<button type="button" aria-label="Fechar aviso" onClick={()=>setMessage(null)}>×</button></div>}
  <div className="admin-stats">
   <div className="admin-stat"><span>Documentos e registros</span><strong>{data.conteudos.length}</strong><small>Conteúdos cadastrados</small></div>
   <div className="admin-stat"><span>Planos de saúde</span><strong>{data.conteudos.filter(x=>x.tipo==='PAS').length}</strong><small>Planos anuais</small></div>
   <div className="admin-stat"><span>Escalas</span><strong>{data.conteudos.filter(x=>x.tipo==='ESCALA').length}</strong><small>Atendimentos</small></div>
   <div className="admin-stat"><span>Medicamentos</span><strong>{data.conteudos.filter(x=>x.tipo==='MEDICAMENTO'||x.tipo==='ESTOQUE').length}</strong><small>Listas e estoques</small></div>
  </div>
  <div className="health-admin-tabs" role="tablist" aria-label="Tipo de conteúdo">
   <button type="button" role="tab" aria-selected={tab==='CONFIG'} className={tab==='CONFIG'?'active':''} onClick={()=>{setTab('CONFIG');setEditor(false);}}>Dados da secretaria</button>
   {kinds.map(([value,label])=><button key={value} type="button" role="tab" aria-selected={tab===value} className={tab===value?'active':''} onClick={()=>{setTab(value);setEditor(false);}}>{label}</button>)}
  </div>
  {loading?<section className="admin-panel health-admin-panel">Carregando informações...</section>:tab==='CONFIG'?<section className="admin-panel"><div className="admin-panel-title"><div><h2>Informações institucionais</h2><p>Dados exibidos no cabeçalho e no contato da página pública.</p></div></div><form className="health-admin-form" onSubmit={saveConfig}>
   <div className="admin-two-fields"><div className="admin-field"><label htmlFor="health-secretary">Secretário(a) responsável</label><input id="health-secretary" maxLength={160} value={config.nomeSecretario||''} onChange={e=>configField('nomeSecretario',e.target.value||null)}/></div><div className="admin-field"><label htmlFor="health-phone">Telefone</label><input id="health-phone" maxLength={80} value={config.telefone||''} onChange={e=>configField('telefone',e.target.value||null)}/></div></div>
   <div className="admin-two-fields"><div className="admin-field"><label htmlFor="health-address">Endereço</label><input id="health-address" maxLength={300} value={config.endereco||''} onChange={e=>configField('endereco',e.target.value||null)}/></div><div className="admin-field"><label htmlFor="health-hours">Horário de atendimento</label><input id="health-hours" maxLength={200} value={config.horario||''} onChange={e=>configField('horario',e.target.value||null)}/></div></div>
   <div className="admin-field"><label htmlFor="health-description">Descrição da secretaria</label><textarea id="health-description" rows={4} maxLength={3000} value={config.descricao||''} onChange={e=>configField('descricao',e.target.value||null)}/></div>
   {canManage&&<button type="submit" className="admin-button admin-button-primary" disabled={busy}>{busy?'Salvando...':'Salvar dados da secretaria'}</button>}
  </form></section>:<section className="admin-panel health-admin-panel"><div className="admin-panel-title"><div><span className="admin-step">{tab}</span><h2>{names[tab]}</h2><p>Adicione, edite e arraste os registros pela alça ⠿ para alterar a ordem de exibição.</p></div>{canManage&&!editor&&<button type="button" className="admin-button admin-button-primary" onClick={newEntry}>+ Novo conteúdo</button>}</div>
   {editor?<form onSubmit={save} className="health-admin-form">{tab==='ESTOQUE'?<>
     <div className="admin-field"><label htmlFor="estoque-year">Ano <b>*</b></label><input id="estoque-year" type="number" min="1900" max="2200" required value={form.ano??''} onChange={e=>setField('ano',e.target.value?Number(e.target.value):null)}/><small>Os rótulos Vigente, Exercício anterior e Histórico são calculados automaticamente pelo ano.</small></div>
     <div className="admin-field"><label htmlFor="estoque-link">Link do PDF <b>*</b></label><input id="estoque-link" required type="url" pattern="https?://.+" maxLength={2048} placeholder="https://..." value={form.link} onChange={e=>setField('link',e.target.value)}/></div>
    </>:tab==='PORTARIA'?<>
     <div className="admin-field"><label htmlFor="portaria-name">Nome <b>*</b></label><input id="portaria-name" required maxLength={200} placeholder="Ex.: Portaria nº 19/2026" value={form.titulo} onChange={e=>setField('titulo',e.target.value)}/></div>
     <div className="admin-field"><label htmlFor="portaria-description">Descrição</label><textarea id="portaria-description" rows={4} maxLength={5000} value={form.descricao||''} onChange={e=>setField('descricao',e.target.value||null)}/></div>
     <div className="admin-field"><label htmlFor="portaria-link">Link do documento <b>*</b></label><input id="portaria-link" type="url" pattern="https?://.+" required maxLength={2048} placeholder="https://..." value={form.link} onChange={e=>setField('link',e.target.value)}/></div>
    </>:tab==='ESCALA'?<>
    <div className="admin-two-fields"><div className="admin-field"><label htmlFor="escala-category">Categoria <b>*</b></label><input id="escala-category" required maxLength={120} placeholder="Ex.: Atenção Primária" value={form.categoria||''} onChange={e=>setField('categoria',e.target.value||null)}/></div><div className="admin-field"><label htmlFor="escala-name">Nome <b>*</b></label><input id="escala-name" required maxLength={200} placeholder="Ex.: PSF Viver Bem" value={form.titulo} onChange={e=>setField('titulo',e.target.value)}/></div></div>
    <div className="admin-field"><label htmlFor="escala-description">Descrição</label><textarea id="escala-description" rows={4} maxLength={5000} placeholder="Descreva os atendimentos e serviços..." value={form.descricao||''} onChange={e=>setField('descricao',e.target.value||null)}/></div>
    <div className="admin-two-fields"><div className="admin-field"><label htmlFor="escala-button-url">Link do botão <b>*</b></label><input id="escala-button-url" required type="url" pattern="https?://.+" maxLength={2048} placeholder="https://..." value={form.link} onChange={e=>setField('link',e.target.value)}/></div><div className="admin-field"><label htmlFor="escala-button-label">Nome do botão <b>*</b></label><input id="escala-button-label" required maxLength={90} placeholder="Ex.: Acessar Escala" value={form.textoBotao||''} onChange={e=>setField('textoBotao',e.target.value||null)}/></div></div>
   </>:<><div className="admin-field"><label htmlFor="health-title">Título <b>*</b></label><input id="health-title" required maxLength={200} value={form.titulo} onChange={e=>setField('titulo',e.target.value)}/></div>
    <div className="admin-field"><label htmlFor="health-summary">Descrição</label><textarea id="health-summary" rows={4} maxLength={5000} value={form.descricao||''} onChange={e=>setField('descricao',e.target.value||null)}/></div>
    <div className="admin-two-fields"><div className="admin-field"><label htmlFor="health-year">Ano (opcional)</label><input id="health-year" type="number" min={1900} max={2200} value={form.ano??''} onChange={e=>setField('ano',e.target.value?Number(e.target.value):null)}/></div><div className="admin-field"><label htmlFor="health-order">Ordem</label><input id="health-order" type="number" min={0} max={99999} value={form.ordem} onChange={e=>setField('ordem',Number(e.target.value))}/></div></div>
    <div className="admin-two-fields"><div className="admin-field"><label htmlFor="health-link">Link do documento ou serviço <b>*</b></label><input id="health-link" required type="url" pattern="https?://.+" maxLength={2048} placeholder="https://..." value={form.link} onChange={e=>setField('link',e.target.value)}/></div><div className="admin-field"><label htmlFor="health-button">Texto do botão</label><input id="health-button" maxLength={90} placeholder="Ex.: Baixar PDF" value={form.textoBotao||''} onChange={e=>setField('textoBotao',e.target.value||null)}/></div></div>
    <div className="admin-two-fields"><div className="admin-field"><label htmlFor="health-link2">Segundo link (opcional)</label><input id="health-link2" type="url" pattern="https?://.+" maxLength={2048} placeholder="https://..." value={form.linkSecundario||''} onChange={e=>setField('linkSecundario',e.target.value||null)}/></div><div className="admin-field"><label htmlFor="health-button2">Texto do segundo botão</label><input id="health-button2" maxLength={90} value={form.textoBotaoSecundario||''} onChange={e=>setField('textoBotaoSecundario',e.target.value||null)}/></div></div>
    <label className="admin-check"><input type="checkbox" checked={form.destaque} onChange={e=>setField('destaque',e.target.checked)}/> Destacar este conteúdo na página pública</label></>}
    <div className="health-admin-actions"><button type="submit" disabled={busy} className="admin-button admin-button-primary">{busy?'Salvando...':editing?'Salvar alterações':'Cadastrar conteúdo'}</button><button type="button" className="admin-button admin-button-outline" onClick={()=>setEditor(false)}>Cancelar</button></div>
   </form>:filtered.length?<div className="admin-table-scroll"><table className="admin-pages-table"><thead><tr><th aria-label="Reordenar">Ordem</th><th>{tab==='ESCALA'||tab==='PORTARIA'?'Nome':tab==='ESTOQUE'?'Ano':'Título'}</th><th>{tab==='ESCALA'?'Categoria':tab==='ESTOQUE'?'Situação':'Ano'}</th><th>Ações</th></tr></thead><tbody>{filtered.map(item=><tr key={item.id} className={dragOver===item.id?'health-admin-drag-over':''} onDragOver={(event:DragEvent<HTMLTableRowElement>)=>{if(!canManage||busy||!dragId)return;event.preventDefault();setDragOver(item.id);}} onDragLeave={()=>setDragOver(null)} onDrop={event=>{event.preventDefault();if(dragId)void reorder(dragId,item.id);}}>
<td><span className="health-admin-grip" draggable={Boolean(canManage&&!busy)} onDragStart={event=>{event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',item.id);setDragId(item.id);}} onDragEnd={()=>{setDragId(null);setDragOver(null);}} title="Arrastar para ordenar" aria-label={'Arrastar '+item.titulo}>⠿</span><span>{item.ordem+1}</span></td>
<td><strong>{tab==='ESTOQUE'?(item.ano||'—'):item.titulo}</strong><span>{tab==='ESTOQUE'?'Baixar PDF':(item.descricao?.slice(0,115)||item.link)}</span></td>
<td>{tab==='ESCALA'?(item.categoria||'—'):tab==='ESTOQUE'?(item.ano===new Date().getFullYear()?'Vigente':item.ano===new Date().getFullYear()-1?'Exercício anterior':'Histórico'):(item.ano||'—')}</td>
<td><div className="admin-row-actions"><a href={item.link} target="_blank" rel="noopener noreferrer">Abrir ↗</a>{canManage&&<><button type="button" onClick={()=>editEntry(item)}>Editar</button><button type="button" className="admin-danger-link" disabled={busy} onClick={()=>void remove(item)}>Excluir</button></>}</div></td></tr>)}</tbody></table></div>:<div className="admin-empty"><h3>Nenhum conteúdo cadastrado</h3><p>Os dados dessa seção aparecerão aqui depois do cadastro.</p>{canManage&&<button type="button" className="admin-button admin-button-primary" onClick={newEntry}>+ Adicionar conteúdo</button>}</div>}
  </section>}
  <div className="admin-help-card"><div><strong>Conteúdo oficial e documentos</strong><p>Os dados ficam disponíveis no portal público após salvar. Utilize links institucionais válidos e confira os documentos antes da publicação.</p></div><Link className="admin-button admin-button-outline" href="/secretarias/saude" target="_blank">Abrir página pública ↗</Link></div>
 </div>;
}
