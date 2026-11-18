import {BadRequestException,Body,Controller,Delete,Get,NotFoundException,Param,Patch,Post,Query,Req,UseGuards} from '@nestjs/common';
import {AcaoAtoNormativo,Prisma,TipoAtoNormativo} from '@prisma/client';
import {z} from 'zod';
import {PrismaService} from './prisma.service';
import {AuthGuard,AuthUser,requireRoles} from './auth.guard';

const slugSchema=z.enum(['leis','decretos','portarias']);
const typeOf=(slug:string):TipoAtoNormativo=>({leis:'LEI',decretos:'DECRETO',portarias:'PORTARIA'} as Record<string,TipoAtoNormativo>)[slug];
const inputSchema=z.object({
 ano:z.number().int().min(1900).max(2200),
 numero:z.string().trim().min(1).max(60),
 titulo:z.string().trim().min(2).max(250),
 ementa:z.string().trim().max(6000).nullable(),
 processo:z.string().trim().max(160).nullable(),
 link:z.string().trim().url().max(2048).refine(value=>/^https?:\/\//i.test(value),'Informe URL HTTP(S)'),
 acao:z.nativeEnum(AcaoAtoNormativo),
 publicado:z.boolean()
}).strict();
function kind(slug:string){
 const parsed=slugSchema.safeParse(slug);
 if(!parsed.success)throw new BadRequestException('Tipo de documento inválido');
 return typeOf(parsed.data);
}
function parse(input:unknown){
 const parsed=inputSchema.safeParse(input);
 if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
 return parsed.data;
}
function missing(error:unknown):never{
 if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2025')throw new NotFoundException('Documento não encontrado');
 throw error;
}
@Controller()
export class AtosNormativosController{
 constructor(private readonly prisma:PrismaService){}
 @Get('atos-normativos/:tipo')
 publicList(@Param('tipo') slug:string){
  const tipo=kind(slug);
  return this.prisma.atoNormativo.findMany({where:{tipo,publicado:true},orderBy:[{ano:'desc'},{criadoEm:'desc'}],select:{id:true,ano:true,numero:true,titulo:true,ementa:true,processo:true,link:true,acao:true}});
 }
 @UseGuards(AuthGuard) @Get('admin/atos-normativos/:tipo')
 adminList(@Param('tipo') slug:string){
  const tipo=kind(slug);
  return this.prisma.atoNormativo.findMany({where:{tipo},orderBy:[{ano:'desc'},{criadoEm:'desc'}]});
 }
 @UseGuards(AuthGuard) @Post('admin/atos-normativos/:tipo')
 create(@Req() req:{user:AuthUser},@Param('tipo') slug:string,@Body() input:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  return this.prisma.atoNormativo.create({data:{...parse(input),tipo:kind(slug)}});
 }
 @UseGuards(AuthGuard) @Patch('admin/atos-normativos/:tipo/:id')
 async update(@Req() req:{user:AuthUser},@Param('tipo') slug:string,@Param('id') id:string,@Body() input:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const tipo=kind(slug);
  const found=await this.prisma.atoNormativo.findFirst({where:{id,tipo},select:{id:true}});
  if(!found)throw new NotFoundException();
  try{return await this.prisma.atoNormativo.update({where:{id},data:parse(input)});}catch(e){missing(e);}
 }
 @UseGuards(AuthGuard) @Delete('admin/atos-normativos/:tipo/:id')
 async remove(@Req() req:{user:AuthUser},@Param('tipo') slug:string,@Param('id') id:string){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const tipo=kind(slug);
  const found=await this.prisma.atoNormativo.findFirst({where:{id,tipo},select:{id:true}});
  if(!found)throw new NotFoundException();
  try{await this.prisma.atoNormativo.delete({where:{id}});return {ok:true};}catch(e){missing(e);}
 }
}
