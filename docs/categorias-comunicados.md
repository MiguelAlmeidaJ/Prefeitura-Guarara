# Categorias e capas de Comunicados — Prefeitura de Guarará

## Editor de texto: negrito
O renderizador de Markdown confundia qualquer trecho de formatação com o primeiro grupo de captura dos links. Corrigida a distinção entre **negrito**, *itálico* e [links](https://example.org). O editor visual continua armazenando o conteúdo como Markdown compatível com comunicados antigos.

**Nota:** se o conteúdo tiver sido salvo já sem as palavras do trecho em negrito, o sistema não poderá reconstruí-las. Edite o comunicado e escreva novamente o texto perdido. Se a marcação `**texto**` estiver presente no banco, o novo renderizador a exibirá em negrito.

## Categorias
- Gestão: `/admin/comunicados/categorias`.
- Campos: **nome**, identificador sem acentuação e **capa padrão da categoria**.
- CRUD de categorias, com proteção contra exclusão de categorias vinculadas a comunicados.
- No cadastro de comunicado, selecione a categoria (opcional).
- Na página `/comunicados`, há filtro por categoria.
- No carrossel e no catálogo, o rótulo da categoria acompanha a data.

## Ordem de preferência das capas
1. Capa **exclusiva do comunicado** (enviada no próprio formulário).
2. Capa **padrão da categoria**.
3. Capa **geral dos comunicados** em `/admin/configuracoes/imagens-padronizadas`.
4. Se nenhuma imagem existir, aparece um placeholder neutro.

Na tela `/admin/configuracoes/imagens-padronizadas`, é possível enviar uma capa diretamente para cada categoria. A criação/edição de categorias e imagens também está disponível em `/admin/comunicados/categorias`.

Arquivos PNG/JPG/WebP até **4 MB** ficam no armazenamento do portal (fora de `.next`) e requerem backup. URLs não são criadas a partir de nomes digitados: somente nomes retornados pelo sistema de upload são persistidos.

## Banco de dados
Migração: `20261118220000_categorias_comunicados`, que cria `CategoriaComunicado` e adiciona `categoriaId` **opcional** à tabela `Comunicado`, preservando os comunicados existentes. Eles continuam sem categoria até serem editados.

## Atualização no Windows / PM2
```bash
git pull origin create
pm2 stop guarara-api
npm run db:generate
npm run db:migrate
npm run build
pm2 restart ecosystem.config.cjs --update-env
pm2 status
```

Verifique após atualizar: um comunicado antigo com trecho em negrito, uma categoria com capa, um comunicado sem capa exclusiva, outro com capa exclusiva, além do filtro público. O código foi publicado no GitHub; migração e build local ainda precisam ser executados.
