'use client';
import {useEffect,useMemo,useState} from 'react';
type Option={id:string;nome:string};
type Obra={id:string;ano:number;numero:string;objeto:string;inicio:string;comprovacaoUrl:string;categoria:Option;recurso:Option};
type Options={categorias:Option[];recursos:Option[]};
function date(iso:string){return iso.slice(0,10).split('-').reverse().join('/');}
export function ObrasPublicasList(){
 const [obras,setObras]=useState<Obra[]>([]);
 const [options,setOptions]=useState<Options>({categorias:[],recursos:[]});
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [query,setQuery]=useState('');
 const [year,setYear]=useState('');
 const [category,setCategory]=useState('');
 const [resource,setResource]=useState('');
 const [page,setPage]=useState(1);
 useEffect(()=>{let active=true;(async()=>{
  try{
   const [result,selects]=await Promise.all([fetch('/api/obras-publicas',{cache:'no-store'}),fetch('/api/obras-publicas/opcoes',{cache:'no-store'})]);
   if(!result.ok||!selects.ok)throw Error('Não foi possível carregar as obras públicas');
   const [records,opts]=await Promise.all([result.json() as Promise<Obra[]>,selects.json() as Promise<Options>]);
   if(active){setObras(records);setOptions(opts);}
  }catch(error){if(active)setError(String(error));}finally{if(active)setLoading(false);}
 })();return()=>{active=false};},[]);
 const years=useMemo(()=>[...new Set(obras.map(item=>item.ano))].sort((a,b)=>b-a),[obras]);
 const filtered=useMemo(()=>obras.filter(item=>(!year||String(item.ano)===year)&&(!category||item.categoria.id===category)&&(!resource||item.recurso.id===resource)&&(!query.trim()||(item.numero+' '+item.objeto+' '+item.categoria.nome+' '+item.recurso.nome).toLocaleLowerCase('pt-BR').includes(query.trim().toLocaleLowerCase('pt-BR')))),[obras,year,category,resource,query]);
 const count=20;
 const pages=Math.max(1,Math.ceil(filtered.length/count));
 const current=Math.min(page,pages);
 const entries=filtered.slice((current-1)*count,current*count);
 const change=(setter:(value:string)=>void)=>(value:string)=>{setter(value);setPage(1);};
 return <section className="obras-public-section"><div className="wrap">
  <div className="obras-public-statbar"><div><span>Obras cadastradas</span><strong>{obras.length}</strong></div><div><span>Categorias</span><strong>{options.categorias.length}</strong></div><div><span>Fontes de recurso</span><strong>{options.recursos.length}</strong></div><div><span>Períodos disponíveis</span><strong>{years.length}</strong></div></div>
  <div className="obras-public-card"><div className="obras-public-card-head"><div><span className="obras-public-kicker">CONSULTA DE OBRAS</span><h2>Relação de obras públicas</h2><p>Pesquise por objeto ou número e filtre por ano, categoria ou recurso.</p></div></div>
   <div className="obras-public-filters"><label>Pesquisar<input type="search" placeholder="Número ou objeto da obra..." value={query} onChange={e=>change(setQuery)(e.target.value)}/></label><label>Ano<select value={year} onChange={e=>change(setYear)(e.target.value)}><option value="">Todos os anos</option>{years.map(y=><option value={y} key={y}>{y}</option>)}</select></label><label>Categoria<select value={category} onChange={e=>change(setCategory)(e.target.value)}><option value="">Todas as categorias</option>{options.categorias.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select></label><label>Recurso<select value={resource} onChange={e=>change(setResource)(e.target.value)}><option value="">Todos os recursos</option>{options.recursos.map(r=><option key={r.id} value={r.id}>{r.nome}</option>)}</select></label></div>
   <div className="obras-public-resultbar"><span>{loading?'Carregando registros...':filtered.length+' obra(s) encontrada(s)'}</span><button type="button" onClick={()=>{setQuery('');setYear('');setCategory('');setResource('');setPage(1);}}>Limpar filtros</button></div>
   {error?<p className="obras-public-error" role="alert">{error}</p>:loading?<p className="obras-public-empty">Carregando dados...</p>:filtered.length===0?<p className="obras-public-empty">Nenhuma obra encontrada para os filtros selecionados.</p>:<div className="obras-public-table-scroll"><table className="obras-public-table"><thead><tr><th>Ano</th><th>Número</th><th>Objeto</th><th>Categoria</th><th>Recurso</th><th>Início</th><th>Comprovação</th></tr></thead><tbody>{entries.map(item=><tr key={item.id}><td>{item.ano}</td><td><strong>{item.numero}</strong></td><td className="obras-public-object">{item.objeto}</td><td><span className="obras-public-category">{item.categoria.nome}</span></td><td>{item.recurso.nome}</td><td>{date(item.inicio)}</td><td><a href={item.comprovacaoUrl} target="_blank" rel="noopener noreferrer" className="obras-public-proof">Visualizar ↗</a></td></tr>)}</tbody></table></div>}
   {!loading&&!error&&filtered.length>count&&<div className="obras-pagination"><button type="button" disabled={current===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>← Anterior</button><span>Página {current} de {pages}</span><button type="button" disabled={current===pages} onClick={()=>setPage(p=>Math.min(pages,p+1))}>Próxima →</button></div>}
  </div>
 </div></section>;
}
