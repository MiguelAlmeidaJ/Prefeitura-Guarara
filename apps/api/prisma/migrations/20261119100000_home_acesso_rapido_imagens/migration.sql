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
