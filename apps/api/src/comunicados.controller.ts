import {BadRequestException,Body,Controller,Delete,Get,NotFoundException,Param,Patch,Post,Req,UseGuards} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {z} from 'zod';
import {PrismaService} from './prisma.service';
import {AuthGuard,AuthUser,requireRoles} from './auth.guard';

const input=z.object({
 titulo:z.string().trim().min(4).max(180),
 slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(190),
 resumo:z.string().trim().max(400).nullable(),
 conteudo:z.string().trim().min(1).max(30000),
 publicado:z.boolean()
}).strict();
function parse(body:unknown){
 const result=input.safeParse(body);
 if(!result.success)throw new BadRequestException(result.error.flatten());
 return result.data;
}
function dbError(error:unknown):never{
 if(error instanceof Prisma.PrismaClientKnownRequestError){
  if(error.code==='P2002')throw new BadRequestException('Já existe um comunicado com esse endereço (slug)');
  if(error.code==='P2025')throw new NotFoundException('Comunicado não encontrado');
 }
 throw error;
}
@Controller()
export class ComunicadosController{
 constructor(private readonly prisma:PrismaService){}
 @Get('comunicados')
 listPublic(){
  return this.prisma.comunicado.findMany({
   where:{publicado:true},orderBy:[{publicadoEm:'desc'},{criadoEm:'desc'}],
   select:{id:true,titulo:true,slug:true,resumo:true,conteudo:true,publicadoEm:true,criadoEm:true}
  });
 }
 @Get('comunicados/:slug')
 async details(@Param('slug') slug:string){
  const item=await this.prisma.comunicado.findFirst({where:{slug,publicado:true},select:{id:true,titulo:true,slug:true,resumo:true,conteudo:true,publicadoEm:true,criadoEm:true}});
  if(!item)throw new NotFoundException();
  return item;
 }
 @UseGuards(AuthGuard) @Get('admin/comunicados')
 listAdmin(){return this.prisma.comunicado.findMany({orderBy:[{atualizadoEm:'desc'}]});}
 @UseGuards(AuthGuard) @Post('admin/comunicados')
 async create(@Req() req:{user:AuthUser},@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR','EDITOR');
  const data=parse(body);
  if(req.user.papel==='EDITOR'&&data.publicado)throw new BadRequestException('Somente gestores podem publicar comunicados');
  try{return await this.prisma.comunicado.create({data:{...data,publicadoEm:data.publicado?new Date():null}});}catch(e){dbError(e);}
 }
 @UseGuards(AuthGuard) @Patch('admin/comunicados/:id')
 async update(@Req() req:{user:AuthUser},@Param('id') id:string,@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR','EDITOR');
  const data=parse(body);
  const existing=await this.prisma.comunicado.findUnique({where:{id}});
  if(!existing)throw new NotFoundException();
  if(req.user.papel==='EDITOR'&&existing.publicado)throw new BadRequestException('Editores não podem alterar comunicados já publicados');
  if(req.user.papel==='EDITOR'&&data.publicado)throw new BadRequestException('Somente gestores podem publicar comunicados');
  try{return await this.prisma.comunicado.update({where:{id},data:{...data,publicadoEm:data.publicado?(existing.publicadoEm||new Date()):null}});}catch(e){dbError(e);}
 }
 @UseGuards(AuthGuard) @Delete('admin/comunicados/:id')
 async remove(@Req() req:{user:AuthUser},@Param('id') id:string){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  try{await this.prisma.comunicado.delete({where:{id}});return {ok:true};}catch(e){dbError(e);}
 }
}
