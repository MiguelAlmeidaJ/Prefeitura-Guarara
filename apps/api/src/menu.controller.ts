import {Body,Controller,Delete,Get,Param,Patch,Post,Req,UseGuards,BadRequestException,NotFoundException,ConflictException} from '@nestjs/common';
import {z} from 'zod';
import {PrismaService} from './prisma.service';
import {AuthGuard,AuthUser,requireRoles} from './auth.guard';

const pathSchema=z.string().trim().min(1).max(2000).refine(link=>{
 if(link.startsWith('/')&&!link.startsWith('//')&&!link.includes('\\'))return true;
 try{const url=new URL(link);return ['http:','https:'].includes(url.protocol);}catch{return false;}
},'Use uma rota interna iniciada por / ou URL http(s)');
const menuSchema=z.object({
 nome:z.string().trim().min(1).max(120),
 link:pathSchema,
 novaGuia:z.boolean(),
 ascendenteId:z.string().min(1).nullable(),
}).strict();
const reorderSchema=z.object({ascendenteId:z.string().min(1).nullable(),ids:z.array(z.string().min(1)).max(500)}).strict();
@Controller()
export class MenuController {
 constructor(private readonly prisma:PrismaService){}
 @Get('menu')
 listPublic(){return this.prisma.menuItem.findMany({orderBy:[{ordem:'asc'},{criadoEm:'asc'}],select:{id:true,nome:true,link:true,novaGuia:true,ascendenteId:true,ordem:true}});}
 @UseGuards(AuthGuard) @Get('admin/menu')
 list(){return this.prisma.menuItem.findMany({orderBy:[{ordem:'asc'},{criadoEm:'asc'}]});}
 private async validParent(parentId:string|null,selfId?:string){
  if(!parentId)return;
  if(parentId===selfId)throw new BadRequestException('Um item não pode ser ascendente de si mesmo');
  const all=await this.prisma.menuItem.findMany({select:{id:true,ascendenteId:true}});
  const byId=new Map(all.map(item=>[item.id,item.ascendenteId]));
  if(!byId.has(parentId))throw new BadRequestException('Ascendente não encontrado');
  let current:string|null=parentId;
  const visited=new Set<string>();
  while(current){
   if(current===selfId||visited.has(current))throw new BadRequestException('Hierarquia circular não permitida');
   visited.add(current);current=byId.get(current)??null;
  }
 }
 @UseGuards(AuthGuard) @Post('admin/menu')
 async create(@Req() req:{user:AuthUser},@Body() input:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=menuSchema.safeParse(input);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  await this.validParent(parsed.data.ascendenteId);
  const order=await this.prisma.menuItem.count({where:{ascendenteId:parsed.data.ascendenteId}});
  return this.prisma.menuItem.create({data:{...parsed.data,ordem:order}});
 }
 @UseGuards(AuthGuard) @Patch('admin/menu/ordenar')
 async reorder(@Req() req:{user:AuthUser},@Body() input:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=reorderSchema.safeParse(input);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  const {ascendenteId,ids}=parsed.data;
  const siblings=await this.prisma.menuItem.findMany({where:{ascendenteId},select:{id:true}});
  if(siblings.length!==ids.length||new Set(ids).size!==ids.length||siblings.some(item=>!ids.includes(item.id)))throw new BadRequestException('A ordem deve conter todos os itens do mesmo nível, sem repetições');
  await this.prisma.$transaction(ids.map((id,ordem)=>this.prisma.menuItem.update({where:{id},data:{ordem}})));
  return {ok:true};
 }
 @UseGuards(AuthGuard) @Patch('admin/menu/:id')
 async update(@Req() req:{user:AuthUser},@Param('id') id:string,@Body() input:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=menuSchema.safeParse(input);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  const original=await this.prisma.menuItem.findUnique({where:{id}});
  if(!original)throw new NotFoundException();
  await this.validParent(parsed.data.ascendenteId,id);
  const changedParent=original.ascendenteId!==parsed.data.ascendenteId;
  const ordem=changedParent?await this.prisma.menuItem.count({where:{ascendenteId:parsed.data.ascendenteId}}):original.ordem;
  const updated=await this.prisma.menuItem.update({where:{id},data:{...parsed.data,ordem}});
  return updated;
 }
 @UseGuards(AuthGuard) @Delete('admin/menu/:id')
 async remove(@Req() req:{user:AuthUser},@Param('id') id:string){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  if(!(await this.prisma.menuItem.findUnique({where:{id}})))throw new NotFoundException();
  if(await this.prisma.menuItem.count({where:{ascendenteId:id}}))throw new ConflictException('Exclua ou mova os submenus antes de remover este item');
  await this.prisma.menuItem.delete({where:{id}});return {ok:true};
 }
}
