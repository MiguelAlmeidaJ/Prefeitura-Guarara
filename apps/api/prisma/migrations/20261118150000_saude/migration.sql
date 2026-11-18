CREATE TYPE "TipoConteudoSaude" AS ENUM ('PAS', 'CONSELHO', 'PORTARIA', 'ESCALA', 'MEDICAMENTO', 'ESTOQUE');
CREATE TABLE "SaudeConfiguracao" (
"id" TEXT NOT NULL DEFAULT 'principal', "nomeSecretario" TEXT, "telefone" TEXT, "endereco" TEXT, "horario" TEXT, "descricao" TEXT, "atualizadoEm" TIMESTAMP(3) NOT NULL, CONSTRAINT "SaudeConfiguracao_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SaudeConteudo" (
"id" TEXT NOT NULL, "tipo" "TipoConteudoSaude" NOT NULL, "titulo" TEXT NOT NULL,
"descricao" TEXT, "ano" INTEGER, "link" TEXT NOT NULL,
"textoBotao" TEXT, "linkSecundario" TEXT, "textoBotaoSecundario" TEXT,
"destaque" BOOLEAN NOT NULL DEFAULT false, "ordem" INTEGER NOT NULL DEFAULT 0,
"criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "atualizadoEm" TIMESTAMP(3) NOT NULL,
CONSTRAINT "SaudeConteudo_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SaudeConteudo_tipo_ordem_idx" ON "SaudeConteudo"("tipo","ordem");
CREATE INDEX "SaudeConteudo_ano_idx" ON "SaudeConteudo"("ano");
