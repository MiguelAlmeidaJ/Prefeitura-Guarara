CREATE TABLE "CategoriaComunicado" (
 "id" TEXT NOT NULL,
 "nome" TEXT NOT NULL,
 "slug" TEXT NOT NULL,
 "capaArquivo" TEXT,
 "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "atualizadoEm" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "CategoriaComunicado_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CategoriaComunicado_nome_key" ON "CategoriaComunicado"("nome");
CREATE UNIQUE INDEX "CategoriaComunicado_slug_key" ON "CategoriaComunicado"("slug");
ALTER TABLE "Comunicado" ADD COLUMN "categoriaId" TEXT;
CREATE INDEX "Comunicado_categoriaId_idx" ON "Comunicado"("categoriaId");
ALTER TABLE "Comunicado" ADD CONSTRAINT "Comunicado_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaComunicado"("id") ON DELETE SET NULL ON UPDATE CASCADE;
