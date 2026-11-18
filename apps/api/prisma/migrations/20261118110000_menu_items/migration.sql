-- Menu institucional com hierarquia e ordenação independente por ascendente
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "novaGuia" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ascendenteId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MenuItem_ascendenteId_ordem_idx" ON "MenuItem"("ascendenteId", "ordem");
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_ascendenteId_fkey" FOREIGN KEY ("ascendenteId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
