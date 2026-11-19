'use client';
import {useEffect,useState} from 'react';
type Message={id:string;nome:string;email:string;endereco:string|null;telefone:string|null;descricao:string;lida:boolean;criadoEm:string};
async function api<T>(path='',method='GET'):Promise<T>{
 const response=await fetch('/api/admin-proxy/admin/contatos'+path,{method,cache:'no-store'});
 if(response.status===401){window.location.assign('/admin/login');throw Error('Sessão expirada');}
 if(!response.ok)throw Error('Não foi possível consultar as mensagens. Código '+response.status);
 return response.json() as Promise<T>;
}
export default function ContatosAdmin(){
 const [items,setItems]=useState<Message[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[selected,setSelected]=useState<string|null>(null),[busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;api<Message[]>().then(data=>{if(active)setItems(data);}).catch(err=>{if(active)setError(String(err));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false};},[]);
 async function open(message:Message){
  setSelected(message.id);
  if(message.lida)return;
  setBusy(true);
  try{await api('/'+message.id+'/ler','PATCH');setItems(current=>current.map(item=>item.id===message.id?{...item,lida:true}:item));}
  catch(err){setError(String(err));}finally{setBusy(false);}
 }
 const unread=items.filter(item=>!item.lida).length;
 return <div className="admin-dashboard home-messages-admin">
  <div className="admin-dashboard-header"><div><span className="admin-kicker">ATENDIMENTO / SOLICITAÇÕES</span><h1>Mensagens recebidas</h1><p>Consulte as solicitações enviadas pelo formulário da página inicial.</p></div></div>
  {error&&<div className="admin-alert admin-alert-error" role="alert">{error}</div>}
  <div className="admin-stats"><div className="admin-stat"><span>Mensagens recentes</span><strong>{items.length}</strong><small>Até 200 registros mais recentes</small></div><div className="admin-stat"><span>Não lidas</span><strong>{unread}</strong><small>Aguardando consulta</small></div></div>
  <section className="admin-panel"><div className="admin-panel-title"><div><h2>Caixa de entrada</h2><p>Selecione uma mensagem para consultar os dados completos e marcá-la como lida.</p></div></div>
   {loading?<div className="admin-empty">Carregando mensagens...</div>:items.length===0?<div className="admin-empty">Nenhuma solicitação recebida até o momento.</div>:<div className="home-messages-list">{items.map(item=><div key={item.id} className={'home-message-entry'+(!item.lida?' is-unread':'')}>
     <button type="button" className="home-message-trigger" onClick={()=>void open(item)} aria-expanded={selected===item.id}>
      <span className="home-message-status" aria-hidden="true"/><span className="home-message-person"><strong>{item.nome}</strong><small>{item.email}</small></span><span className="home-message-excerpt">{item.descricao}</span><time dateTime={item.criadoEm}>{new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'}).format(new Date(item.criadoEm))}</time><span aria-hidden="true">{selected===item.id?'−':'+'}</span>
     </button>
     {selected===item.id&&<div className="home-message-detail"><p className="home-message-detail-label">Mensagem</p><p className="home-message-detail-text">{item.descricao}</p><div className="home-message-contacts"><div><strong>E-mail</strong><a href={'mailto:'+item.email}>{item.email}</a></div>{item.telefone&&<div><strong>Telefone</strong><a href={'tel:'+item.telefone.replace(/\D/g,'')}>{item.telefone}</a></div>}{item.endereco&&<div><strong>Endereço informado</strong><span>{item.endereco}</span></div>}</div></div>}
    </div>)}</div>}
   {busy&&<p className="home-message-updating">Atualizando situação...</p>}
  </section>
 </div>;
}
