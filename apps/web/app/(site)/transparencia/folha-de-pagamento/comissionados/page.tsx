import type {Metadata} from 'next';
import {FolhaPagamentoPublica} from '../../../../../components/folha-pagamento-publica';
export const metadata:Metadata={title:'Folha de Pagamento — Comissionados'};
export default function Page(){return <FolhaPagamentoPublica categoria="comissionados"/>;}
