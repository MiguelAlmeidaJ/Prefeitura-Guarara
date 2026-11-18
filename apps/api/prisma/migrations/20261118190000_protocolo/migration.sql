CREATE TABLE "ProtocoloFormulario" (
 "id" TEXT NOT NULL,
 "nome" TEXT NOT NULL,
 "link" TEXT NOT NULL,
 "ordem" INTEGER NOT NULL DEFAULT 0,
 "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "atualizadoEm" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "ProtocoloFormulario_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ProtocoloFormulario_ordem_criadoEm_idx" ON "ProtocoloFormulario"("ordem","criadoEm");
