'use client';
export function AdminLogout(){return <button type="button" className="admin-logout" onClick={async()=>{await fetch('/api/admin-logout',{method:'POST'});window.location.assign('/admin/login');}}>Sair da conta</button>;}
