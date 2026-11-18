import {BadRequestException,Body,Controller,Delete,Get,NotFoundException,Param,Patch,Post,Req,UseGuards} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {z} from 'zod';
import {PrismaService} from './prisma.service';
import {AuthGuard,AuthUser,requireRoles} from './auth.guard';

const inputSchema=z.object({
 nome:z.string().trim().min(2).max(180),
 link:z.string().trim().url().max(2048).refine(value=>/^https?:\/\//i.test(value),'O link deve iniciar com http:// ou https://')
}).strict();
const orderSchema=z.object({ids:z.array(z.string().min(1)).max(1000)}).strict();
@Controller()
export class ProtocoloController {
 constructor(private readonly prisma:PrismaService){}
 @Get('protocolos')
 publicList(){return this.prisma.protocoloFormulario.findMany({orderBy:[{ordem:'asc'},{criadoEm:'asc'}],select:{id:true,nome:true,link:true,ordem:true}});}
 @UseGuards(AuthGuard) @Get('admin/protocolos')
 adminList(){return this.prisma.protocoloFormulario.findMany({orderBy:[{ordem:'asc'},{criadoEm:'asc'}]});}
 @UseGuards(AuthGuard) @Post('admin/protocolos')
 async create(@Req() req:{user:AuthUser},@Body() input:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=inputSchema.safeParse(input);
  if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  const ordem=await this.prisma.protocoloFormulario.count();
  return this.prisma.protocoloFormulario.create({data:{...parsed.data,ordem}});
 }
 @UseGuards(AuthGuard) @Patch('admin/protocolos/ordenar')
 async reorder(@Req() req:{user:AuthUser},@Body() input:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=orderSchema.safeParse(input);
  if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  const ids=parsed.data.ids;
  const existing=await this.prisma.protocoloFormulario.findMany({select:{id:true}});
  if(existing.length!==ids.length||new Set(ids).size!==ids.length||existing.some(item=>!ids.includes(item.id)))throw new BadRequestException('Informe todos os IDs, sem repetição');
  await this.prisma.$transaction(ids.map((id,ordem)=>this.prisma.protocoloFormulario.update({where:{id},data:{ordem}})));
  return {ok:true};
 }
 @UseGuards(AuthGuard) @Patch('admin/protocolos/:id')
 async update(@Req() req:{user:AuthUser},@Param('id') id:string,@Body() input:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=inputSchema.safeParse(input);
  if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  try{return await this.prisma.protocoloFormulario.update({where:{id},data:parsed.data});}
  catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2025')throw new NotFoundException();throw error;}
 }
 @UseGuards(AuthGuard) @Delete('admin/protocolos/:id')
 async remove(@Req() req:{user:AuthUser},@Param('id') id:string){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  try{await this.prisma.protocoloFormulario.delete({where:{id}});return {ok:true};}
  catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2025')throw new NotFoundException();throw error;}
 }
}
