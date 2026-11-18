import Link from 'next/link';
export const metadata={title:'Recuperar acesso | Prefeitura de Guarará'};
export default function ForgotPage(){return <main className="auth-shell"><div className="auth-decoration" aria-hidden="true"/><section className="auth-card auth-forgot">
 <div className="auth-logo"><span className="auth-logo-mark">G</span><span>Prefeitura Municipal de<strong>GUARARÁ <small>MG</small></strong></span></div>
 <span className="auth-eyebrow">RECUPERAÇÃO DE ACESSO</span><h1>Esqueceu sua senha?</h1>
 <p>Por segurança, a recuperação automática por e-mail ainda não está disponível. Solicite a redefinição da sua senha ao administrador responsável pelo portal.</p>
 <Link className="auth-submit auth-back" href="/admin/login">← Voltar ao login</Link>
 </section></main>;}
