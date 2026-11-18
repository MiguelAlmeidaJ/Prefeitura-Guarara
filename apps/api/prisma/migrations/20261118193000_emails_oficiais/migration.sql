CREATE TABLE "GrupoEmailOficial" (
 "id" TEXT NOT NULL,
 "nome" TEXT NOT NULL,
 "ordem" INTEGER NOT NULL DEFAULT 0,
 "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "atualizadoEm" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "GrupoEmailOficial_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "GrupoEmailOficial_nome_key" ON "GrupoEmailOficial"("nome");
CREATE INDEX "GrupoEmailOficial_ordem_criadoEm_idx" ON "GrupoEmailOficial"("ordem","criadoEm");
CREATE TABLE "EmailOficial" (
 "id" TEXT NOT NULL,
 "nome" TEXT NOT NULL,
 "email" TEXT NOT NULL,
 "grupoId" TEXT NOT NULL,
 "ordem" INTEGER NOT NULL DEFAULT 0,
 "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "atualizadoEm" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "EmailOficial_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EmailOficial_grupoId_ordem_idx" ON "EmailOficial"("grupoId","ordem");
ALTER TABLE "EmailOficial" ADD CONSTRAINT "EmailOficial_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoEmailOficial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
