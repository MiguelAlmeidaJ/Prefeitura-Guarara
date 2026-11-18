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
