import {Body,Controller,Get,Post,Patch,Delete,Param,Req,UseGuards,BadRequestException,ConflictException,NotFoundException,UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {PrismaService} from './prisma.service';
import {AuthGuard,AuthUser,requireRoles} from './auth.guard';
import {pageInput,userInput,tableInput} from './page-schema';
import {compare,hash} from 'bcryptjs';
import {Prisma,EstadoPagina} from '@prisma/client';
@Controller()
export class CmsController {
 constructor(private prisma:PrismaService,private jwt:JwtService){}
 @Post('auth/login')
 async login(@Body() body:{email?:unknown;senha?:unknown}){
  if(typeof body?.email!=='string'||typeof body?.senha!=='string')throw new BadRequestException();
  const user=await this.prisma.usuario.findUnique({where:{email:body.email.trim().toLowerCase()}});
  if(!user?.ativo||!(await compare(body.senha,user.senhaHash)))throw new UnauthorizedException('Credenciais inválidas');
  return {accessToken:await this.jwt.signAsync({sub:user.id}),user:{id:user.id,nome:user.nome,papel:user.papel}};
 }
 @Get('paginas')
 publicPages(){return this.prisma.pagina.findMany({where:{estado:'PUBLICADA'},orderBy:[{ordem:'asc'},{titulo:'asc'}],select:{id:true,titulo:true,slug:true,subtitulo:true,tipo:true,ordem:true}});}
 @Get('paginas/:slug')
 async publicPage(@Param('slug') slug:string){
  const p=await this.prisma.pagina.findFirst({where:{slug,estado:'PUBLICADA'},select:{id:true,titulo:true,slug:true,subtitulo:true,tipo:true,conteudo:true}});
  if(!p)throw new NotFoundException();
  if(p.tipo==='TABELA_SIMPLES'&&p.conteudo&&typeof p.conteudo==='object'&&!Array.isArray(p.conteudo)&&'tabelaId' in p.conteudo){
   const id=(p.conteudo as {tabelaId:string}).tabelaId;
   const tabela=await this.prisma.tabela.findUnique({where:{id},select:{id:true,nome:true,colunas:true,linhas:true}});
   if(!tabela)throw new NotFoundException('Tabela vinculada não encontrada');
   return {...p,conteudo:tabela};
  }
  if(p.tipo==='TABELA_ABAS'&&p.conteudo&&typeof p.conteudo==='object'&&!Array.isArray(p.conteudo)&&'abas' in p.conteudo){
   const abas=(p.conteudo as {abas:Array<{titulo:string;tabelaId?:string;tabela?:unknown}>}).abas;
   if(abas.every(a=>a.tabelaId)){
    const ids=abas.map(a=>a.tabelaId!);
    const tabelas=await this.prisma.tabela.findMany({where:{id:{in:ids}},select:{id:true,nome:true,colunas:true,linhas:true}});
    if(tabelas.length!==new Set(ids).size)throw new NotFoundException('Tabela vinculada não encontrada');
    return {...p,conteudo:{abas:abas.map(a=>({titulo:a.titulo,tabela:tabelas.find(t=>t.id===a.tabelaId)!}))}};
   }
  }
  return p;
 }
 @UseGuards(AuthGuard) @Get('admin/me')
 me(@Req() req:{user:AuthUser}){return req.user;}
 @UseGuards(AuthGuard) @Get('admin/paginas')
 list(){return this.prisma.pagina.findMany({orderBy:{atualizadoEm:'desc'}});}
 @UseGuards(AuthGuard) @Post('admin/paginas')
 async create(@Req() req:{user:AuthUser},@Body() body:unknown){
  const parsed=pageInput.safeParse(body);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  await this.ensureTables(parsed.data.tipo,parsed.data.conteudo);
  try{return await this.prisma.pagina.create({data:{...parsed.data,conteudo:parsed.data.conteudo as Prisma.InputJsonValue,autorId:req.user.id}});}
  catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==='P2002')throw new ConflictException('Slug em uso');throw e;}
 }
 @UseGuards(AuthGuard) @Patch('admin/paginas/:id')
 async update(@Req() req:{user:AuthUser},@Param('id') id:string,@Body() body:unknown){
  const previous=await this.prisma.pagina.findUnique({where:{id}});
  if(!previous)throw new NotFoundException();
  if(req.user.papel==='EDITOR'&&previous.estado!=='RASCUNHO')throw new BadRequestException('Editores só podem alterar rascunhos');
  const parsed=pageInput.safeParse(body);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  await this.ensureTables(parsed.data.tipo,parsed.data.conteudo);
  try{return await this.prisma.pagina.update({where:{id},data:{...parsed.data,conteudo:parsed.data.conteudo as Prisma.InputJsonValue}});}
  catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==='P2002')throw new ConflictException('Slug em uso');if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==='P2025')throw new NotFoundException();throw e;}
 }
 @UseGuards(AuthGuard) @Patch('admin/paginas/:id/estado')
 async publish(@Req() req:{user:AuthUser},@Param('id') id:string,@Body() body:{estado?:unknown}){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  if(!['PUBLICADA','RASCUNHO','ARQUIVADA'].includes(body?.estado as string))throw new BadRequestException();
  const old=await this.prisma.pagina.findUnique({where:{id}});if(!old)throw new NotFoundException();
  const estado=body.estado as EstadoPagina;
  return this.prisma.pagina.update({where:{id},data:{estado,publicadoEm:estado==='PUBLICADA'?(old.publicadoEm??new Date()):null}});
 }
 @UseGuards(AuthGuard) @Delete('admin/paginas/:id')
 async remove(@Req() req:{user:AuthUser},@Param('id') id:string){
  requireRoles(req.user,'ADMINISTRADOR');
  try{await this.prisma.pagina.delete({where:{id}});return {ok:true};}
  catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==='P2025')throw new NotFoundException();throw e;}
 }
 @UseGuards(AuthGuard) @Post('admin/usuarios')
 async createUser(@Req() req:{user:AuthUser},@Body() body:unknown){
  requireRoles(req.user,'ADMINISTRADOR');
  const parsed=userInput.safeParse(body);if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  const {senha,...data}=parsed.data;
  try{return await this.prisma.usuario.create({data:{...data,email:data.email.trim().toLowerCase(),senhaHash:await hash(senha,12)},select:{id:true,nome:true,email:true,papel:true}});}
  catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==='P2002')throw new ConflictException('Email em uso');throw e;}
 }
 private async ensureTables(tipo:string,conteudo:unknown){
  const data=conteudo as {tabelaId?:string;abas?:Array<{tabelaId?:string}>};
  const ids=tipo==='TABELA_SIMPLES'&&data.tabelaId?[data.tabelaId]:tipo==='TABELA_ABAS'&&data.abas?.every(a=>a.tabelaId)?data.abas.map(a=>a.tabelaId!):[];
  if(!ids.length)return;
  const count=await this.prisma.tabela.count({where:{id:{in:ids}}});
  if(count!==new Set(ids).size)throw new BadRequestException('Uma ou mais tabelas vinculadas não existem');
 }
 @UseGuards(AuthGuard) @Get('admin/tabelas')
 listTables(){return this.prisma.tabela.findMany({orderBy:{atualizadoEm:'desc'}});}
 @UseGuards(AuthGuard) @Get('admin/tabelas/:id')
 async table(@Param('id') id:string){
  const t=await this.prisma.tabela.findUnique({where:{id}});if(!t)throw new NotFoundException();return t;
 }
 @UseGuards(AuthGuard) @Post('admin/tabelas')
 async createTable(@Body() body:unknown){
  const parsed=tableInput.safeParse(body);
  if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  return this.prisma.tabela.create({data:{nome:parsed.data.nome,descricao:parsed.data.descricao,colunas:parsed.data.colunas,linhas:parsed.data.linhas as Prisma.InputJsonValue}});
 }
 @UseGuards(AuthGuard) @Patch('admin/tabelas/:id')
 async updateTable(@Param('id') id:string,@Body() body:unknown){
  const parsed=tableInput.safeParse(body);
  if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  try{return await this.prisma.tabela.update({where:{id},data:{nome:parsed.data.nome,descricao:parsed.data.descricao,colunas:parsed.data.colunas,linhas:parsed.data.linhas as Prisma.InputJsonValue}});}
  catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==='P2025')throw new NotFoundException();throw e;}
 }
 @UseGuards(AuthGuard) @Delete('admin/tabelas/:id')
 async deleteTable(@Req() req:{user:AuthUser},@Param('id') id:string){
  requireRoles(req.user,'ADMINISTRADOR');
  const pages=await this.prisma.pagina.findMany({where:{tipo:{in:['TABELA_SIMPLES','TABELA_ABAS']}},select:{conteudo:true}});
  if(pages.some(p=>JSON.stringify(p.conteudo).includes('"'+id+'"')))throw new ConflictException('Tabela vinculada a uma página: desvincule antes de excluir');
  try{await this.prisma.tabela.delete({where:{id}});return {ok:true};}
  catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==='P2025')throw new NotFoundException();throw e;}
 }

}
