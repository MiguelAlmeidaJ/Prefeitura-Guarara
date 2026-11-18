# E-mails Oficiais — Prefeitura de Guarará

- Página pública: `/serviços/emails` (também `/servicos/emails`, com redirecionamento).
- Administração: `/admin/servicos/emails`, disponível no menu lateral em **Serviços**.
- API pública: `GET /api/emails-oficiais`.
- API administrativa: `GET /api/admin/emails-oficiais`; operações em `/grupos`, `/emails` e `/ordenar`.
- Os contatos são cadastrados com **nome do setor**, **e-mail** e **grupo**. Os grupos podem ser criados, renomeados, ordenados e excluídos se estiverem vazios.
- Itens podem ser editados, removidos, movidos para outro grupo e reordenados por arrastar e soltar dentro do mesmo grupo. A ordem é persistida pela API.
- Na página pública há pesquisa por setor/endereço, filtros por grupos, links `mailto:` e botão **Copiar**.
- Não há e-mails ou nomes de setores pré-cadastrados ou inventados: todas as informações devem ser conferidas pela Prefeitura antes da publicação.
- A gravação exige papel `ADMINISTRADOR` ou `GESTOR`; o perfil `EDITOR` pode visualizar.

## Atualização no Windows + PM2

```bash
git pull origin create
pm2 stop guarara-api
npm run db:generate
npm run db:migrate
npm run build
pm2 restart ecosystem.config.cjs --update-env
```

A migração `20261118193000_emails_oficiais` cria as tabelas `GrupoEmailOficial` e `EmailOficial`, sem remover dados existentes.

Caso deseje incluir o catálogo no menu do site, cadastre um item com destino `/serviços/emails` no painel `/admin/menu`.
