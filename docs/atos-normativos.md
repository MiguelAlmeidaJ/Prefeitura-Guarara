# Atos Normativos Municipais — Leis, Decretos e Portarias

Rotas públicas: `/transparencia/leis`, `/transparencia/decretos` e `/transparencia/portarias`.
Rotas administrativas: `/admin/transparencia/leis`, `/admin/transparencia/decretos` e `/admin/transparencia/portarias`.

Todas as pastas e segmentos de URL são **sem acentos**, como definido no projeto. Foram adicionados atalhos no menu administrativo e na página pública principal de Transparência.

## Cadastro administrativo
- Ano (exercício), Número (texto para preservar zeros à esquerda), Título/identificação, Ementa, Processo opcional, Link do documento
- Tipo de acesso: **Visualizar** ou **Baixar PDF**
- Status: **Publicado** ou **Rascunho**
- Permissões de alteração: `ADMINISTRADOR` e `GESTOR`; usuários autenticados do perfil `EDITOR` podem consultar.
- Permite criar, editar, excluir, filtrar por exercício e buscar por número, título, ementa e processo.

## Consulta pública
- Busca por número, título, ementa, processo e ano, com filtro do exercício
- Contador de documentos e exercícios baseado nos dados efetivamente publicados
- Lista de anos em ordem decrescente, com a quantidade de documentos por exercício
- Tabela com número, identificação, ementa e botão de acesso
- Documentos do exercício classificados por número decrescente; paginação de 35 itens
- Apenas documentos publicados são exibidos; nenhum documento oficial foi inventado ou importado da imagem
- Para links externos, o download automático depende dos cabeçalhos do servidor de origem; o botão abre o documento em nova aba e a opção **Baixar PDF** identifica o tipo de acesso desejado.

## Migração
A migração `20261118197000_atos_normativos` adiciona apenas a tabela `AtoNormativo` e seus enums.

```bash
git pull origin create
pm2 stop guarara-api
npm run db:generate
npm run db:migrate
npm run build
pm2 restart ecosystem.config.cjs --update-env
```

Não há dados oficiais de Guarará pré-carregados: devem ser cadastrados e verificados pela equipe responsável.
