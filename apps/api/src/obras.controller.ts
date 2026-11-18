import {BadRequestException,Body,ConflictException,Controller,Delete,Get,NotFoundException,Param,Patch,Post,Req,UseGuards} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {z} from 'zod';
import {PrismaService} from './prisma.service';
import {AuthGuard,AuthUser,requireRoles} from './auth.guard';

const nameSchema=z.object({nome:z.string().trim().min(2).max(120)}).strict();
const obraSchema=z.object({
 ano:z.number().int().min(1900).max(2200),
 numero:z.string().trim().min(1).max(60),
 objeto:z.string().trim().min(3).max(6000),
 categoriaId:z.string().min(1),
 recursoId:z.string().min(1),
 inicio:z.string().regex(/^\d{4}-\d{2}-\d{2}$/,'Informe uma data no formato AAAA-MM-DD'),
 comprovacaoUrl:z.string().url().max(2000).refine(value=>/^https?:\/\//i.test(value),'Informe URL HTTP(S)'),
}).strict();
function prismaError(error:unknown):never{
 if(error instanceof Prisma.PrismaClientKnownRequestError){
  if(error.code==='P2002')throw new ConflictException('Já existe um registro com esse nome');
  if(error.code==='P2003')throw new ConflictException('Registro utilizado por obras. Reatribua as obras antes de excluir.');
  if(error.code==='P2025')throw new NotFoundException();
 }
 throw error;
}
@Controller()
export class ObrasController{
 constructor(private readonly prisma:PrismaService){}
 @Get('obras-publicas')
 listPublic(){return this.prisma.obraPublica.findMany({orderBy:[{inicio:'desc'},{numero:'asc'}],select:{id:true,ano:true,numero:true,objeto:true,inicio:true,comprovacaoUrl:true,categoria:{select:{id:true,nome:true}},recurso:{select:{id:true,nome:true}}}});}
 @Get('obras-publicas/opcoes')
 publicOptions(){return this.loadOptions();}
 @UseGuards(AuthGuard) @Get('admin/obras-publicas')
 listAdmin(){return this.prisma.obraPublica.findMany({orderBy:[{inicio:'desc'},{criadoEm:'desc'}],include:{categoria:true,recurso:true}});}
 @UseGuards(AuthGuard) @Get('admin/obras-publicas/opcoes')
 adminOptions(){return this.loadOptions();}
 private async loadOptions(){
  const [categorias,recursos]=await Promise.all([
   this.prisma.categoriaObra.findMany({orderBy:{nome:'asc'}}),
   this.prisma.recursoObra.findMany({orderBy:{nome:'asc'}}),
  ]);
  return {categorias,recursos};
 }
 @UseGuards(AuthGuard) @Post('admin/obras-publicas')
 async create(@Req() req:{user:AuthUser},@Body() input:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const data=this.parseObra(input);
  await this.checkRelations(data.categoriaId,data.recursoId);
  try{return await this.prisma.obraPublica.create({data});}catch(error){prismaError(error);}
 }
 @UseGuards(AuthGuard) @Patch('admin/obras-publicas/:id')
 async update(@Req() req:{user:AuthUser},@Param('id') id:string,@Body() input:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const data=this.parseObra(input);
  await this.checkRelations(data.categoriaId,data.recursoId);
  try{return await this.prisma.obraPublica.update({where:{id},data});}catch(error){prismaError(error);}
 }
 private parseObra(input:unknown){
  const result=obraSchema.safeParse(input);
  if(!result.success)throw new BadRequestException(result.error.flatten());
  const {inicio,...others}=result.data;
  const date=new Date(inicio+'T00:00:00.000Z');
  if(Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==inicio)throw new BadRequestException('Data inválida');
  return {...others,inicio:date};
 }
 private async checkRelations(categoriaId:string,recursoId:string){
  const [categoria,recurso]=await Promise.all([
   this.prisma.categoriaObra.findUnique({where:{id:categoriaId},select:{id:true}}),
   this.prisma.recursoObra.findUnique({where:{id:recursoId},select:{id:true}}),
  ]);
  if(!categoria||!recurso)throw new BadRequestException('Categoria ou recurso não encontrado');
 }
 @UseGuards(AuthGuard) @Delete('admin/obras-publicas/:id')
 async remove(@Req() req:{user:AuthUser},@Param('id') id:string){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  try{await this.prisma.obraPublica.delete({where:{id}});return {ok:true};}catch(error){prismaError(error);}
 }
 @UseGuards(AuthGuard) @Post('admin/obras-publicas/categorias')
 async createCategory(@Req() req:{user:AuthUser},@Body() input:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=nameSchema.safeParse(input);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  try{return await this.prisma.categoriaObra.create({data:parsed.data});}catch(error){prismaError(error);}
 }
 @UseGuards(AuthGuard) @Patch('admin/obras-publicas/categorias/:id')
 async updateCategory(@Req() req:{user:AuthUser},@Param('id') id:string,@Body() input:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=nameSchema.safeParse(input);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  try{return await this.prisma.categoriaObra.update({where:{id},data:parsed.data});}catch(error){prismaError(error);}
 }
 @UseGuards(AuthGuard) @Delete('admin/obras-publicas/categorias/:id')
 async deleteCategory(@Req() req:{user:AuthUser},@Param('id') id:string){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  try{await this.prisma.categoriaObra.delete({where:{id}});return {ok:true};}catch(error){prismaError(error);}
 }
 @UseGuards(AuthGuard) @Post('admin/obras-publicas/recursos')
 async createResource(@Req() req:{user:AuthUser},@Body() input:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=nameSchema.safeParse(input);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  try{return await this.prisma.recursoObra.create({data:parsed.data});}catch(error){prismaError(error);}
 }
 @UseGuards(AuthGuard) @Patch('admin/obras-publicas/recursos/:id')
 async updateResource(@Req() req:{user:AuthUser},@Param('id') id:string,@Body() input:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=nameSchema.safeParse(input);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  try{return await this.prisma.recursoObra.update({where:{id},data:parsed.data});}catch(error){prismaError(error);}
 }
 @UseGuards(AuthGuard) @Delete('admin/obras-publicas/recursos/:id')
 async deleteResource(@Req() req:{user:AuthUser},@Param('id') id:string){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  try{await this.prisma.recursoObra.delete({where:{id}});return {ok:true};}catch(error){prismaError(error);}
 }
}
