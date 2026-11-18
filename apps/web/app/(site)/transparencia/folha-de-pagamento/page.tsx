import Link from 'next/link';
import type {Metadata} from 'next';
import {folhaCategorias} from '../../../components/folha-pagamento-publica';
export const metadata:Metadata={title:'Folha de Pagamento',description:'Consulta pública das folhas de pagamento dos servidores da Prefeitura de Guarará'};
export default function FolhaPagamentoPage(){
 return <div className="payroll"><section className="law-hero"><div className="wrap"><div className="law-hero-heading"><span className="law-hero-icon" aria-hidden="true">▤</span><div><span className="law-kicker">TRANSPARÊNCIA · GESTÃO DE PESSOAS</span><h1>Folha de Pagamento</h1><p>Consulte os demonstrativos por categoria de vínculo e competência.</p></div></div></div></section><section className="law-content"><div className="wrap"><div className="payroll-landing-intro"><h2>Selecione uma categoria</h2><p>Os demonstrativos estão organizados por ano e mês para facilitar a consulta.</p></div><div className="payroll-landing-grid">{folhaCategorias.map(({slug,nome,descricao})=><Link href={'/transparencia/folha-de-pagamento/'+slug} key={slug} className="payroll-landing-card"><span className="payroll-landing-icon" aria-hidden="true">{slug==='comissionados'?'▣':slug==='efetivos'?'♙':'▤'}</span><strong>{nome}</strong><p>{descricao}</p><span className="payroll-landing-next">Ver relação →</span></Link>)}</div></div></section></div>;
}
