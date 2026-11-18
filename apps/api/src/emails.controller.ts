import {BadRequestException,Body,ConflictException,Controller,Delete,Get,NotFoundException,Param,Patch,Post,Req,UseGuards} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {z} from 'zod';
import {PrismaService} from './prisma.service';
import {AuthGuard,AuthUser,requireRoles} from './auth.guard';

const grupoInput=z.object({nome:z.string().trim().min(2).max(120)}).strict();
const emailInput=z.object({
 nome:z.string().trim().min(2).max(160),
 email:z.string().trim().toLowerCase().email().max(254),
 grupoId:z.string().min(1)
}).strict();
const orderInput=z.object({grupoId:z.string().min(1).nullable(),ids:z.array(z.string().min(1)).max(1000)}).strict();
function handlePrisma(error:unknown):never{
 if(error instanceof Prisma.PrismaClientKnownRequestError){
  if(error.code==='P2002')throw new ConflictException('Já existe um grupo com esse nome');
  if(error.code==='P2003')throw new ConflictException('Não é possível excluir o grupo enquanto possuir e-mails');
  if(error.code==='P2025')throw new NotFoundException();
 }
 throw error;
}
@Controller()
export class EmailsController {
 constructor(private readonly prisma:PrismaService){}
 private getGroups(){
  return this.prisma.grupoEmailOficial.findMany({
   orderBy:[{ordem:'asc'},{criadoEm:'asc'}],
   include:{emails:{orderBy:[{ordem:'asc'},{criadoEm:'asc'}]}}
  });
 }
 @Get('emails-oficiais')
 publicList(){return this.getGroups();}
 @UseGuards(AuthGuard) @Get('admin/emails-oficiais')
 adminList(){return this.getGroups();}
 @UseGuards(AuthGuard) @Post('admin/emails-oficiais/grupos')
 async createGroup(@Req() req:{user:AuthUser},@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=grupoInput.safeParse(body);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  try{
   const ordem=await this.prisma.grupoEmailOficial.count();
   return await this.prisma.grupoEmailOficial.create({data:{nome:parsed.data.nome,ordem}});
  }catch(error){handlePrisma(error);}
 }
 @UseGuards(AuthGuard) @Patch('admin/emails-oficiais/grupos/:id')
 async updateGroup(@Req() req:{user:AuthUser},@Param('id') id:string,@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=grupoInput.safeParse(body);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  try{return await this.prisma.grupoEmailOficial.update({where:{id},data:parsed.data});}catch(error){handlePrisma(error);}
 }
 @UseGuards(AuthGuard) @Delete('admin/emails-oficiais/grupos/:id')
 async deleteGroup(@Req() req:{user:AuthUser},@Param('id') id:string){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  if(await this.prisma.emailOficial.count({where:{grupoId:id}}))throw new ConflictException('Mova ou exclua os e-mails antes de excluir este grupo');
  try{await this.prisma.grupoEmailOficial.delete({where:{id}});return {ok:true};}catch(error){handlePrisma(error);}
 }
 @UseGuards(AuthGuard) @Post('admin/emails-oficiais/emails')
 async createEmail(@Req() req:{user:AuthUser},@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=emailInput.safeParse(body);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  if(!(await this.prisma.grupoEmailOficial.findUnique({where:{id:parsed.data.grupoId}})))throw new BadRequestException('Grupo não encontrado');
  const ordem=await this.prisma.emailOficial.count({where:{grupoId:parsed.data.grupoId}});
  return this.prisma.emailOficial.create({data:{...parsed.data,ordem}});
 }
 @UseGuards(AuthGuard) @Patch('admin/emails-oficiais/emails/:id')
 async updateEmail(@Req() req:{user:AuthUser},@Param('id') id:string,@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=emailInput.safeParse(body);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  const [existing,group]=await Promise.all([
   this.prisma.emailOficial.findUnique({where:{id}}),
   this.prisma.grupoEmailOficial.findUnique({where:{id:parsed.data.grupoId}})
  ]);
  if(!existing)throw new NotFoundException();
  if(!group)throw new BadRequestException('Grupo não encontrado');
  const ordem=existing.grupoId===parsed.data.grupoId?existing.ordem:await this.prisma.emailOficial.count({where:{grupoId:parsed.data.grupoId}});
  try{return await this.prisma.emailOficial.update({where:{id},data:{...parsed.data,ordem}});}catch(error){handlePrisma(error);}
 }
 @UseGuards(AuthGuard) @Delete('admin/emails-oficiais/emails/:id')
 async deleteEmail(@Req() req:{user:AuthUser},@Param('id') id:string){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  try{await this.prisma.emailOficial.delete({where:{id}});return {ok:true};}catch(error){handlePrisma(error);}
 }
 @UseGuards(AuthGuard) @Patch('admin/emails-oficiais/ordenar')
 async reorder(@Req() req:{user:AuthUser},@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=orderInput.safeParse(body);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  const {grupoId,ids}=parsed.data;
  if(grupoId===null){
   const existing=await this.prisma.grupoEmailOficial.findMany({select:{id:true}});
   if(existing.length!==ids.length||new Set(ids).size!==ids.length||existing.some(item=>!ids.includes(item.id)))throw new BadRequestException('Ordem inválida dos grupos');
   await this.prisma.$transaction(ids.map((id,ordem)=>this.prisma.grupoEmailOficial.update({where:{id},data:{ordem}})));
  }else{
   const existing=await this.prisma.emailOficial.findMany({where:{grupoId},select:{id:true}});
   if(existing.length!==ids.length||new Set(ids).size!==ids.length||existing.some(item=>!ids.includes(item.id)))throw new BadRequestException('Ordem inválida dos e-mails');
   await this.prisma.$transaction(ids.map((id,ordem)=>this.prisma.emailOficial.update({where:{id},data:{ordem}})));
  }
  return {ok:true};
 }
}
