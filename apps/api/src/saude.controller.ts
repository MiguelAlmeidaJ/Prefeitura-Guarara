import {BadRequestException,Body,Controller,Delete,Get,NotFoundException,Param,Patch,Post,Req,UseGuards} from '@nestjs/common';
import {Prisma,TipoConteudoSaude} from '@prisma/client';
import {z} from 'zod';
import {AuthGuard,AuthUser,requireRoles} from './auth.guard';
import {PrismaService} from './prisma.service';

const webLink=z.string().trim().url().max(2048).refine(value=>/^https?:\/\//i.test(value),'Endereço HTTP(S) obrigatório');
const optionalText=(max:number)=>z.string().trim().max(max).nullable();
const recordInput=z.object({
 tipo:z.nativeEnum(TipoConteudoSaude),
 categoria:optionalText(120).optional(),
 titulo:z.string().trim().min(2).max(200),
 descricao:optionalText(5000),
 ano:z.number().int().min(1900).max(2200).nullable(),
 link:webLink,
 textoBotao:optionalText(90),
 linkSecundario:webLink.nullable(),
 textoBotaoSecundario:optionalText(90),
 destaque:z.boolean(),
 ordem:z.number().int().min(0).max(99999),
}).strict();
const orderInput=z.object({tipo:z.nativeEnum(TipoConteudoSaude),ids:z.array(z.string().min(1)).max(1000)}).strict();
const configInput=z.object({
 nomeSecretario:optionalText(160),telefone:optionalText(80),endereco:optionalText(300),
 horario:optionalText(200),descricao:optionalText(3000),
}).strict();

@Controller()
export class SaudeController {
 constructor(private readonly prisma:PrismaService){}
 @Get('saude')
 async publicData(){
  const [configuracao,conteudos]=await Promise.all([
   this.prisma.saudeConfiguracao.findUnique({where:{id:'principal'}}),
   this.prisma.saudeConteudo.findMany({orderBy:[{ordem:'asc'},{ano:'desc'},{criadoEm:'desc'}]})
  ]);
  return {configuracao,conteudos};
 }
 @UseGuards(AuthGuard) @Get('admin/saude')
 adminData(){return this.publicData();}
 @UseGuards(AuthGuard) @Patch('admin/saude/configuracao')
 async saveConfig(@Req() req:{user:AuthUser},@Body() input:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=configInput.safeParse(input);
  if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  return this.prisma.saudeConfiguracao.upsert({where:{id:'principal'},create:{id:'principal',...parsed.data},update:parsed.data});
 }
 @UseGuards(AuthGuard) @Patch('admin/saude/ordenar')
 async reorder(@Req() req:{user:AuthUser},@Body() input:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const parsed=orderInput.safeParse(input);
  if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  const {tipo,ids}=parsed.data;
  const siblings=await this.prisma.saudeConteudo.findMany({where:{tipo},select:{id:true}});
  if(siblings.length!==ids.length||new Set(ids).size!==ids.length||siblings.some(item=>!ids.includes(item.id))){
   throw new BadRequestException('A lista de ordenação deve incluir todos os registros desta seção sem repetições');
  }
  await this.prisma.$transaction(ids.map((id,ordem)=>this.prisma.saudeConteudo.update({where:{id},data:{ordem}})));
  return {ok:true};
 }
 @UseGuards(AuthGuard) @Post('admin/saude/conteudos')
 async create(@Req() req:{user:AuthUser},@Body() input:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const data=this.parse(input);return this.prisma.saudeConteudo.create({data});
 }
 @UseGuards(AuthGuard) @Patch('admin/saude/conteudos/:id')
 async update(@Req() req:{user:AuthUser},@Param('id') id:string,@Body() input:unknown){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  try{return await this.prisma.saudeConteudo.update({where:{id},data:this.parse(input)});}
  catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2025')throw new NotFoundException();throw error;}
 }
 @UseGuards(AuthGuard) @Delete('admin/saude/conteudos/:id')
 async remove(@Req() req:{user:AuthUser},@Param('id') id:string){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  try{await this.prisma.saudeConteudo.delete({where:{id}});return {ok:true};}
  catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2025')throw new NotFoundException();throw error;}
 }
 private parse(input:unknown){
  const parsed=recordInput.safeParse(input);
  if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  if(parsed.data.tipo==='ESTOQUE'||parsed.data.tipo==='PAS'){
   if(parsed.data.ano===null)throw new BadRequestException('Informe o ano');
  }
  if(parsed.data.linkSecundario&&!parsed.data.textoBotaoSecundario)throw new BadRequestException('Informe o título do botão secundário');
  if(parsed.data.tipo==='ESCALA'&&!parsed.data.categoria?.trim())throw new BadRequestException('Informe a categoria da escala');
  if(parsed.data.tipo==='ESCALA'&&!parsed.data.textoBotao?.trim())throw new BadRequestException('Informe o nome do botão');
  const item={...parsed.data,categoria:parsed.data.tipo==='ESCALA'?(parsed.data.categoria?.trim()??null):null};
  if(item.tipo==='ESTOQUE'){
   return {...item,titulo:'Estoque de medicamentos '+item.ano,descricao:null,textoBotao:'Baixar PDF',linkSecundario:null,textoBotaoSecundario:null,destaque:false};
  }
  if(item.tipo==='PORTARIA'){
   return {...item,ano:null,textoBotao:null,linkSecundario:null,textoBotaoSecundario:null,destaque:false};
  }
  return item;
 }
}
