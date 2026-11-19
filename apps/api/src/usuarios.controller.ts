import {BadRequestException,ConflictException,Controller,Body,Get,Param,Patch,Post,Req,UseGuards,NotFoundException} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {hash} from 'bcryptjs';
import {z} from 'zod';
import {PrismaService} from './prisma.service';
import {AuthGuard,AuthUser,requireRoles} from './auth.guard';
const createSchema=z.object({nome:z.string().trim().min(2).max(150),email:z.string().trim().email(),senha:z.string().min(12).max(200),papel:z.enum(['ADMINISTRADOR','GESTOR','EDITOR'])}).strict();
const editSchema=z.object({nome:z.string().trim().min(2).max(150),email:z.string().trim().email(),papel:z.enum(['ADMINISTRADOR','GESTOR','EDITOR']),ativo:z.boolean(),senha:z.string().min(12).max(200).optional()}).strict();
function dbError(e:unknown):never{
 if(e instanceof Prisma.PrismaClientKnownRequestError){
  if(e.code==='P2002')throw new ConflictException('Esse e-mail já está cadastrado');
  if(e.code==='P2025')throw new NotFoundException('Usuário não encontrado');
 }
 throw e;
}
@Controller('admin/usuarios')
@UseGuards(AuthGuard)
export class UsuariosController{
 constructor(private readonly prisma:PrismaService){}
 @Get()
 list(@Req() req:{user:AuthUser}){
  requireRoles(req.user,'ADMINISTRADOR');
  return this.prisma.usuario.findMany({select:{id:true,nome:true,email:true,papel:true,ativo:true,criadoEm:true},orderBy:{nome:'asc'}});
 }
 @Post()
 async create(@Req() req:{user:AuthUser},@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR');
  const parsed=createSchema.safeParse(body);
  if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  const {senha,...data}=parsed.data;
  try{return await this.prisma.usuario.create({data:{...data,email:data.email.toLowerCase(),senhaHash:await hash(senha,12)},select:{id:true,nome:true,email:true,papel:true,ativo:true}});}catch(e){dbError(e);}
 }
 @Patch(':id')
 async update(@Req() req:{user:AuthUser},@Param('id') id:string,@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR');
  const parsed=editSchema.safeParse(body);
  if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  if(id===req.user.id&&(parsed.data.ativo===false||parsed.data.papel!=='ADMINISTRADOR'))throw new BadRequestException('Você não pode desativar ou rebaixar o próprio perfil');
  const existing=await this.prisma.usuario.findUnique({where:{id},select:{id:true,papel:true,ativo:true}});
  if(!existing)throw new NotFoundException('Usuário não encontrado');
  if(existing.papel==='ADMINISTRADOR'&&existing.ativo&&(parsed.data.ativo===false||parsed.data.papel!=='ADMINISTRADOR')){
   const count=await this.prisma.usuario.count({where:{papel:'ADMINISTRADOR',ativo:true}});
   if(count<=1)throw new BadRequestException('É necessário manter pelo menos um administrador ativo');
  }
  const {senha,...data}=parsed.data;
  try{return await this.prisma.usuario.update({where:{id},data:{...data,email:data.email.toLowerCase(),...(senha?{senhaHash:await hash(senha,12)}:{})},select:{id:true,nome:true,email:true,papel:true,ativo:true}});}catch(e){dbError(e);}
 }
}
