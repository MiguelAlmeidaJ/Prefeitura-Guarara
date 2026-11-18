import type {Metadata} from 'next';
import {SaudePublicContent} from '../../../../components/saude-public-content';
export const metadata:Metadata={title:'Secretaria de Saúde',description:'Planos, documentos e escalas da Secretaria Municipal de Saúde de Guarará'};
export default function Saude(){return <SaudePublicContent/>;}
