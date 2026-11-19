'use client';
import {useEffect,useState,type FormEvent} from 'react';
type Role='ADMINISTRADOR'|'GESTOR'|'EDITOR';
type User={id:string;nome:string;email:string;papel:Role;ativo:boolean;criadoEm:string};
type Form={nome:string;email:string;papel:Role;ativo:boolean;senha:string};
const blank:Form={nome:'',email:'',papel:'EDITOR',ativo:true,senha:''};
async function api<T>(path='',method='GET',data?:unknown):Promise<T>{
 const res=await fetch('/api/admin-proxy/admin/usuarios'+path,{method,cache:'no-store',headers:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data)});
 if(res.status===401){window.location.assign('/admin/login');throw Error('Sessão expirada');}
 if(!res.ok)throw Error('Erro '+res.status+': '+(await res.text()).slice(0,400));
 return res.json() as Promise<T>;
}
export default function UsuariosPage(){
 const [userRole,setUserRole]=useState(''),[items,setItems]=useState<User[]>([]);
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const [error,setError]=useState(''),[notice,setNotice]=useState(''),[editing,setEditing]=useState<string|null>(null);
 const [form,setForm]=useState<Form>({...blank}),[showPass,setShowPass]=useState(false);
 useEffect(()=>{let active=true;(async()=>{try{
  const session=await fetch('/api/admin-session',{cache:'no-store'});
  if(!session.ok){window.location.assign('/admin/login');return;}
  const actor=await session.json() as {papel:string};
  if(actor.papel!=='ADMINISTRADOR'){if(active){setUserRole(actor.papel);setError('Somente administradores podem gerenciar usuários.');}return;}
  const records=await api<User[]>();if(active){setItems(records);setUserRole(actor.papel);}
 }catch(e){if(active)setError(String(e));}finally{if(active)setLoading(false);}})();return()=>{active=false};},[]);
 async function reload(){setItems(await api<User[]>());}
 function reset(){setEditing(null);setForm({...blank});setError('');}
 function edit(u:User){setEditing(u.id);setForm({nome:u.nome,email:u.email,papel:u.papel,ativo:u.ativo,senha:''});setShowPass(false);setError('');window.scrollTo({top:0,behavior:'smooth'});}
 async function submit(e:FormEvent){
  e.preventDefault();setError('');setNotice('');setBusy(true);
  try{
   const data=editing?{nome:form.nome.trim(),email:form.email.trim(),papel:form.papel,ativo:form.ativo,...(form.senha?{senha:form.senha}:{})}:{nome:form.nome.trim(),email:form.email.trim(),papel:form.papel,senha:form.senha};
   await api(editing?'/'+editing:'',editing?'PATCH':'POST',data);await reload();reset();setNotice('Usuário salvo com sucesso.');
  }catch(e){setError(String(e));}finally{setBusy(false);}
 }
 return <div className="admin-dashboard user-admin">
  <div className="admin-dashboard-header"><div><span className="admin-kicker">CONFIGURAÇÕES / SEGURANÇA</span><h1>Usuários</h1><p>Controle as contas, permissões e o acesso ao painel administrativo.</p></div></div>
  {error&&<div className="admin-alert admin-alert-error" role="alert">{error}</div>}{notice&&<div className="admin-alert admin-alert-ok" role="status">{notice}</div>}
  {loading?<div className="admin-panel admin-empty">Carregando usuários...</div>:userRole==='ADMINISTRADOR'?<>
  <div className="admin-stats"><div className="admin-stat"><span>Usuários cadastrados</span><strong>{items.length}</strong></div><div className="admin-stat"><span>Ativos</span><strong>{items.filter(u=>u.ativo).length}</strong></div><div className="admin-stat"><span>Administradores</span><strong>{items.filter(u=>u.papel==='ADMINISTRADOR'&&u.ativo).length}</strong></div></div>
  <section className="admin-panel user-editor-panel"><div className="admin-panel-title"><div><span className="admin-step">{editing?'EDIÇÃO DE CONTA':'NOVA CONTA'}</span><h2>{editing?'Editar usuário':'Cadastrar usuário'}</h2></div></div>
   <form className="user-admin-form" onSubmit={e=>void submit(e)}>
    <div className="admin-two-fields"><div className="admin-field"><label htmlFor="user-name">Nome <b>*</b></label><input id="user-name" minLength={2} maxLength={150} required value={form.nome} onChange={e=>setForm(p=>({...p,nome:e.target.value}))}/></div><div className="admin-field"><label htmlFor="user-email">E-mail <b>*</b></label><input id="user-email" type="email" required value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></div></div>
    <div className="admin-two-fields"><div className="admin-field"><label htmlFor="user-role">Permissão <b>*</b></label><select id="user-role" value={form.papel} onChange={e=>setForm(p=>({...p,papel:e.target.value as Role}))}><option value="EDITOR">Editor</option><option value="GESTOR">Gestor</option><option value="ADMINISTRADOR">Administrador</option></select></div><div className="admin-field"><label htmlFor="user-pass">{editing?'Nova senha (opcional)':'Senha inicial'} <b>{editing?'':'*'}</b></label><div className="user-password-field"><input id="user-pass" type={showPass?'text':'password'} minLength={12} maxLength={200} required={!editing} autoComplete="new-password" value={form.senha} onChange={e=>setForm(p=>({...p,senha:e.target.value}))} placeholder={editing?'Deixe vazio para manter a atual':'Mínimo de 12 caracteres'}/><button type="button" onClick={()=>setShowPass(v=>!v)} aria-label={showPass?'Ocultar senha':'Mostrar senha'}>{showPass?'Ocultar':'Mostrar'}</button></div></div></div>
    {editing&&<label className="admin-check"><input type="checkbox" checked={form.ativo} onChange={e=>setForm(p=>({...p,ativo:e.target.checked}))}/> Permitir acesso ao painel (usuário ativo)</label>}
    <div className="health-admin-actions"><button className="admin-button admin-button-primary" disabled={busy} type="submit">{busy?'Salvando...':editing?'Salvar alterações':'Cadastrar usuário'}</button>{editing&&<button className="admin-button admin-button-outline" type="button" onClick={reset}>Cancelar edição</button>}</div>
   </form>
  </section>
  <section className="admin-panel"><div className="admin-panel-title"><div><h2>Contas cadastradas</h2><p>Desative um usuário para bloquear o acesso sem excluir o histórico.</p></div></div>
   <div className="admin-table-scroll"><table className="admin-pages-table"><thead><tr><th>Usuário</th><th>Permissão</th><th>Situação</th><th>Ação</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td><strong>{item.nome}</strong><span>{item.email}</span></td><td>{item.papel==='ADMINISTRADOR'?'Administrador':item.papel==='GESTOR'?'Gestor':'Editor'}</td><td><span className={'acts-status '+(item.ativo?'is-public':'')}>{item.ativo?'Ativo':'Desativado'}</span></td><td><button className="user-edit-button" type="button" onClick={()=>edit(item)}>Editar</button></td></tr>)}</tbody></table></div>
  </section></>:null}
 </div>;
}
