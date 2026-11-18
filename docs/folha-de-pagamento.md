# Folha de Pagamento — Transparência

## Rotas sem acentuação
- Índice público: `/transparencia/folha-de-pagamento`
- Comissionados: `/transparencia/folha-de-pagamento/comissionados`
- Efetivos: `/transparencia/folha-de-pagamento/efetivos`
- Contratados: `/transparencia/folha-de-pagamento/contratados`
- Administração: as mesmas rotas precedidas por `/admin`

As três páginas públicas utilizam o mesmo componente, com filtro por exercício, pesquisa por mês e ano, contadores baseados nos registros publicados, e tabela por competência em ordem decrescente de ano/mês.

## Cadastro
- Categoria: determinada pela página administrativa escolhida
- Ano (1900 a 2200)
- Mês (janeiro a dezembro)
- Link HTTP(S) para o documento público
- Publicar ou manter em rascunho

O banco garante **uma competência por categoria/mês/ano**; tentativas de duplicação retornam erro 409. Não foi adicionado nenhum documento fictício. Somente ADMINISTRADOR e GESTOR podem modificar; EDITOR apenas consulta. As páginas públicas exibem somente registros publicados.

Os arquivos hospedados em terceiros abrem em nova guia. Baixar automaticamente depende dos cabeçalhos oferecidos pelo servidor de documentos.

A página inicial da Transparência possui um atalho para Folha de Pagamento, e o menu lateral administrativo também.

## Atualizar no Windows

```bash
git pull origin create
pm2 stop guarara-api
npm run db:generate
npm run db:migrate
npm run build
pm2 restart ecosystem.config.cjs --update-env
```

A migração `20261118200000_folha_pagamento` acrescenta o enum `TipoFolhaPagamento` e a tabela `FolhaPagamento` sem excluir dados existentes. O build ainda precisa ser validado no ambiente de desenvolvimento.
