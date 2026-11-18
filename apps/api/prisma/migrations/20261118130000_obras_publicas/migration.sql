-- Cadastro de obras públicas: categorias e recursos administráveis.
CREATE TABLE "CategoriaObra" ("id" TEXT NOT NULL, "nome" TEXT NOT NULL, "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "atualizadoEm" TIMESTAMP(3) NOT NULL, CONSTRAINT "CategoriaObra_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "CategoriaObra_nome_key" ON "CategoriaObra"("nome");
CREATE TABLE "RecursoObra" ("id" TEXT NOT NULL, "nome" TEXT NOT NULL, "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "atualizadoEm" TIMESTAMP(3) NOT NULL, CONSTRAINT "RecursoObra_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "RecursoObra_nome_key" ON "RecursoObra"("nome");
CREATE TABLE "ObraPublica" ("id" TEXT NOT NULL,"ano" INTEGER NOT NULL,"numero" TEXT NOT NULL,"objeto" TEXT NOT NULL,"categoriaId" TEXT NOT NULL,"recursoId" TEXT NOT NULL,"inicio" DATE NOT NULL,"comprovacaoUrl" TEXT NOT NULL,"criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"atualizadoEm" TIMESTAMP(3) NOT NULL,CONSTRAINT "ObraPublica_pkey" PRIMARY KEY ("id"));
CREATE INDEX "ObraPublica_ano_inicio_idx" ON "ObraPublica"("ano","inicio");
CREATE INDEX "ObraPublica_categoriaId_idx" ON "ObraPublica"("categoriaId");
CREATE INDEX "ObraPublica_recursoId_idx" ON "ObraPublica"("recursoId");
ALTER TABLE "ObraPublica" ADD CONSTRAINT "ObraPublica_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaObra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ObraPublica" ADD CONSTRAINT "ObraPublica_recursoId_fkey" FOREIGN KEY ("recursoId") REFERENCES "RecursoObra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
