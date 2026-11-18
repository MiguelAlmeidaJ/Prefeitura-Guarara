# Portal da Transparência — Guarará

- **Pública:** `/transparencia` (pasta sem acentos)
- **Administração:** `/admin/transparencia`
- **API pública:** `GET /api/transparencia`
- **API administrativa:** `GET /api/admin/transparencia`, `PATCH /api/admin/transparencia/configuracao`, CRUD para `/grupos` e `/links`, `PATCH /api/admin/transparencia/ordenar`.
- Grupos com **nome** e **descrição opcional**; links com **nome**, **descrição**, **URL**, **grupo**, **etiqueta opcional** e **abrir em nova guia**.
- Ordenação drag-and-drop para grupos e links dentro do mesmo grupo, persistida por transação. Para transferir um link entre grupos, edite seu grupo.
- Gestão de um destaque **Portal da Transparência Fiscal** com URL e descrição. Se não houver URL, o destaque não é exibido.
- Links aceitam caminhos internos iniciados por `/` ou URLs HTTP(S).
- Excluir grupo com links é bloqueado. A API exige papel `ADMINISTRADOR` ou `GESTOR` para modificações.
- A página pública mostra agrupamentos em cartões e não publica dados fictícios. A captura enviada foi utilizada como **referência visual**, não como fonte verificada de URLs oficiais, indicadores ou certificações.
- Não exibir automaticamente alegações de conformidade, selos PNTP, atualização em tempo real ou rankings: esses dados precisam ser confirmados e mantidos oficialmente.

## Atualização Windows / PM2

```bash
git pull origin create
pm2 stop guarara-api
npm run db:generate
npm run db:migrate
npm run build
pm2 restart ecosystem.config.cjs --update-env
```

A migração `20261118195000_transparencia` adiciona as tabelas `TransparenciaConfiguracao`, `TransparenciaGrupo` e `TransparenciaLink`, sem apagar as anteriores.

A navegação pública gerenciada em `/admin/menu` pode incluir o link `/transparencia`.
