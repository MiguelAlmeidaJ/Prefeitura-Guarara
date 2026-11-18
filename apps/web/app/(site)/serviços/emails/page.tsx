import type {Metadata} from 'next';
import {OfficialEmailsDirectory} from '../../../../components/official-emails-directory';
export const metadata:Metadata={title:'E-mails Oficiais',description:'Contatos institucionais dos setores e secretarias da Prefeitura Municipal de Guarará'};
export default function OfficialEmailsPage(){
 return <><section className="official-email-hero"><div className="wrap"><div className="official-email-kicker"><span aria-hidden="true">✉</span> CONTATOS INSTITUCIONAIS</div><h1>E-mails oficiais <span>da Prefeitura</span></h1><p>Encontre o contato institucional de cada secretaria ou setor da Prefeitura Municipal de Guarará. Clique no endereço para abrir seu aplicativo de e-mail ou utilize o botão para copiá-lo.</p></div></section>
 <section className="official-email-public-body"><div className="wrap"><OfficialEmailsDirectory/><div className="official-email-public-note"><strong>Comunicação institucional</strong><p>Confirme o destinatário antes de enviar documentos ou informações pessoais. Para solicitações formais, consulte também os canais de atendimento e a Ouvidoria da Prefeitura.</p></div></div></section></>;
}
