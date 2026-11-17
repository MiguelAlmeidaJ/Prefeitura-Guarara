import { z } from 'zod';
const url=z.string().url().refine(x=>/^https?:\/\//i.test(x),'URL HTTP(S) obrigatória');
const col=z.object({chave:z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),titulo:z.string().min(1).max(120)}).strict();
const table=z.object({colunas:z.array(col).min(1).max(20).refine(v=>new Set(v.map(c=>c.chave)).size===v.length),linhas:z.array(z.record(z.string().max(1000))).max(5000)}).strict();
const tableReference=z.object({tabelaId:z.string().min(1)}).strict();
const tabsReference=z.object({abas:z.array(z.object({titulo:z.string().min(1).max(120),tabelaId:z.string().min(1)}).strict()).min(1).max(40)}).strict();
const schemas={
 GRID_LINKS:z.object({links:z.array(z.object({texto:z.string().min(1).max(160),url,novaAba:z.boolean()}).strict()).max(200)}).strict(),
 TABELA_SIMPLES:z.union([table,tableReference]),
 TABELA_ABAS:z.union([z.object({abas:z.array(z.object({titulo:z.string().min(1).max(120),tabela:table}).strict()).min(1).max(40)}).strict(),tabsReference]),
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

export const tableInput=z.object({
 nome:z.string().trim().min(1).max(180),
 descricao:z.string().max(500).nullable().optional(),
 colunas:z.array(z.object({
  chave:z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/).max(80),
  titulo:z.string().trim().min(1).max(120),
  tipo:z.enum(['TEXTO','LINK']),
  multiplos:z.boolean().default(false),
 }).strict()).min(1).max(20).refine(cs=>new Set(cs.map(c=>c.chave)).size===cs.length,'Chaves duplicadas'),
 linhas:z.array(z.record(z.unknown())).max(5000),
}).strict().superRefine((v,ctx)=>{
 for(const [index,row] of v.linhas.entries()){
  const keys=new Set(v.colunas.map(c=>c.chave));
  for(const key of Object.keys(row))if(!keys.has(key))ctx.addIssue({code:z.ZodIssueCode.custom,path:['linhas',index,key],message:'Coluna desconhecida'});
  for(const column of v.colunas){
   const val=row[column.chave];
   if(val===undefined||val===null||val==='')continue;
   if(column.tipo==='TEXTO'){
    if(typeof val!=='string'||val.length>2000)ctx.addIssue({code:z.ZodIssueCode.custom,path:['linhas',index,column.chave],message:'Texto inválido'});
   }else{
    const link=z.object({texto:z.string().min(1).max(200),url}).strict();
    const schema=column.multiplos?z.array(link).max(30):link;
    if(!schema.safeParse(val).success)ctx.addIssue({code:z.ZodIssueCode.custom,path:['linhas',index,column.chave],message:column.multiplos?'Informe uma lista de links válidos':'Informe um link válido'});
   }
  }
 }
});
