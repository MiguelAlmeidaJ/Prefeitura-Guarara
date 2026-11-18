'use client';
import Link from 'next/link';
import {useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';

function Eye({hidden}:{hidden:boolean}){return hidden?
 <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7"/><path d="M6.5 6.5C4.3 8 2.6 10 2 12c1.7 5.2 6.2 8 10 8 1.9 0 3.9-.7 5.6-2M9.9 4.2A11 11 0 0112 4c4.2 0 8.5 2.8 10 8a13 13 0 01-2.5 4.1"/></svg>:
 <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.7-7 10-7 10 7 10 7-3.7 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>}
export default function LoginPage(){
 const router=useRouter();
 const [email,setEmail]=useState('');
 const [senha,setSenha]=useState('');
 const [showPassword,setShowPassword]=useState(false);
 const [remember,setRemember]=useState(false);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setError('');setLoading(true);
  try {
   const response=await fetch('/api/admin-login',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({email,senha,remember})});
   if(!response.ok){setError(response.status===401?'E-mail ou senha incorretos.':'Não foi possível entrar. Tente novamente.');return;}
   setSenha('');router.replace('/admin');router.refresh();
  }catch{setError('Não foi possível conectar ao servidor. Verifique sua conexão.');}
  finally{setLoading(false);}
 }
 return <main className="auth-shell"><div className="auth-decoration" aria-hidden="true"/>
  <section className="auth-card" aria-label="Acesso administrativo">
   <Link href="/" className="auth-logo" aria-label="Voltar ao portal da Prefeitura de Guarará"><span className="auth-logo-mark">G</span><span>Prefeitura Municipal de<strong>GUARARÁ <small>MG</small></strong></span></Link>
   <div className="auth-heading"><span className="auth-eyebrow">ÁREA RESTRITA</span><h1>Bem-vindo de volta</h1><p>Entre com suas credenciais para acessar o painel administrativo.</p></div>
   <form onSubmit={submit} className="auth-form">
    <label htmlFor="login-email">E-mail institucional</label>
    <input id="login-email" type="email" autoComplete="username" autoFocus required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu.email@prefeitura.mg.gov.br"/>
    <div className="auth-password-heading"><label htmlFor="login-password">Senha</label><Link href="/admin/esqueci-senha">Esqueci minha senha</Link></div>
    <div className="auth-password-field"><input id="login-password" type={showPassword?'text':'password'} autoComplete="current-password" required value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Digite sua senha"/><button type="button" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?'Ocultar senha':'Mostrar senha'} aria-pressed={showPassword}>{Eye({hidden:!showPassword})}</button></div>
    <label className="auth-remember"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/> <span>Lembrar acesso neste dispositivo</span></label>
    {error&&<p className="auth-error" role="alert">{error}</p>}
    <button className="auth-submit" type="submit" disabled={loading}>{loading?'Entrando...':'Acessar painel'} <span aria-hidden="true">→</span></button>
   </form>
   <div className="auth-card-bottom"><span>Ambiente seguro de gestão municipal</span><Link href="/">← Voltar ao site público</Link></div>
  </section>
  <p className="auth-bottom-note">© Prefeitura Municipal de Guarará • Acesso exclusivo para usuários autorizados</p>
 </main>;
}
