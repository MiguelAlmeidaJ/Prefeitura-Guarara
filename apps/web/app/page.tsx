import Link from 'next/link';
import { sections } from '../lib/navigation';
export default function Home() { return <>
  <section className="section"><div className="wrap"><h2>Acesso rápido</h2><div className="grid">{sections.map(section=><Link className="tile" href={'/'+section.slug} key={section.slug}><strong>{section.title}</strong><span className="muted">{section.description}</span></Link>)}</div></div></section>
  <section className="section"><div className="wrap"><h2>Comunicados</h2><p className="muted">Ainda não há comunicados cadastrados.</p></div></section>
</> }
