CREATE TABLE "MensagemContato" (
 "id" TEXT NOT NULL,
 "nome" TEXT NOT NULL,
 "endereco" TEXT,
 "telefone" TEXT,
 "email" TEXT NOT NULL,
 "descricao" TEXT NOT NULL,
 "lida" BOOLEAN NOT NULL DEFAULT false,
 "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "MensagemContato_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MensagemContato_criadoEm_idx" ON "MensagemContato"("criadoEm");
CREATE INDEX "MensagemContato_email_criadoEm_idx" ON "MensagemContato"("email","criadoEm");
