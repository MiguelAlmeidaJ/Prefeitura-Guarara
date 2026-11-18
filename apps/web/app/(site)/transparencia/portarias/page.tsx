import type {Metadata} from 'next';
import {AtosNormativosPublicos} from '../../../../components/atos-normativos-publicos';
export const metadata:Metadata={title:'Portarias Municipais',description:'Documentos oficiais da Prefeitura Municipal de Guarará'};
export default function Page(){return <AtosNormativosPublicos tipo="portarias"/>;}
