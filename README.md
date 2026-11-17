# Prefeitura de Guarará — portal institucional

Projeto monorepo em **TypeScript**, com **Next.js**, **NestJS**, **Prisma** e **PostgreSQL**.

> A navegação toma Maripá de Minas como referência funcional. Conteúdo e informações oficiais serão próprios da Prefeitura de Guarará. A interface atual é um esqueleto inicial, não uma reprodução visual final.

## Estrutura

```text
apps/
  web/   # Next.js: portal público (porta 3000)
  api/   # NestJS: API e Prisma (porta 3001)
docs/
  mapeamento-maripa.md
```

## Requisitos

Node.js 20+, npm 10+, Docker/Compose para PostgreSQL.

## Executando localmente

```bash
cp apps/api/.env.example apps/api/.env
npm install
docker compose up -d
npm run db:generate
npm run db:migrate
npm run dev
```

O PostgreSQL do Docker é exposto em `127.0.0.1:5433` para evitar conflitos com uma instalação local que já utiliza `5432`. Se você já possui `apps/api/.env`, atualize manualmente a porta de `DATABASE_URL` para `5433` antes de executar o Prisma. Nunca sobrescreva credenciais existentes sem conferir.

O comando de migração cria a primeira migração de desenvolvimento quando solicitado; os modelos iniciais estão em `apps/api/prisma/schema.prisma`. O arquivo `apps/api/.env` fornece `DATABASE_URL` ao Prisma e à API. `NEXT_PUBLIC_API_URL` reserva a URL da API para integrações futuras.

- Web: http://localhost:3000
- API: http://localhost:3001/api/health
- Comunicados publicados (inicialmente vazios): http://localhost:3001/api/comunicados

## Documentação

Consulte [o mapeamento das páginas de Maripá](docs/mapeamento-maripa.md).

## Estado do projeto

Estrutura inicial de desenvolvimento: páginas institucionais ainda são placeholders; faltam autenticação, painel administrativo, migrações versionadas, testes e integrações com serviços oficiais.

## CMS de páginas padronizadas

O primeiro incremento do CMS está na branch `create`. Disponibiliza perfis `ADMINISTRADOR`, `GESTOR` e `EDITOR`, modelos `GRID_LINKS`, `TABELA_SIMPLES` e `TABELA_ABAS`, endpoints públicos de leitura e um painel editorial inicial em `/admin`. As páginas publicadas ficam em `/p/<slug>`.

Configure a API antes de iniciar:

```bash
cp apps/api/.env.example apps/api/.env
# Edite apps/api/.env e defina JWT_SECRET com uma chave aleatória forte.
npm install
docker compose up -d
npm run db:generate
npm run db:migrate
# Configure ADMIN_EMAIL e ADMIN_PASSWORD (12+ caracteres) em apps/api/.env
npm run admin:bootstrap -w @guarara/api
npm run dev
```

O painel inicial utiliza um campo JSON para os conteúdos estruturados; o editor visual de cartões, colunas, linhas e abas é um incremento futuro. Referência: [arquitetura do CMS](docs/cms-arquitetura.md).

**Segurança:** ainda faltam rate limiting, auditoria, recuperação de senha e testes de produção. Não exponha este protótipo à internet antes dessas melhorias.

## Tabelas reutilizáveis

O catálogo de tabelas fica em `/admin/tabelas`. Configure colunas do tipo **Texto** ou **Link** e permita um ou vários links por célula. Depois, escolha a tabela no criador de páginas em `/admin` (Tabela Simples ou Tabela em Abas). Veja [a documentação](docs/tabelas-reutilizaveis.md).

**Nota:** tabelas são referenciadas por ID nos dados da página; a aplicação valida as referências. A futura camada de integridade relacional reforçará essa associação.
