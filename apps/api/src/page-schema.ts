import { z } from 'zod';
const url=z.string().url().refine(x=>/^https?:\/\//i.test(x),'URL HTTP(S) obrigatória');
const col=z.object({chave:z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),titulo:z.string().min(1).max(120)}).strict();
const table=z.object({colunas:z.array(col).min(1).max(20).refine(v=>new Set(v.map(c=>c.chave)).size===v.length),linhas:z.array(z.record(z.string().max(1000))).max(5000)}).strict();
const schemas={
 GRID_LINKS:z.object({links:z.array(z.object({texto:z.string().min(1).max(160),url,novaAba:z.boolean()}).strict()).max(200)}).strict(),
 TABELA_SIMPLES:table,
 TABELA_ABAS:z.object({abas:z.array(z.object({titulo:z.string().min(1).max(120),tabela:table}).strict()).min(1).max(40)}).strict(),
};
export const pageInput=z.object({
 titulo:z.string().trim().min(1).max(180),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
 subtitulo:z.string().max(500).nullable().optional(),tipo:z.enum(['GRID_LINKS','TABELA_SIMPLES','TABELA_ABAS']),
 ordem:z.number().int().min(0).max(99999).default(0),conteudo:z.unknown(),
}).strict().superRefine((v,ctx)=>{
 const r=schemas[v.tipo].safeParse(v.conteudo);
 if(!r.success)ctx.addIssue({code:z.ZodIssueCode.custom,path:['conteudo'],message:r.error.message});
});
export const userInput=z.object({nome:z.string().min(2).max(150),email:z.string().email(),senha:z.string().min(12),papel:z.enum(['ADMINISTRADOR','GESTOR','EDITOR'])}).strict();
