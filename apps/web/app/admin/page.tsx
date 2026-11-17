'use client';
import {useEffect,useState} from 'react';
type Page={id:string;titulo:string;slug:string;tipo:'GRID_LINKS'|'TABELA_SIMPLES'|'TABELA_ABAS';estado:string;subtitulo:string|null;ordem:number;conteudo:unknown};
type Session={accessToken:string;user:{nome:string;papel:string}};
const api=process.env.NEXT_PUBLIC_API_URL||'http://localhost:3007';
function defaultContent(tipo:Page['tipo']){
 if(tipo==='GRID_LINKS')return {links:[{texto:'Novo serviço',url:'https://exemplo.gov.br/',novaAba:true}]};
 return tipo==='TABELA_SIMPLES'?{tabelaId:''}:{abas:[{titulo:'Geral',tabelaId:''}]};
}
export default function Admin(){
 const [session,setSession]=useState<Session|null>(null);
 const [email,setEmail]=useState('');const [senha,setSenha]=useState('');
 const [message,setMessage]=useState('');const [pages,setPages]=useState<Page[]>([]);
 const [tables,setTables]=useState<Array<{id:string;nome:string}>>([]);
 const [id,setId]=useState('');const [titulo,setTitulo]=useState('');const [slug,setSlug]=useState('');
 const [subtitulo,setSubtitulo]=useState('');const [tipo,setTipo]=useState<Page['tipo']>('GRID_LINKS');
 const [ordem,setOrdem]=useState(0);const [json,setJson]=useState(JSON.stringify(defaultContent('GRID_LINKS'),null,2));
 async function request(path:string,method='GET',body?:unknown){
  const response=await fetch(api+'/api/'+path,{method,headers:{'Content-Type':'application/json',...(session?{Authorization:'Bearer '+session.accessToken}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  if(!response.ok)throw Error('Erro '+response.status+': '+(await response.text()).slice(0,250));
  return response.json();
 }
 async function login(e:React.FormEvent){e.preventDefault();try{
  const response=await fetch(api+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,senha})});
  if(!response.ok)throw Error('Credenciais inválidas');
  const data=await response.json() as Session;setSession(data);setSenha('');setMessage('');
 }catch(e){setMessage(String(e));}}
 async function reload(){try{setPages(await request('admin/paginas'));setTables(await request('admin/tabelas'));}catch(e){setMessage(String(e));}}
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
 {!session?<form className="cms-admin-form" onSubmit={login}><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Senha<input type="password" required value={senha} onChange={e=>setSenha(e.target.value)}/></label><button>Entrar</button></form>:<>
 <p>Conectado: {session.user.nome} ({session.user.papel}) <button type="button" onClick={()=>{setSession(null);setPages([]);reset();}}>Sair</button></p>
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
