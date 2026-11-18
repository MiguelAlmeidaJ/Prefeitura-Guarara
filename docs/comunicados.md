# Comunicados e Imagens Padronizadas — Guarará

## Rotas sem acentos
- Público: `/comunicados`
- Comunicado individual: `/comunicados/[slug]`
- Cadastro administrativo: `/admin/comunicados`
- Configurações de capa: `/admin/configuracoes/imagens-padronizadas`
- Atalho sem painel: `/configuracoes/imagens-padronizadas` redireciona ao admin.
- API pública: `GET /api/comunicados`, `GET /api/comunicados/:slug`
- API administrativa: `/api/admin/comunicados` (GET/POST, PATCH/DELETE por ID)
- Upload da capa: `/api/admin-imagens-padronizadas`
- Imagem pública: `/api/capa-comunicados`

## Cadastro
- **Título** e slug gerado automaticamente (editável)
- **Resumo** opcional para os cartões de listagem
- **Descrição** com editor formatado e pré-visualização (negrito, itálico, títulos, listas, citações e links)
- **Imagem de capa:** imagem padrão configurada em `/admin/configuracoes/imagens-padronizadas`, compartilhada entre todos os comunicados.
- Publicar ou salvar como rascunho.
- Após publicação, o comunicado aparece na home, na listagem e na página individual.

O conteúdo formatado é armazenado em texto com marcação Markdown limitada. A renderização é feita por componentes React, **sem inserir HTML bruto**, reduzindo riscos de XSS. Links reconhecidos são HTTP(S) e abrem em nova guia com `noopener noreferrer`.

O banco já possuía a tabela `Comunicado` desde a migração inicial; **não há migração nova**.

## Permissões
- ADMINISTRADOR e GESTOR: criar, editar, publicar e excluir.
- EDITOR: criar e editar seus rascunhos, não publica ou altera comunicados publicados. A API valida as permissões.

## Imagens padronizadas
- Upload autenticado, disponível a ADMINISTRADOR e GESTOR; validação do Origin para ações mutáveis, assinatura dos arquivos e limite de 4 MB.
- Aceita PNG, JPG e WebP. Dimensão recomendada 1600 × 900 (16:9).
- A capa padrão fica em `apps/web/storage/imagens-padronizadas/`, ou diretório irmão de `SITE_IDENTITY_DIR`, e permanece após rebuild/PM2 restart.
- Configure backup da pasta de armazenamento e um volume compartilhado se houver várias instâncias.
- Sem capa configurada, o portal exibe um placeholder neutro.

## Carrossel
- Inclui até 9 comunicados publicados, ordenados por data de publicação decrescente.
- Três cartões por vez em desktop; navegação por setas.
- Em tablet e celular, rolagem horizontal com snap, adaptando o tamanho do cartão.
- O carrossel não simula comunicados: exibe mensagem de estado vazio até o primeiro cadastro.

## Atualizar no Windows
```bash
git pull origin create
npm run build
pm2 restart ecosystem.config.cjs --update-env
pm2 status
```

Não é necessário executar `db:migrate` para este módulo, desde que as migrações anteriores estejam aplicadas.

## Testes recomendados
1. Abra `/admin/configuracoes/imagens-padronizadas` e envie uma capa 16:9.
2. Em `/admin/comunicados`, crie um comunicado e experimente a barra do editor e a pré-visualização.
3. Salve um rascunho e confirme que não aparece publicamente.
4. Publique o comunicado e confira `/comunicados`, `/comunicados/[slug]` e o carrossel da home.
5. Verifique o carrossel em celular e desktop, e a persistência da capa após reiniciar o PM2.

Código publicado na branch `create`. Compilação e execução precisam ser validadas no ambiente local.
