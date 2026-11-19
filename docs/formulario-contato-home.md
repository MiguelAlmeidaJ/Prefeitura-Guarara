# Formulário de contato da home — Guarará

## Página pública
A seção **Explore o portal** foi removida da home. Em seu lugar, após a galeria da cidade e os atalhos rápidos, foi incluída uma área **Fale com a Prefeitura**, composta de:
- Formulário com **nome**, **telefone**, **e-mail**, **endereço** e **descrição**.
- Nome, e-mail e descrição são obrigatórios; telefone e endereço são opcionais.
- Validação de formato e limites de texto.
- Confirmação visual após gravação bem-sucedida no banco de dados e tratamento de erros.
- Telefones úteis apresentados em uma lista responsiva, com links clicáveis `tel:`.

Os telefones exibidos correspondem aos valores enviados como referência: Prefeitura Municipal de Guarará (32) 3483-0809, Assistência Social (32) 3483-0805, Saúde (32) 3483-0807, Educação (32) 3483-0804, Polícia Militar (32) 3483-0808 e Defesa Civil (32) 3483-0806. Confirme-os com os canais oficiais antes de publicar o portal.

## Destino das mensagens
As mensagens são **armazenadas no banco PostgreSQL**, não encaminhadas por e-mail. Somente ADMINISTRADOR e GESTOR podem consultá-las no painel `/admin/contatos` e marcá-las como lidas. O cadastro exibe até 200 mensagens mais recentes.

Endpoints:
- `POST /api/contato` (público; o frontend usa a rota de proxy do Next.js)
- `GET /api/admin/contatos` (restrito)
- `PATCH /api/admin/contatos/:id/ler` (restrito)

Proteções iniciais: validação de dados com Zod, campo antispam oculto, rejeição de excesso de mensagens pelo mesmo e-mail em uma janela de cinco minutos, e resposta pública sem dados confidenciais.

### Privacidade e publicação
As solicitações contêm dados pessoais (nome, e-mail e possivelmente telefone/endereço). Restrinja backups e acesso ao banco, configure política de retenção e publique uma política de privacidade adequada antes de oferecer o formulário ao público. Não há entrega automática por e-mail nem resposta automática ao solicitante.

## Migração
Criada `20261119120000_mensagens_contato` com tabela `MensagemContato` e índices de consulta. Migração não altera registros já existentes.

### Atualização
```bash
git pull origin create
pm2 stop guarara-api
npm run db:generate
npm run db:migrate
npm run build
pm2 restart ecosystem.config.cjs --update-env
pm2 status
```
Reinicie o PM2 somente após a compilação bem-sucedida. Verifique a home, o formulário, a mensagem no painel e a formatação em celular. A compilação e os envios ainda precisam ser testados no ambiente local.
