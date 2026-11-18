# Protocolo — Prefeitura de Guarará

- Página pública: `/serviços/protocolo`; atalho sem acento: `/servicos/protocolo` (redirecionamento).
- Cadastro administrativo protegido: `/admin/servicos/protocolo`.
- A API expõe `GET /api/protocolos` e operações autenticadas `/api/admin/protocolos`.
- Cadastro tem **Nome** e **Link** (HTTP/HTTPS), com editar/excluir e ordenação por arrastar e soltar.
- No portal público, o documento é apresentado em um card PDF com ação **Baixar PDF**. A âncora utiliza o atributo `download`. Para documentos em outro domínio, navegadores podem ignorar esse atributo e abrir o PDF; o servidor externo deve fornecer `Content-Disposition: attachment` para garantir o download.
- A página pública não exibe nomes/documentos fictícios antes de cadastrar conteúdos reais.
- O banner decorativo global do cabeçalho foi removido. Barra de identidade, pesquisa e navegação permanecem.
- O menu público cadastrado é independente: crie um link para `/serviços/protocolo` no painel `/admin/menu` para exibi-lo na navegação.

## Atualização do banco e da aplicação no Windows

```bash
git pull origin create
pm2 stop guarara-api
npm run db:generate
npm run db:migrate
npm run build
pm2 restart ecosystem.config.cjs --update-env
```

A migração `20261118190000_protocolo` cria apenas a tabela `ProtocoloFormulario`, preservando as existentes.
