CREATE TABLE "TransparenciaConfiguracao" ("id" TEXT NOT NULL DEFAULT 'principal',"portalUrl" TEXT,"portalDescricao" TEXT,"atualizadoEm" TIMESTAMP(3) NOT NULL,CONSTRAINT "TransparenciaConfiguracao_pkey" PRIMARY KEY ("id"));
CREATE TABLE "TransparenciaGrupo" ("id" TEXT NOT NULL,"nome" TEXT NOT NULL,"descricao" TEXT,"ordem" INTEGER NOT NULL DEFAULT 0,"criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"atualizadoEm" TIMESTAMP(3) NOT NULL,CONSTRAINT "TransparenciaGrupo_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "TransparenciaGrupo_nome_key" ON "TransparenciaGrupo"("nome");
CREATE INDEX "TransparenciaGrupo_ordem_criadoEm_idx" ON "TransparenciaGrupo"("ordem","criadoEm");
CREATE TABLE "TransparenciaLink" ("id" TEXT NOT NULL,"titulo" TEXT NOT NULL,"descricao" TEXT,"url" TEXT NOT NULL,"etiqueta" TEXT,"novaGuia" BOOLEAN NOT NULL DEFAULT true,"grupoId" TEXT NOT NULL,"ordem" INTEGER NOT NULL DEFAULT 0,"criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"atualizadoEm" TIMESTAMP(3) NOT NULL,CONSTRAINT "TransparenciaLink_pkey" PRIMARY KEY ("id"));
CREATE INDEX "TransparenciaLink_grupoId_ordem_idx" ON "TransparenciaLink"("grupoId","ordem");
ALTER TABLE "TransparenciaLink" ADD CONSTRAINT "TransparenciaLink_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "TransparenciaGrupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
