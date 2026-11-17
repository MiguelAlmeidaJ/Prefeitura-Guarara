'use client';
import {useState} from 'react';
import Link from 'next/link';

type Column={chave:string;titulo:string;tipo:'TEXTO'|'LINK';multiplos:boolean};
type CellLink={texto:string;url:string};
type Cell=string|CellLink|CellLink[];
type Row=Record<string,Cell>;
type Table={id:string;nome:string;descricao:string|null;colunas:Column[];linhas:Row[]};
type Session={accessToken:string;user:{nome:string;papel:string}};
const api=process.env.NEXT_PUBLIC_API_URL||'http://localhost:3007';
const blank=():Omit<Table,'id'>=>({nome:'',descricao:'',colunas:[{chave:'nome',titulo:'Nome',tipo:'TEXTO',multiplos:false}],linhas:[]});
const empty=(c:Column):Cell=>c.tipo==='TEXTO'?'':c.multiplos?[]:{texto:'',url:''};
export default function TablesAdmin(){
 const [session,setSession]=useState<Session|null>(null);
 const [email,setEmail]=useState('');const [senha,setSenha]=useState('');
 const [tables,setTables]=useState<Table[]>([]);const [editing,setEditing]=useState<string|null>(null);
 const [form,setForm]=useState<Omit<Table,'id'>>(blank());
 const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 async function request(path:string,method='GET',body?:unknown,token=session?.accessToken){
  const res=await fetch(api+'/api/'+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  if(!res.ok)throw new Error('Erro '+res.status+': '+(await res.text()).slice(0,400));
  return res.json();
 }
 async function login(e:React.FormEvent){e.preventDefault();setBusy(true);try{
  const auth=await request('auth/login','POST',{email,senha}) as Session;setSession(auth);setSenha('');
  setTables(await request('admin/tabelas','GET',undefined,auth.accessToken));setMessage('');
 }catch(err){setMessage(String(err));}finally{setBusy(false);}}
 async function reload(){setTables(await request('admin/tabelas'));}
 function updateCol(i:number,values:Partial<Column>){
  setForm(prev=>{const cols=prev.colunas.map((c,j)=>j===i?{...c,...values}:c);
   const before=prev.colunas[i];const after=cols[i];
   const lines=prev.linhas.map(row=>{const next={...row};
    if(after.chave!==before.chave){next[after.chave]=row[before.chave]??empty(after);delete next[before.chave];}
    if(after.tipo!==before.tipo||after.multiplos!==before.multiplos)next[after.chave]=empty(after);
    return next;});
   return {...prev,colunas:cols,linhas:lines};
  });
 }
 function removeCol(i:number){setForm(prev=>{const col=prev.colunas[i];return {...prev,colunas:prev.colunas.filter((_,j)=>i!==j),linhas:prev.linhas.map(row=>{const next={...row};delete next[col.chave];return next;})};});}
 function addCol(){setForm(prev=>{let i=prev.colunas.length+1;while(prev.colunas.some(c=>c.chave==='coluna'+i))i++;
  const col:Column={chave:'coluna'+i,titulo:'Nova coluna',tipo:'TEXTO',multiplos:false};
  return {...prev,colunas:[...prev.colunas,col],linhas:prev.linhas.map(row=>({...row,[col.chave]:''}))};
 });}
 function setCell(row:number,key:string,value:Cell){setForm(prev=>({...prev,linhas:prev.linhas.map((r,i)=>i===row?{...r,[key]:value}:r)}));}
 function addRow(){setForm(prev=>({...prev,linhas:[...prev.linhas,Object.fromEntries(prev.colunas.map(c=>[c.chave,empty(c)]))]}));}
 function newTable(){setEditing(null);setForm(blank());setMessage('');}
 function edit(t:Table){setEditing(t.id);setForm({nome:t.nome,descricao:t.descricao||'',colunas:t.colunas,linhas:t.linhas});setMessage('');}
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);try{
  await request(editing?'admin/tabelas/'+editing:'admin/tabelas',editing?'PATCH':'POST',form);
  await reload();newTable();setMessage('Tabela salva com sucesso.');
 }catch(err){setMessage(String(err));}finally{setBusy(false);}}
 async function remove(t:Table){if(!window.confirm('Excluir tabela '+t.nome+'?'))return;setBusy(true);try{
  await request('admin/tabelas/'+t.id,'DELETE');await reload();if(editing===t.id)newTable();setMessage('Tabela excluída.');
 }catch(err){setMessage(String(err));}finally{setBusy(false);}}
 return <section className="section"><div className="wrap">
 <p><Link href="/admin">Painel editorial</Link> / Tabelas</p><h1>Cadastro de tabelas</h1>
 <p className="muted">Crie uma tabela uma única vez e vincule-a a páginas de Tabela Simples ou Tabela em Abas.</p>
 {!session?<form className="cms-admin-form" onSubmit={login}><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Senha<input type="password" required value={senha} onChange={e=>setSenha(e.target.value)}/></label><button disabled={busy}>Entrar</button></form>:<>
 <p>Conectado: {session.user.nome} <button type="button" onClick={()=>{setSession(null);setTables([]);newTable();}}>Sair</button></p>
 <h2>Tabelas cadastradas</h2>
 {tables.length===0?<p>Nenhuma tabela cadastrada.</p>:<ul className="cms-table-list">{tables.map(t=><li key={t.id}><strong>{t.nome}</strong> ({t.linhas.length} registros) <button onClick={()=>edit(t)} type="button">Editar</button>{' '}{session.user.papel==='ADMINISTRADOR'&&<button type="button" disabled={busy} onClick={()=>remove(t)}>Excluir</button>}</li>)}</ul>}
 <h2>{editing?'Editar tabela':'Nova tabela'}</h2>
 <form className="cms-admin-form" onSubmit={save}>
 <label>Nome da tabela<input required maxLength={180} value={form.nome} onChange={e=>setForm(p=>({...p,nome:e.target.value}))}/></label>
 <label>Descrição<input maxLength={500} value={form.descricao||''} onChange={e=>setForm(p=>({...p,descricao:e.target.value}))}/></label>
 <h3>Colunas</h3>
 {form.colunas.map((c,i)=><div className="cms-column-editor" key={i}>
  <label>Título<input required value={c.titulo} maxLength={120} onChange={e=>updateCol(i,{titulo:e.target.value})}/></label>
  <label>Chave (sem espaços)<input required pattern="[a-zA-Z][a-zA-Z0-9_]*" value={c.chave} onChange={e=>updateCol(i,{chave:e.target.value})}/></label>
  <label>Tipo<select value={c.tipo} onChange={e=>updateCol(i,{tipo:e.target.value as Column['tipo'],multiplos:false})}><option value="TEXTO">Texto</option><option value="LINK">Link</option></select></label>
  {c.tipo==='LINK'&&<label className="cms-check"><input type="checkbox" checked={c.multiplos} onChange={e=>updateCol(i,{multiplos:e.target.checked})}/> Permitir vários links por célula</label>}
  <button type="button" onClick={()=>removeCol(i)} disabled={form.colunas.length<=1}>Remover coluna</button>
 </div>)}
 <button type="button" onClick={addCol} disabled={form.colunas.length>=20}>Adicionar coluna</button>
 <h3>Registros ({form.linhas.length})</h3>
 {form.linhas.map((row,i)=><fieldset className="cms-row-editor" key={i}><legend>Registro {i+1}</legend>
 {form.colunas.map(c=><div key={c.chave}><label>{c.titulo}</label>
 {c.tipo==='TEXTO'?<textarea rows={2} value={typeof row[c.chave]==='string'?row[c.chave] as string:''} onChange={e=>setCell(i,c.chave,e.target.value)}/>:
 <div>{(c.multiplos?(Array.isArray(row[c.chave])?row[c.chave] as CellLink[]:[]):[(!Array.isArray(row[c.chave])&&typeof row[c.chave]==='object'?row[c.chave] as CellLink:{texto:'',url:''})]).map((link,j)=><div className="cms-link-editor" key={j}>
 <input aria-label="Texto do link" placeholder="Nome do documento" required value={link.texto} onChange={e=>{const updated={...link,texto:e.target.value};if(c.multiplos){const arr=[...(row[c.chave] as CellLink[])];arr[j]=updated;setCell(i,c.chave,arr);}else setCell(i,c.chave,updated);}}/>
 <input aria-label="Endereço do link" placeholder="https://..." type="url" required value={link.url} onChange={e=>{const updated={...link,url:e.target.value};if(c.multiplos){const arr=[...(row[c.chave] as CellLink[])];arr[j]=updated;setCell(i,c.chave,arr);}else setCell(i,c.chave,updated);}}/>
 {c.multiplos&&<button type="button" onClick={()=>setCell(i,c.chave,(row[c.chave] as CellLink[]).filter((_,k)=>k!==j))}>Remover link</button>}
 </div>)}
 {c.multiplos&&<button type="button" onClick={()=>setCell(i,c.chave,[...(Array.isArray(row[c.chave])?row[c.chave] as CellLink[]:[]),{texto:'',url:''}])}>Adicionar link</button>}</div>}
 </div>)}
 <button type="button" onClick={()=>setForm(p=>({...p,linhas:p.linhas.filter((_,j)=>j!==i)}))}>Remover registro</button>
 </fieldset>)}
 <button type="button" onClick={addRow}>Adicionar registro</button>
 <div className="cms-save-actions"><button type="submit" disabled={busy}>{editing?'Salvar alterações':'Criar tabela'}</button><button type="button" onClick={newTable}>Limpar formulário</button></div>
 </form></>}
 {message&&<p role="status">{message}</p>}
 </div></section>;
}
