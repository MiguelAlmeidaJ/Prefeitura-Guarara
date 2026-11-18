CREATE TYPE "TipoAtoNormativo" AS ENUM ('LEI','DECRETO','PORTARIA');
CREATE TYPE "AcaoAtoNormativo" AS ENUM ('BAIXAR','VISUALIZAR');
CREATE TABLE "AtoNormativo" (
"id" TEXT NOT NULL,"tipo" "TipoAtoNormativo" NOT NULL,"ano" INTEGER NOT NULL,"numero" TEXT NOT NULL,
"titulo" TEXT NOT NULL,"ementa" TEXT,"processo" TEXT,"link" TEXT NOT NULL,
"acao" "AcaoAtoNormativo" NOT NULL DEFAULT 'VISUALIZAR',
"publicado" BOOLEAN NOT NULL DEFAULT true,
"criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"atualizadoEm" TIMESTAMP(3) NOT NULL,
CONSTRAINT "AtoNormativo_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AtoNormativo_tipo_ano_idx" ON "AtoNormativo"("tipo","ano");
CREATE INDEX "AtoNormativo_tipo_publicado_idx" ON "AtoNormativo"("tipo","publicado");
