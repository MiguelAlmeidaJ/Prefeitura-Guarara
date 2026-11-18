CREATE TYPE "TipoFolhaPagamento" AS ENUM ('COMISSIONADOS', 'EFETIVOS', 'CONTRATADOS');
CREATE TABLE "FolhaPagamento" (
 "id" TEXT NOT NULL,
 "tipo" "TipoFolhaPagamento" NOT NULL,
 "ano" INTEGER NOT NULL,
 "mes" INTEGER NOT NULL,
 "link" TEXT NOT NULL,
 "publicado" BOOLEAN NOT NULL DEFAULT true,
 "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "atualizadoEm" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "FolhaPagamento_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "FolhaPagamento_mes_check" CHECK ("mes" BETWEEN 1 AND 12),
 CONSTRAINT "FolhaPagamento_ano_check" CHECK ("ano" BETWEEN 1900 AND 2200)
);
CREATE UNIQUE INDEX "FolhaPagamento_tipo_ano_mes_key" ON "FolhaPagamento"("tipo","ano","mes");
CREATE INDEX "FolhaPagamento_tipo_publicado_ano_idx" ON "FolhaPagamento"("tipo","publicado","ano");
