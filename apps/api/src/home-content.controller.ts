import {BadRequestException,Body,Controller,Delete,Get,NotFoundException,Param,Patch,Post,Req,UseGuards} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {z} from 'zod';
import {PrismaService} from './prisma.service';
import {AuthGuard,AuthUser,requireRoles} from './auth.guard';
const http=z.string().trim().min(1).max(2048).refine(v=>v.startsWith('/')&&!v.startsWith('//')||/^https?:\/\//i.test(v),'Informe endereço interno ou HTTP(S)');
const access=z.object({titulo:z.string().trim().min(2).max(110),url:http,novaGuia:z.boolean(),ordem:z.number().int().min(0).max(99999),ativo:z.boolean()}).strict();
const photo=z.object({titulo:z.string().trim().min(2).max(130),arquivo:z.string().regex(/^[a-zA-Z0-9_-]{1,128}\.(png|jpg|webp)$/),ordem:z.number().int().min(0).max(99999),ativo:z.boolean()}).strict();
const ordering=z.object({ids:z.array(z.string().min(1)).max(300)}).strict();
function validate<T>(schema:z.ZodType<T>,body:unknown):T{
 const result=schema.safeParse(body);
 if(!result.success)throw new BadRequestException(result.error.flatten());
 return result.data;
}
function notFound(error:unknown):never{
 if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2025')throw new NotFoundException('Registro não encontrado');
 throw error;
}
@Controller()
export class HomeContentController {
 constructor(private readonly prisma:PrismaService){}
 @Get('home/conteudo')
 async home(){
  const [acessos,fotos]=await Promise.all([
   this.prisma.acessoRapido.findMany({where:{ativo:true},orderBy:[{ordem:'asc'},{criadoEm:'asc'}]}),
   this.prisma.imagemCidade.findMany({where:{ativo:true},orderBy:[{ordem:'asc'},{criadoEm:'asc'}]})
  ]);
  return {acessos,fotos};
 }
 @UseGuards(AuthGuard) @Get('admin/home/acessos')
 allAccess(){return this.prisma.acessoRapido.findMany({orderBy:[{ordem:'asc'},{criadoEm:'asc'}]});}
 @UseGuards(AuthGuard) @Post('admin/home/acessos')
 addAccess(@Req() req:{user:AuthUser},@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  return this.prisma.acessoRapido.create({data:validate(access,body)});
 }
 @UseGuards(AuthGuard) @Patch('admin/home/acessos/:id')
 async editAccess(@Req() req:{user:AuthUser},@Param('id') id:string,@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  try{return await this.prisma.acessoRapido.update({where:{id},data:validate(access,body)});}catch(e){notFound(e);}
 }
 @UseGuards(AuthGuard) @Delete('admin/home/acessos/:id')
 async deleteAccess(@Req() req:{user:AuthUser},@Param('id') id:string){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  try{await this.prisma.acessoRapido.delete({where:{id}});return {ok:true};}catch(e){notFound(e);}
 }
 @UseGuards(AuthGuard) @Post('admin/home/acessos/ordenar')
 async orderAccess(@Req() req:{user:AuthUser},@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const {ids}=validate(ordering,body);
  if(new Set(ids).size!==ids.length)throw new BadRequestException('IDs repetidos');
  const existing=await this.prisma.acessoRapido.findMany({select:{id:true}});
  if(existing.length!==ids.length||existing.some(i=>!ids.includes(i.id)))throw new BadRequestException('Informe todos os registros');
  await this.prisma.$transaction(ids.map((id,ordem)=>this.prisma.acessoRapido.update({where:{id},data:{ordem}})));
  return {ok:true};
 }
 @UseGuards(AuthGuard) @Get('admin/home/fotos')
 allPhotos(){return this.prisma.imagemCidade.findMany({orderBy:[{ordem:'asc'},{criadoEm:'asc'}]});}
 @UseGuards(AuthGuard) @Post('admin/home/fotos')
 addPhoto(@Req() req:{user:AuthUser},@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  return this.prisma.imagemCidade.create({data:validate(photo,body)});
 }
 @UseGuards(AuthGuard) @Patch('admin/home/fotos/:id')
 async editPhoto(@Req() req:{user:AuthUser},@Param('id') id:string,@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  try{return await this.prisma.imagemCidade.update({where:{id},data:validate(photo,body)});}catch(e){notFound(e);}
 }
 @UseGuards(AuthGuard) @Delete('admin/home/fotos/:id')
 async deletePhoto(@Req() req:{user:AuthUser},@Param('id') id:string){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  try{await this.prisma.imagemCidade.delete({where:{id}});return {ok:true};}catch(e){notFound(e);}
 }
 @UseGuards(AuthGuard) @Post('admin/home/fotos/ordenar')
 async orderPhotos(@Req() req:{user:AuthUser},@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const {ids}=validate(ordering,body);
  if(new Set(ids).size!==ids.length)throw new BadRequestException('IDs repetidos');
  const existing=await this.prisma.imagemCidade.findMany({select:{id:true}});
  if(existing.length!==ids.length||existing.some(i=>!ids.includes(i.id)))throw new BadRequestException('Informe todos os registros');
  await this.prisma.$transaction(ids.map((id,ordem)=>this.prisma.imagemCidade.update({where:{id},data:{ordem}})));
  return {ok:true};
 }
}
