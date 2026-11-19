'use client';
import {useState,type FormEvent} from 'react';

type Draft={nome:string;endereco:string;telefone:string;email:string;descricao:string;website:string};
const initial:Draft={nome:'',endereco:'',telefone:'',email:'',descricao:'',website:''};

const phones=[
 {nome:'Prefeitura Municipal de Guarará',telefone:'(32) 3483-0809'},
 {nome:'Assistência Social',telefone:'(32) 3483-0805'},
 {nome:'Saúde',telefone:'(32) 3483-0807'},
 {nome:'Educação',telefone:'(32) 3483-0804'},
 {nome:'Polícia Militar',telefone:'(32) 3483-0808'},
 {nome:'Defesa Civil',telefone:'(32) 3483-0806'}
];
export function HomeContact(){
 const [draft,setDraft]=useState<Draft>(initial);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [sent,setSent]=useState(false);
 function change<K extends keyof Draft>(key:K,value:Draft[K]){setDraft(prev=>({...prev,[key]:value}));}
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;setBusy(true);setError('');
  try{
   const response=await fetch('/api/contato',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(draft)});
   const data=await response.json() as {ok?:boolean;error?:string};
   if(!response.ok||!data.ok)throw new Error(data.error||'Não foi possível enviar sua mensagem.');
   setDraft(initial);setSent(true);
  }catch(err){setError(err instanceof Error?err.message:'Não foi possível enviar sua mensagem.');}
  finally{setBusy(false);}
 }
 return <section className="home-contact-section section" id="fale-conosco" aria-labelledby="home-contact-title">
  <div className="wrap">
   <div className="home-contact-header"><span className="section-kicker">FALE COM A PREFEITURA</span><h2 id="home-contact-title">Estamos aqui para <em>ouvir você.</em></h2><p>Entre em contato com nossa equipe ou consulte os telefones dos principais setores municipais.</p></div>
   <div className="home-contact-grid">
    <div className="home-contact-panel">
     <div className="home-contact-panel-head"><span className="home-contact-panel-number">01</span><div><h3>Envie sua mensagem</h3><p>Preencha os dados para encaminhar sua solicitação à Prefeitura.</p></div></div>
     {sent?<div className="home-contact-success" role="status"><div className="home-contact-success-mark">✓</div><h3>Mensagem recebida!</h3><p>Sua solicitação foi registrada no sistema da Prefeitura. Nossa equipe poderá consultar as informações enviadas.</p><button type="button" onClick={()=>setSent(false)}>Enviar outra mensagem <span aria-hidden="true">→</span></button></div>:
     <form className="home-contact-form" onSubmit={e=>void submit(e)}>
      <div className="home-contact-form-row">
       <div className="home-contact-field"><label htmlFor="contact-name">Nome completo <span>*</span></label><input id="contact-name" name="nome" autoComplete="name" maxLength={130} minLength={2} required placeholder="Como podemos chamar você?" value={draft.nome} onChange={e=>change('nome',e.target.value)}/></div>
       <div className="home-contact-field"><label htmlFor="contact-phone">Telefone</label><input id="contact-phone" name="telefone" type="tel" autoComplete="tel" maxLength={30} placeholder="(32) 90000-0000" value={draft.telefone} onChange={e=>change('telefone',e.target.value)}/></div>
      </div>
      <div className="home-contact-form-row">
       <div className="home-contact-field"><label htmlFor="contact-email">E-mail <span>*</span></label><input id="contact-email" name="email" type="email" maxLength={160} autoComplete="email" required placeholder="seu@email.com" value={draft.email} onChange={e=>change('email',e.target.value)}/></div>
       <div className="home-contact-field"><label htmlFor="contact-address">Endereço</label><input id="contact-address" name="endereco" autoComplete="street-address" maxLength={250} placeholder="Rua, número e bairro" value={draft.endereco} onChange={e=>change('endereco',e.target.value)}/></div>
      </div>
      <div className="home-contact-field"><label htmlFor="contact-description">Como podemos ajudar? <span>*</span></label><textarea id="contact-description" name="descricao" rows={5} minLength={10} maxLength={4000} required placeholder="Descreva sua solicitação, dúvida ou sugestão..." value={draft.descricao} onChange={e=>change('descricao',e.target.value)}/><small>{draft.descricao.length} / 4.000 caracteres</small></div>
      <div className="home-contact-honeypot" aria-hidden="true"><label htmlFor="contact-website">Não preencher</label><input id="contact-website" tabIndex={-1} autoComplete="off" value={draft.website} onChange={e=>change('website',e.target.value)}/></div>
      {error&&<p className="home-contact-error" role="alert">{error}</p>}
      <div className="home-contact-submit-row"><p>Os dados informados serão usados para atender à sua solicitação.</p><button type="submit" disabled={busy}>{busy?'Enviando...':'Enviar mensagem'}<span aria-hidden="true">↗</span></button></div>
     </form>}
    </div>
    <aside className="home-contact-phones" aria-labelledby="home-contact-phones-title">
     <div className="home-contact-panel-head"><span className="home-contact-panel-number">02</span><div><h3 id="home-contact-phones-title">Telefones úteis</h3><p>Fale diretamente com os setores municipais.</p></div></div>
     <div className="home-phones-list">
      {phones.map((phone,i)=><a key={phone.nome} href={'tel:+55'+phone.telefone.replace(/\D/g,'')} className="home-phones-item"><span className="home-phones-index">{String(i+1).padStart(2,'0')}</span><span className="home-phones-description">{phone.nome}</span><strong>{phone.telefone}</strong><span className="home-phones-icon" aria-hidden="true">↗</span></a>)}
     </div>
     <div className="home-contact-phones-footer"><span className="home-contact-phones-dot"/><p>Atendimento pelos canais oficiais da Prefeitura Municipal de Guarará.</p></div>
    </aside>
   </div>
  </div>
 </section>;
}
