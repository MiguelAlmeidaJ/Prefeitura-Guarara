# Banner institucional da Home — Prefeitura Municipal de Guarará

## Exibição
- O banner aparece imediatamente abaixo do cabeçalho público, **somente na página inicial**.
- Proporção **1600 × 600 pixels (8:3)**, responsivo, sem distorção; largura máxima de 1600 px.
- Enquanto nenhuma imagem estiver configurada, a home não mostra seção vazia.
- Sem textos falsos ou arte oficial gerada automaticamente.

## Gerenciamento
- Entre no painel `/admin/configuracoes/imagens-padronizadas` (atalho `/configuracoes/imagens-padronizadas`).
- Na seção **Banner da home**, selecione PNG, JPG ou WebP de **1600 × 600 pixels** até **4 MB**.
- A interface valida as dimensões antes de enviar o arquivo.
- Somente usuários ADMINISTRADOR e GESTOR podem realizar o upload. O endpoint usa autenticação, validação de origem, tamanho e assinatura de arquivo.
- Endpoints: `GET/POST /api/admin-imagens-padronizadas` com `tipo=banner-home` no POST e `GET /api/banner-home` para a imagem pública.

## Persistência
O banner fica em `apps/web/storage/imagens-padronizadas/` ou na pasta correspondente a `SITE_IDENTITY_DIR` configurado no Next.js. Utiliza `banner-home.json` independente da capa geral dos comunicados e um arquivo de imagem com nome único.

Inclua esse diretório nos backups. A troca do banner não altera as capas dos comunicados.

## Atualização
Não houve alteração no Prisma:
```bash
git pull origin create
npm run build
pm2 restart ecosystem.config.cjs --update-env
```

Depois faça o upload em `http://localhost:3006/admin/configuracoes/imagens-padronizadas` e confira `http://localhost:3006/`. O build e o upload precisam ser validados no ambiente local.
