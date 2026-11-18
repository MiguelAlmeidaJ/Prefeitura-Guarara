# Obras Públicas — Guarará

Rotas: `/obras-publicas` (pública), `/admin/obras-publicas` (autenticada).

## Dados da obra
- Ano e número
- Objeto (texto)
- Categoria (cadastro auxiliar)
- Recurso (cadastro auxiliar)
- Início (data, padrão: data atual no fuso de São Paulo)
- Link de comprovação (URL HTTP/HTTPS)

Categorias e recursos são gerenciados em janelas modais. O seletor pesquisável de categorias permite criar uma categoria ao digitar um nome inexistente. A API impede exclusão de uma categoria/recurso em uso. Apenas ADMINISTRADOR e GESTOR podem modificar dados.

O público pode pesquisar, filtrar por ano, categoria e recurso, abrir a comprovação e navegar por páginas de 20 registros. Não há importação de dados de outros municípios nem preenchimento fictício. Os registros são publicados diretamente quando cadastrados.

## Atualizar o ambiente Windows com PM2

```powershell
git pull origin create
pm2 stop guarara-api
npm run db:generate
npm run db:migrate
npm run build
pm2 restart ecosystem.config.cjs --update-env
```

A migração `20261118130000_obras_publicas` cria três tabelas e não remove dados existentes.

Para incluir acesso na navegação pública personalizada, cadastre no gerenciador `/admin/menu` um link com destino `/obras-publicas`. Há também um atalho na seção Transparência.
