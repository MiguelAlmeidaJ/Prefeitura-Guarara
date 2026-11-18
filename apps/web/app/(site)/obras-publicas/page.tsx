import type {Metadata} from 'next';
import {ObrasPublicasList} from '../../../components/obras-publicas-list';
export const metadata:Metadata={title:'Obras Públicas',description:'Consulta de obras públicas da Prefeitura Municipal de Guarará'};
export default function ObrasPublicasPage(){return <><section className="obras-public-hero"><div className="wrap"><span className="obras-public-kicker">TRANSPARÊNCIA MUNICIPAL</span><h1>Obras Públicas <em>Guarará</em></h1><p>Consulte as obras públicas cadastradas, suas categorias, recursos de financiamento e documentos de comprovação.</p><div className="obras-public-hero-facts"><span>Consulta pública e gratuita</span><span>Dados atualizados pelo município</span></div></div></section><ObrasPublicasList/></>;}
