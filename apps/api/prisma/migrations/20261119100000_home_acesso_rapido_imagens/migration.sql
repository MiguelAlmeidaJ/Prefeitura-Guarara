CREATE TABLE "AcessoRapido" (
"id" TEXT NOT NULL,"titulo" TEXT NOT NULL,"url" TEXT NOT NULL,"novaGuia" BOOLEAN NOT NULL DEFAULT false,
"ordem" INTEGER NOT NULL DEFAULT 0,"ativo" BOOLEAN NOT NULL DEFAULT true,"criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"atualizadoEm" TIMESTAMP(3) NOT NULL,CONSTRAINT "AcessoRapido_pkey" PRIMARY KEY ("id"));
CREATE INDEX "AcessoRapido_ativo_ordem_idx" ON "AcessoRapido"("ativo","ordem");
CREATE TABLE "ImagemCidade" (
"id" TEXT NOT NULL,"titulo" TEXT NOT NULL,"arquivo" TEXT NOT NULL,"ordem" INTEGER NOT NULL DEFAULT 0,
"ativo" BOOLEAN NOT NULL DEFAULT true,"criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"atualizadoEm" TIMESTAMP(3) NOT NULL,CONSTRAINT "ImagemCidade_pkey" PRIMARY KEY ("id"));
CREATE INDEX "ImagemCidade_ativo_ordem_idx" ON "ImagemCidade"("ativo","ordem");

-- Preserva os seis atalhos existentes na home; editáveis no painel.
INSERT INTO "AcessoRapido" ("id","titulo","url","ordem","atualizadoEm") VALUES ('initial-quick-0', 'Atendimento', '/atendimento', 0, CURRENT_TIMESTAMP);
INSERT INTO "AcessoRapido" ("id","titulo","url","ordem","atualizadoEm") VALUES ('initial-quick-1', 'Transparência', '/transparencia', 1, CURRENT_TIMESTAMP);
INSERT INTO "AcessoRapido" ("id","titulo","url","ordem","atualizadoEm") VALUES ('initial-quick-2', 'Licitações e Dispensas', '/licitacoes', 2, CURRENT_TIMESTAMP);
INSERT INTO "AcessoRapido" ("id","titulo","url","ordem","atualizadoEm") VALUES ('initial-quick-3', 'Concursos e Processos Seletivos', '/concursos', 3, CURRENT_TIMESTAMP);
INSERT INTO "AcessoRapido" ("id","titulo","url","ordem","atualizadoEm") VALUES ('initial-quick-4', 'O Município', '/municipio', 4, CURRENT_TIMESTAMP);
INSERT INTO "AcessoRapido" ("id","titulo","url","ordem","atualizadoEm") VALUES ('initial-quick-5', 'Administração Municipal', '/administracao', 5, CURRENT_TIMESTAMP);
