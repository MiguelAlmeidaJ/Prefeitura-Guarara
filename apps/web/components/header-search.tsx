'use client';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export function HeaderSearch() {
 const [query, setQuery] = useState('');
 const router = useRouter();
 function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const term = query.trim();
  if(term) router.push('/busca?q='+encodeURIComponent(term));
 }
 return <form className="site-search-form" role="search" onSubmit={submit}>
   <button type="submit" aria-label="Pesquisar páginas" className="site-search-button">
     <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.2" stroke="currentColor" strokeWidth="2"/><path d="m15.3 15.3 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
   </button>
   <input type="search" name="q" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Pesquisar páginas..." aria-label="Pesquisar páginas" />
 </form>;
}
