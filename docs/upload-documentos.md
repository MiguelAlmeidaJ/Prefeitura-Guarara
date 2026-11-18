# Envio de arquivos em campos de documentos — Guarará

## Opções de cadastro
Os campos de endereço de documento permitem escolher entre:
- **URL externa:** o usuário cola o link tradicional para o arquivo
- **Upload local:** o administrador/editor envia um documento e o sistema gera automaticamente uma URL pública (`/api/arquivos/{id}.ext`), preenchendo o mesmo campo

Os links anteriores permanecem válidos. O envio não altera os esquemas de banco existentes nem exige migração.

## Módulos com upload
- Leis, decretos e portarias
- Folha de pagamento: comissionados, efetivos, contratados
- Protocolo
- Obras públicas: documento de comprovação
- Saúde: PAS, portarias, escalas, documentos de medicamentos e relatórios de estoque
- Tabelas reutilizáveis: células com um ou vários documentos
- Páginas e conteúdos: links da grade de serviços
- Transparência: links de acesso cadastrados

O seletor de arquivos é um componente reutilizável (`apps/web/components/document-upload.tsx`). A API é `POST /api/admin-arquivos`; os arquivos públicos são servidos por `GET /api/arquivos/[arquivo]`.

## Segurança e armazenamento
- É necessário estar autenticado no painel e ter perfil `ADMINISTRADOR`, `GESTOR` ou `EDITOR` para enviar arquivos.
- Verifica a origem da requisição (Host/Origin), tamanho e assinatura dos arquivos.
- Limite de **15 MB** por arquivo.
- Extensões aceitas: PDF, DOC, DOCX, XLS, XLSX, PPTX, ODT, ODS, PNG, JPG e WebP.
- Não aceita HTML, SVG, scripts ou executáveis.
- Salva com nome aleatório e não executável. Imagens e PDFs podem abrir no navegador; documentos Office são servidos para download com `Content-Disposition: attachment`.
- Os arquivos ficam no disco em `apps/web/storage/arquivos/` ou na pasta irmã de `SITE_IDENTITY_DIR`. Essa pasta deve estar em um volume persistente e incluída na rotina de backup.
- Os arquivos são públicos para quem possuir o endereço. **Não envie documentos com informações pessoais/sigilosas que não devam ser publicados.**
- Para evitar quebrar links publicados, os arquivos não são apagados automaticamente quando um registro é editado ou excluído. Isso pode deixar arquivos sem referência, exigindo política posterior de limpeza/retensão.

## Windows e PM2
```bash
git pull origin create
npm run build
pm2 restart ecosystem.config.cjs --update-env
pm2 status
```

Não existe migração Prisma para este recurso.

Recomendações de teste:
1. Crie uma portaria, escolha um arquivo PDF de até 15 MB, confira o campo URL preenchido e salve.
2. Abra a portaria pública e verifique o PDF.
3. Teste também um DOCX em Protocolo e o upload de PDF em Saúde.
4. Reinicie o PM2 e confira que os links seguem funcionando.
5. Confirme as permissões da pasta `storage/arquivos` e, em produção, ajuste o limite de tamanho do proxy reverso.

**Observação:** o upload ocorre antes de salvar o formulário; se o usuário cancelar o cadastro, o arquivo permanece no servidor. Limpeza automática poderá ser acrescentada em um gerenciador de arquivos futuro.
