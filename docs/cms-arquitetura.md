# CMS modular da Prefeitura de Argirita

O construtor publica páginas dinâmicas em /p/[slug] e mantém páginas especiais desenvolvidas à mão em Next.js.

## Papéis
Administrador: cria/edita, publica, arquiva, exclui, gerencia usuários.
Gestor: cria/edita, publica e arquiva.
Editor: cria/edita rascunhos; não publica.

## Tipos
GRID_LINKS: {"links":[{"texto":"IPTU Online","url":"https://exemplo.gov.br/iptu","novaAba":true}]}
TABELA_SIMPLES: {"colunas":[{"chave":"ano","titulo":"Ano"}],"linhas":[{"ano":"2026"}]}
TABELA_ABAS: {"abas":[{"titulo":"2026","tabela":{"colunas":[{"chave":"nome","titulo":"Nome"}],"linhas":[{"nome":"Exemplo"}]}}]}

A API verifica JWT e papel ativo no banco e valida os tipos com Zod.
As células de tabela são texto simples, sem HTML arbitrário.
Próximas etapas: editor visual, uploads, menus administráveis, auditoria, versionamento, rate limit no login, recuperação de senha e testes.
