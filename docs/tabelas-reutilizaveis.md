# Catálogo de tabelas reutilizáveis

## Conceito

As tabelas existem independentemente das páginas. No painel **/admin/tabelas**, é possível criar uma tabela nomeada, configurar seu esquema de colunas, preencher linhas e reutilizá-la nas páginas do tipo Tabela Simples e Tabela em Abas.

### Exemplo de esquema

- Nome: `TEXTO`
- Descrição: `TEXTO`
- Documentos: `LINK` com `multiplos: true`

Um registro de exemplo:

```json
{
  "nome": "Relatório de gestão",
  "descricao": "Publicação anual",
  "documentos": [
    { "texto": "Relatório PDF", "url": "https://exemplo.gov.br/relatorio.pdf" },
    { "texto": "Anexo", "url": "https://exemplo.gov.br/anexo.pdf" }
  ]
}
```

Os links utilizam URLs HTTP(S), título legível e abertura segura em outra aba. A API valida colunas, chaves únicas, tipos dos valores, URLs e limite de registros.

## API

As rotas administrativas exigem JWT:

- `GET /api/admin/tabelas`: listar
- `GET /api/admin/tabelas/:id`: consultar
- `POST /api/admin/tabelas`: cadastrar
- `PATCH /api/admin/tabelas/:id`: editar
- `DELETE /api/admin/tabelas/:id`: excluir (Administrador; bloqueia quando vinculada)

### Vinculação em páginas

Na página de **Tabela Simples**, o criador seleciona uma tabela: `{"tabelaId":"ID_DA_TABELA"}`.

Na página de **Tabela em Abas**, cada aba seleciona uma tabela existente:

```json
{
  "abas": [
    { "titulo": "2026", "tabelaId": "ID_1" },
    { "titulo": "2025", "tabelaId": "ID_2" }
  ]
}
```

O endpoint público `GET /api/paginas/:slug` resolve os IDs para dados atuais das tabelas. Alterações no catálogo passam a refletir nas páginas vinculadas após a revalidação do Next.js (até 60 segundos nesta implementação).

## Estado e limites atuais

- O painel de tabelas tem formulários visuais para nome, colunas, linhas e links múltiplos.
- O painel editorial de páginas oferece seleção de tabelas por nome, mas o fluxo de login ainda é separado nas telas administrativas.
- As vinculações são referências JSON validadas pela aplicação, **não chaves estrangeiras**; a exclusão vinculada é bloqueada pela API. O bloqueio ainda precisa ser reforçado com integridade referencial/transações para cenários concorrentes.
- Páginas antigas que armazenavam tabelas completas em JSON continuam aceitas pela API.
- Não há upload de PDFs, busca, paginação nem ordenação visual; os links apontam para URLs previamente cadastradas.
- Precisa de migração Prisma, testes e endurecimento de segurança antes da produção.
