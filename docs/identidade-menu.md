# Identidade visual e menu público — Guarará

## Rotas
- Administração: `/admin/configuracoes/identidade`
- Atalho: `/configuracoes/identidade` (redirecionamento para o painel protegido)
- Arquivos públicos: `/api/identidade/logo` e `/api/identidade/favicon`
- Upload autenticado: `POST /api/admin-identidade` (multipart/form-data)

## Logo e favicon
- A **logo** admite PNG, JPG e WebP; o **favicon** também admite ICO.
- Limite de **2 MB** por arquivo. A API confere assinatura básica de arquivo, extensão de armazenamento segura, identidade autenticada, papel ADMINISTRADOR/GESTOR e origem (CSRF).
- O arquivo fica salvo no disco local do servidor web, em `apps/web/storage/identidade/` por padrão, fora do diretório `.next`, e não é removido por `npm run build`.
- É possível ajustar o diretório de gravação por `SITE_IDENTITY_DIR`, recomendável em um volume persistente compartilhado quando houver mais de uma instância do Next.js.
- A logo enviada substitui o símbolo padrão do cabeçalho público; o favicon enviado substitui o ícone de fallback **G**. O nome institucional continua no cabeçalho.
- Antes do primeiro upload, o cabeçalho usa o símbolo anterior e o favicon usa um ícone G gerado pelo aplicativo.
- **Faça backup** do diretório `storage/identidade`; o Git não guarda as imagens enviadas.
- Se usar proxy reverso, permita requests multipart com até 2 MB e preserve os cabeçalhos Host/Origin. O upload acontece no processo web do Next.js (PM2 `guarara-web`), não no NestJS.

## Navegação pública
- Lê os itens de menu já cadastrados no banco.
- Dropdowns multinível por clique com setas separadas da navegação principal (abrir submenu sem perder o link do item).
- Fechamento ao clicar fora, pressionar Escape ou navegar para outra página.
- No celular, menu recolhido com navegação vertical e submenus expansíveis.
- Suporta páginas aninhadas até oito níveis; evite menus muito profundos por legibilidade.
- Nenhuma alteração na estrutura do banco de dados foi necessária.

## Aplicar
```bash
git pull origin create
npm run build
pm2 restart ecosystem.config.cjs --update-env
```

Depois acesse `http://localhost:3006/admin/configuracoes/identidade`, envie as duas imagens e verifique o cabeçalho e o favicon do portal. Pode ser necessário atualizar a aba para que o navegador descarte o favicon anterior.

O código foi enviado para a branch `create`; compilação e teste de upload devem ser verificados no ambiente de execução.
