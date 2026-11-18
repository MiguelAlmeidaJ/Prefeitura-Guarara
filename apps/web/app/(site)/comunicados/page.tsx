import type {Metadata} from 'next';
import {ComunicadosCatalogo} from '../../../components/comunicados-publicos';
export const metadata:Metadata={title:'Comunicados',description:'Avisos e comunicados oficiais da Prefeitura Municipal de Guarará'};
export default function Page(){return <ComunicadosCatalogo/>;}
