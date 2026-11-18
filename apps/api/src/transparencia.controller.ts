import {BadRequestException,Body,ConflictException,Controller,Delete,Get,NotFoundException,Param,Patch,Post,Req,UseGuards} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {z} from 'zod';
import {PrismaService} from './prisma.service';
import {AuthGuard,AuthUser,requireRoles} from './auth.guard';

const url=z.string().trim().min(1).max(2048).refine(value=>{
 if(value.startsWith('/')&&!value.startsWith('//')&&!value.includes('\\'))return true;
 try{return ['http:','https:'].includes(new URL(value).protocol);}catch{return false;}
},'Informe um link interno iniciado por / ou uma URL HTTP(S)');
const groupSchema=z.object({nome:z.string().trim().min(2).max(120),descricao:z.string().trim().max(400).nullable()}).strict();
const linkSchema=z.object({titulo:z.string().trim().min(2).max(160),descricao:z.string().trim().max(1000).nullable(),url,etiqueta:z.string().trim().max(50).nullable(),novaGuia:z.boolean(),grupoId:z.string().min(1)}).strict();
const configSchema=z.object({portalUrl:url.nullable(),portalDescricao:z.string().trim().max(1500).nullable()}).strict();
const reorderSchema=z.object({grupoId:z.string().min(1).nullable(),ids:z.array(z.string().min(1)).max(1000)}).strict();
function handle(error:unknown):never{
 if(error instanceof Prisma.PrismaClientKnownRequestError){
  if(error.code==='P2002')throw new ConflictException('Já existe um grupo com esse nome');
  if(error.code==='P2003')throw new ConflictException('Grupo com links cadastrados não pode ser excluído');
  if(error.code==='P2025')throw new NotFoundException();
 }
 throw error;
}
@Controller()
export class TransparenciaController {
 constructor(private readonly prisma:PrismaService){}
 private async read(){
  const [configuracao,grupos]=await Promise.all([
   this.prisma.transparenciaConfiguracao.findUnique({where:{id:'principal'}}),
   this.prisma.transparenciaGrupo.findMany({orderBy:[{ordem:'asc'},{criadoEm:'asc'}],include:{links:{orderBy:[{ordem:'asc'},{criadoEm:'asc'}]}}})
  ]);
  return {configuracao,grupos};
 }
 @Get('transparencia')
 publicData(){return this.read();}
 @UseGuards(AuthGuard) @Get('admin/transparencia')
 adminData(){return this.read();}
 @UseGuards(AuthGuard) @Patch('admin/transparencia/configuracao')
 async saveConfig(@Req() req:{user:AuthUser},@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=configSchema.safeParse(body);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  return this.prisma.transparenciaConfiguracao.upsert({where:{id:'principal'},create:{id:'principal',...parsed.data},update:parsed.data});
 }
 @UseGuards(AuthGuard) @Post('admin/transparencia/grupos')
 async createGroup(@Req() req:{user:AuthUser},@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=groupSchema.safeParse(body);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  try{const ordem=await this.prisma.transparenciaGrupo.count();return await this.prisma.transparenciaGrupo.create({data:{...parsed.data,ordem}});}catch(e){handle(e);}
 }
 @UseGuards(AuthGuard) @Patch('admin/transparencia/grupos/:id')
 async editGroup(@Req() req:{user:AuthUser},@Param('id') id:string,@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=groupSchema.safeParse(body);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  try{return await this.prisma.transparenciaGrupo.update({where:{id},data:parsed.data});}catch(e){handle(e);}
 }
 @UseGuards(AuthGuard) @Delete('admin/transparencia/grupos/:id')
 async deleteGroup(@Req() req:{user:AuthUser},@Param('id') id:string){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  if(await this.prisma.transparenciaLink.count({where:{grupoId:id}}))throw new ConflictException('Mova ou exclua os links antes de excluir o grupo');
  try{await this.prisma.transparenciaGrupo.delete({where:{id}});return {ok:true};}catch(e){handle(e);}
 }
 @UseGuards(AuthGuard) @Post('admin/transparencia/links')
 async createLink(@Req() req:{user:AuthUser},@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=linkSchema.safeParse(body);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  if(!(await this.prisma.transparenciaGrupo.findUnique({where:{id:parsed.data.grupoId}})))throw new BadRequestException('Grupo não encontrado');
  const ordem=await this.prisma.transparenciaLink.count({where:{grupoId:parsed.data.grupoId}});
  return this.prisma.transparenciaLink.create({data:{...parsed.data,ordem}});
 }
 @UseGuards(AuthGuard) @Patch('admin/transparencia/links/:id')
 async editLink(@Req() req:{user:AuthUser},@Param('id') id:string,@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=linkSchema.safeParse(body);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  const [existing,group]=await Promise.all([this.prisma.transparenciaLink.findUnique({where:{id}}),this.prisma.transparenciaGrupo.findUnique({where:{id:parsed.data.grupoId}})]);
  if(!existing)throw new NotFoundException();
  if(!group)throw new BadRequestException('Grupo não encontrado');
  const ordem=existing.grupoId===parsed.data.grupoId?existing.ordem:await this.prisma.transparenciaLink.count({where:{grupoId:parsed.data.grupoId}});
  try{return await this.prisma.transparenciaLink.update({where:{id},data:{...parsed.data,ordem}});}catch(e){handle(e);}
 }
 @UseGuards(AuthGuard) @Delete('admin/transparencia/links/:id')
 async deleteLink(@Req() req:{user:AuthUser},@Param('id') id:string){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  try{await this.prisma.transparenciaLink.delete({where:{id}});return {ok:true};}catch(e){handle(e);}
 }
 @UseGuards(AuthGuard) @Patch('admin/transparencia/ordenar')
 async reorder(@Req() req:{user:AuthUser},@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=reorderSchema.safeParse(body);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  const {grupoId,ids}=parsed.data;
  if(grupoId===null){
   const existing=await this.prisma.transparenciaGrupo.findMany({select:{id:true}});
   if(existing.length!==ids.length||new Set(ids).size!==ids.length||existing.some(x=>!ids.includes(x.id)))throw new BadRequestException('Ordem dos grupos inválida');
   await this.prisma.$transaction(ids.map((id,ordem)=>this.prisma.transparenciaGrupo.update({where:{id},data:{ordem}})));
  }else{
   const existing=await this.prisma.transparenciaLink.findMany({where:{grupoId},select:{id:true}});
   if(existing.length!==ids.length||new Set(ids).size!==ids.length||existing.some(x=>!ids.includes(x.id)))throw new BadRequestException('Ordem dos links inválida');
   await this.prisma.$transaction(ids.map((id,ordem)=>this.prisma.transparenciaLink.update({where:{id},data:{ordem}})));
  }
  return {ok:true};
 }
}
