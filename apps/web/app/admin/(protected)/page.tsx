'use client';
import {useEffect,useState} from 'react';
type Page={id:string;titulo:string;slug:string;tipo:'GRID_LINKS'|'TABELA_SIMPLES'|'TABELA_ABAS';estado:string;subtitulo:string|null;ordem:number;conteudo:unknown};
type Session={user:{nome:string;papel:string}};

function defaultContent(tipo:Page['tipo']){
 if(tipo==='GRID_LINKS')return {links:[{texto:'Novo serviço',url:'https://exemplo.gov.br/',novaAba:true}]};
 return tipo==='TABELA_SIMPLES'?{tabelaId:''}:{abas:[{titulo:'Geral',tabelaId:''}]};
}
export default function Admin(){
 const [session,setSession]=useState<Session|null>(null);
 
 const [message,setMessage]=useState('');const [pages,setPages]=useState<Page[]>([]);
 const [tables,setTables]=useState<Array<{id:string;nome:string}>>([]);
 const [id,setId]=useState('');const [titulo,setTitulo]=useState('');const [slug,setSlug]=useState('');
 const [subtitulo,setSubtitulo]=useState('');const [tipo,setTipo]=useState<Page['tipo']>('GRID_LINKS');
 const [ordem,setOrdem]=useState(0);const [json,setJson]=useState(JSON.stringify(defaultContent('GRID_LINKS'),null,2));
 async function request(path:string,method='GET',body?:unknown){
  const response=await fetch('/api/admin-proxy/'+path,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
  if(response.status===401){window.location.assign('/admin/login');throw Error('Sessão expirada');}if(!response.ok)throw Error('Erro '+response.status+': '+(await response.text()).slice(0,250));
  return response.json();
 }
 async function reload(){try{setPages(await request('admin/paginas'));setTables(await request('admin/tabelas'));}catch(e){setMessage(String(e));}}
 useEffect(()=>{let mounted=true;fetch('/api/admin-session',{cache:'no-store'}).then(async response=>{if(!response.ok)throw Error('Sessão encerrada');return response.json();}).then((data:{nome:string;papel:string})=>{if(mounted)setSession({user:data});}).catch(()=>{if(mounted)window.location.assign('/admin/login');});return()=>{mounted=false};},[]);
 useEffect(()=>{if(session)void reload();},[session]);
 function reset(){setId('');setTitulo('');setSlug('');setSubtitulo('');setOrdem(0);setTipo('GRID_LINKS');setJson(JSON.stringify(defaultContent('GRID_LINKS'),null,2));}
 function edit(p:Page){setId(p.id);setTitulo(p.titulo);setSlug(p.slug);setSubtitulo(p.subtitulo||'');setTipo(p.tipo);setOrdem(p.ordem);setJson(JSON.stringify(p.conteudo,null,2));}
 async function save(e:React.FormEvent){e.preventDefault();try{
  const body={titulo,slug,subtitulo,tipo,ordem,conteudo:JSON.parse(json)};
  await request(id?'admin/paginas/'+id:'admin/paginas',id?'PATCH':'POST',body);
  setMessage('Rascunho salvo.');reset();await reload();
 }catch(e){setMessage(String(e));}}
 async function change(p:Page,estado:string){try{await request('admin/paginas/'+p.id+'/estado','PATCH',{estado});setMessage('Status atualizado');await reload();}catch(e){setMessage(String(e));}}
 return <section className="section"><div className="wrap"><h1>Painel editorial</h1><p className="muted">Gerencie páginas padronizadas. O conteúdo é editado em JSON estruturado nesta primeira versão.</p>
 {!session?<p>Carregando painel...</p>:<>
 <p>Conectado: {session.user.nome} ({session.user.papel}) <button type="button" onClick={async()=>{await fetch('/api/admin-logout',{method:'POST'});window.location.assign('/admin/login');}}>Sair</button></p>
 <p><a href="/admin/tabelas">Gerenciar tabelas reutilizáveis</a></p><h2>Páginas</h2><ul>{pages.map(p=><li key={p.id}><strong>{p.titulo}</strong> — {p.estado} — <a href={'/p/'+p.slug} target="_blank" rel="noopener noreferrer">Ver página</a>{' '}<button type="button" onClick={()=>edit(p)}>Editar</button>{' '}{session.user.papel!=='EDITOR'&&<><button type="button" onClick={()=>change(p,'PUBLICADA')}>Publicar</button>{' '}<button type="button" onClick={()=>change(p,'RASCUNHO')}>Despublicar</button></>}</li>)}</ul>
 <h2>{id?'Editar página':'Nova página'}</h2>
 <form className="cms-admin-form" onSubmit={save}>
 <label>Título<input required maxLength={180} value={titulo} onChange={e=>setTitulo(e.target.value)}/></label>
 <label>Slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={slug} onChange={e=>setSlug(e.target.value)}/></label>
 <label>Subtítulo<input maxLength={500} value={subtitulo} onChange={e=>setSubtitulo(e.target.value)}/></label>
 <label>Tipo<select value={tipo} onChange={e=>{const next=e.target.value as Page['tipo'];setTipo(next);setJson(JSON.stringify(defaultContent(next),null,2));}}><option value="GRID_LINKS">Grid de Links</option><option value="TABELA_SIMPLES">Tabela Simples</option><option value="TABELA_ABAS">Tabela em Abas</option></select></label>
 <label>Ordem<input type="number" min={0} value={ordem} onChange={e=>setOrdem(Number(e.target.value))}/></label>
 {tipo==='GRID_LINKS'?<label>Links (JSON)<textarea rows={12} spellCheck={false} value={json} onChange={e=>setJson(e.target.value)}/></label>:tipo==='TABELA_SIMPLES'?<label>Selecione a tabela cadastrada<select value={(JSON.parse(json) as {tabelaId:string}).tabelaId||''} onChange={e=>setJson(JSON.stringify({tabelaId:e.target.value}))}><option value="">Selecione uma tabela</option>{tables.map(t=><option value={t.id} key={t.id}>{t.nome}</option>)}</select></label>:<div><label>Abas e tabelas vinculadas</label>{((JSON.parse(json) as {abas:{titulo:string;tabelaId:string}[]}).abas).map((tab,i)=><div key={i} className="cms-tab-editor"><input aria-label={'Nome da aba '+(i+1)} placeholder="Nome da aba" value={tab.titulo} onChange={e=>{const data=JSON.parse(json);data.abas[i].titulo=e.target.value;setJson(JSON.stringify(data));}}/><select aria-label={'Tabela da aba '+(i+1)} value={tab.tabelaId} onChange={e=>{const data=JSON.parse(json);data.abas[i].tabelaId=e.target.value;setJson(JSON.stringify(data));}}><option value="">Selecione uma tabela</option>{tables.map(t=><option key={t.id} value={t.id}>{t.nome}</option>)}</select><button type="button" onClick={()=>{const data=JSON.parse(json);data.abas.splice(i,1);setJson(JSON.stringify(data));}}>Remover aba</button></div>)}<button type="button" onClick={()=>{const data=JSON.parse(json);data.abas.push({titulo:'Nova aba',tabelaId:''});setJson(JSON.stringify(data));}}>Adicionar aba</button></div>}
 <div><button type="submit">Salvar</button>{' '}<button type="button" onClick={reset}>Limpar</button></div>
 </form></>}
 {message&&<p role="status">{message}</p>}</div></section>;
}
