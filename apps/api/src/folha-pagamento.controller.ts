import {BadRequestException,Body,ConflictException,Controller,Delete,Get,NotFoundException,Param,Patch,Post,Req,UseGuards} from '@nestjs/common';
import {Prisma,TipoFolhaPagamento} from '@prisma/client';
import {z} from 'zod';
import {PrismaService} from './prisma.service';
import {AuthGuard,AuthUser,requireRoles} from './auth.guard';

const types=z.enum(['comissionados','efetivos','contratados']);
const typeMap:Record<z.infer<typeof types>,TipoFolhaPagamento>={
 comissionados:'COMISSIONADOS',efetivos:'EFETIVOS',contratados:'CONTRATADOS'
};
const bodySchema=z.object({
 ano:z.number().int().min(1900).max(2200),
 mes:z.number().int().min(1).max(12),
 link:z.string().trim().url().max(2048).refine(v=>/^https?:\/\//i.test(v),'Informe link HTTP(S)'),
 publicado:z.boolean()
}).strict();
function category(raw:string){
 const result=types.safeParse(raw);
 if(!result.success)throw new BadRequestException('Categoria inválida');
 return typeMap[result.data];
}
function input(body:unknown){
 const result=bodySchema.safeParse(body);
 if(!result.success)throw new BadRequestException(result.error.flatten());
 return result.data;
}
function handle(error:unknown):never{
 if(error instanceof Prisma.PrismaClientKnownRequestError){
  if(error.code==='P2002')throw new ConflictException('Esta competência já foi cadastrada para a categoria');
  if(error.code==='P2025')throw new NotFoundException('Competência não encontrada');
 }
 throw error;
}
@Controller()
export class FolhaPagamentoController {
 constructor(private readonly prisma:PrismaService){}
 @Get('folha-pagamento/:categoria')
 publicList(@Param('categoria') slug:string){
  return this.prisma.folhaPagamento.findMany({where:{tipo:category(slug),publicado:true},orderBy:[{ano:'desc'},{mes:'desc'}],select:{id:true,ano:true,mes:true,link:true}});
 }
 @UseGuards(AuthGuard) @Get('admin/folha-pagamento/:categoria')
 adminList(@Param('categoria') slug:string){
  return this.prisma.folhaPagamento.findMany({where:{tipo:category(slug)},orderBy:[{ano:'desc'},{mes:'desc'}]});
 }
 @UseGuards(AuthGuard) @Post('admin/folha-pagamento/:categoria')
 async create(@Req() req:{user:AuthUser},@Param('categoria') slug:string,@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  try{return await this.prisma.folhaPagamento.create({data:{...input(body),tipo:category(slug)}});}
  catch(e){handle(e);}
 }
 @UseGuards(AuthGuard) @Patch('admin/folha-pagamento/:categoria/:id')
 async update(@Req() req:{user:AuthUser},@Param('categoria') slug:string,@Param('id') id:string,@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const tipo=category(slug),data=input(body);
  const existing=await this.prisma.folhaPagamento.findFirst({where:{id,tipo},select:{id:true}});
  if(!existing)throw new NotFoundException('Competência não encontrada');
  try{return await this.prisma.folhaPagamento.update({where:{id},data});}catch(e){handle(e);}
 }
 @UseGuards(AuthGuard) @Delete('admin/folha-pagamento/:categoria/:id')
 async remove(@Req() req:{user:AuthUser},@Param('categoria') slug:string,@Param('id') id:string){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const tipo=category(slug);
  const existing=await this.prisma.folhaPagamento.findFirst({where:{id,tipo},select:{id:true}});
  if(!existing)throw new NotFoundException('Competência não encontrada');
  try{await this.prisma.folhaPagamento.delete({where:{id}});return {ok:true};}catch(e){handle(e);}
 }
}
