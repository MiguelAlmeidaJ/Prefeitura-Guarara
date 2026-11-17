# Prefeitura de Argirita — portal institucional

Projeto monorepo em **TypeScript**, com **Next.js**, **NestJS**, **Prisma** e **PostgreSQL**.

> A navegação toma Maripá de Minas como referência funcional. Conteúdo e informações oficiais serão próprios da Prefeitura de Argirita. A interface atual é um esqueleto inicial, não uma reprodução visual final.

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
cp .env.example .env
npm install
docker compose up -d
npm run db:generate
npm run db:migrate
npm run dev
```

O comando de migração cria a primeira migração de desenvolvimento quando solicitado; os modelos iniciais estão em `apps/api/prisma/schema.prisma`. Certifique-se de disponibilizar `DATABASE_URL` para o processo da API (por exemplo, usando variáveis exportadas no shell ou um arquivo `apps/api/.env`). `NEXT_PUBLIC_API_URL` reserva a URL da API para integrações futuras.

- Web: http://localhost:3000
- API: http://localhost:3001/api/health
- Comunicados publicados (inicialmente vazios): http://localhost:3001/api/comunicados

## Documentação

Consulte [o mapeamento das páginas de Maripá](docs/mapeamento-maripa.md).

## Estado do projeto

Estrutura inicial de desenvolvimento: páginas institucionais ainda são placeholders; faltam autenticação, painel administrativo, migrações versionadas, testes e integrações com serviços oficiais.
