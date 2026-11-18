# Secretarias — Obras e Saúde

## Obras
- Pública: `/secretarias/obras`
- Administração: `/admin/secretarias/obras`
- Links legados `/obras-publicas` (redirecionamento permanente) e `/admin/obras-publicas` (redirecionamento administrativo)
- Os dados, filtros, categorias e recursos continuam usando as mesmas tabelas do módulo de obras existente.

## Saúde
- Pública: `/secretarias/saude`
- Administração: `/admin/secretarias/saude`
- API pública: `GET /api/saude`; API administrativa: `GET /api/admin/saude`, `PATCH /api/admin/saude/configuracao`, `POST /api/admin/saude/conteudos`, `PATCH /api/admin/saude/conteudos/:id`, `DELETE /api/admin/saude/conteudos/:id`.
- Os cadastros são organizados em PAS, Conselho Municipal de Saúde, Portarias, Escalas, Medicamentos e Estoque.
- Um registro contém título, descrição, ano opcional, link HTTP(S), texto do botão, segundo link opcional, indicação de destaque e ordem.
- A ficha institucional pode incluir secretário(a), telefone, endereço, horário e descrição. Nenhum nome ou contato de autoridade foi preenchido sem confirmação.
- ADMINISTRADOR e GESTOR podem gravar/excluir; EDITOR apenas visualiza. Registros tornam-se públicos imediatamente ao serem salvos.
- **Atenção:** documentos e links são campos de URL; não há upload de arquivos nem dados importados automaticamente.

O menu do portal é administrado em `/admin/menu`. Cadastre links `/secretarias/obras` e `/secretarias/saude` para incluí-los no cabeçalho.

### Atualização no Windows, usando PM2

```bash
git pull origin create
pm2 stop guarara-api
npm run db:generate
npm run db:migrate
npm run build
pm2 restart ecosystem.config.cjs --update-env
```

A migração `20261118150000_saude` adiciona `SaudeConfiguracao` e `SaudeConteudo`. Nenhum dado anterior é excluído. Valide a compilação e os conteúdos antes de publicar links oficiais.

## Formulário especial de Escalas de Atendimento

A aba Escalas usa cinco campos próprios: **Categoria**, **Nome**, **Descrição**, **Link do botão** e **Nome do botão**. Categoria e nome do botão são obrigatórios para novos registros e alterações. Categoria é texto livre nesta versão. O nome é armazenado no campo `titulo`, e o botão reutiliza `link` e `textoBotao`. O campo `categoria` é opcional no banco para preservar escalas antigas, que exibem o rótulo genérico até serem editadas. Os outros tipos de conteúdo permanecem com o formulário anterior.

Execute a migração `20261118170000_categoria_escala` após parar a API para gerar o Prisma Client sem bloqueio de DLL no Windows.

## Atualização dos formulários e da interface de Saúde

- **Estoque de medicamentos**: o formulário solicita apenas **Ano** e **Link**. O título interno e o botão **Baixar PDF** são preenchidos automaticamente. Registros anteriores continuam preservados.
- **Portarias**: o formulário solicita **Nome**, **Descrição** e **Link**. Campos antigos de ano e botões auxiliares deixam de ser exibidos.
- **Escalas**: continuam com Categoria, Nome, Descrição, Link do botão e Nome do botão.
- As listagens administrativas exibem uma alça **⠿** para arrastar e soltar. A nova ordem é validada e gravada via `PATCH /api/admin/saude/ordenar` em uma transação, separadamente para cada tipo de conteúdo; não há migração de banco para isso.
- **PAS e Estoque**: a página pública organiza por ano decrescente, independentemente da ordem editorial. Ano vigente = ano civil atual em `America/Sao_Paulo`; exercício anterior = ano civil atual menos um; demais anos = histórico. As classificações mudam automaticamente na virada do ano. O cadastro não exige campo manual de status.
- A página pública foi redesenhada usando as cores institucionais, cartões mais espaçosos, botões consistentes, Poppins e ícones SVG em vez de emojis. Nenhuma informação municipal foi fabricada.

Após atualizar: `git pull origin create`, `npm run build`, `pm2 restart ecosystem.config.cjs --update-env`. Não é necessário executar `prisma generate` ou uma migração nova.
