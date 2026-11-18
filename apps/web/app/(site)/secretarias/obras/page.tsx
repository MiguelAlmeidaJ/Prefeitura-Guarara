import type {Metadata} from 'next';
import {ObrasPublicasList} from '../../../../components/obras-publicas-list';
export const metadata:Metadata={title:'Obras Públicas',description:'Consulta de obras públicas da Prefeitura Municipal de Guarará'};
export default function ObrasPublicasPage(){return <><section className="obras-public-hero"><div className="wrap"><span className="obras-public-kicker">SECRETARIA MUNICIPAL · OBRAS</span><h1>Secretaria de Obras <em>Guarará</em></h1><p>Consulte as obras públicas cadastradas, suas categorias, recursos de financiamento e documentos de comprovação.</p><div className="obras-public-hero-facts"><span>Transparência das obras municipais</span><span>Dados atualizados pelo município</span></div></div></section><ObrasPublicasList/></>;}
