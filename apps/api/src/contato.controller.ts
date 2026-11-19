import {BadRequestException,Body,Controller,Get,Patch,Param,Post,Req,HttpException,HttpStatus,UseGuards,NotFoundException} from '@nestjs/common';
import {z} from 'zod';
import {PrismaService} from './prisma.service';
import {AuthGuard,AuthUser,requireRoles} from './auth.guard';

const messageSchema=z.object({
 nome:z.string().trim().min(2).max(130),
 endereco:z.string().trim().max(250).optional().default(''),
 telefone:z.string().trim().max(30).optional().default(''),
 email:z.string().trim().email().max(160),
 descricao:z.string().trim().min(10).max(4000),
 website:z.string().max(200).optional().default('')
}).strict();

@Controller()
export class ContatoController {
 constructor(private readonly prisma:PrismaService){}
 @Post('contato')
 async send(@Body() body:unknown){
  const parsed=messageSchema.safeParse(body);
  if(!parsed.success)throw new BadRequestException(parsed.error.flatten());
  const {website,nome,endereco,telefone,descricao}=parsed.data;
  // Campo oculto de proteção antispam. Não armazenar dados de bots.
  if(website)return {ok:true};
  const email=parsed.data.email.toLowerCase();
  const since=new Date(Date.now()-5*60*1000);
  const recent=await this.prisma.mensagemContato.count({where:{email,criadoEm:{gte:since}}});
  if(recent>=2)throw new HttpException('Aguarde alguns minutos antes de enviar outra mensagem.',HttpStatus.TOO_MANY_REQUESTS);
  await this.prisma.mensagemContato.create({
   data:{nome,endereco:endereco||null,telefone:telefone||null,email,descricao}
  });
  return {ok:true};
 }
 @UseGuards(AuthGuard)
 @Get('admin/contatos')
 list(@Req() req:{user:AuthUser}){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  return this.prisma.mensagemContato.findMany({orderBy:{criadoEm:'desc'},take:200});
 }
 @UseGuards(AuthGuard)
 @Patch('admin/contatos/:id/ler')
 async markRead(@Req() req:{user:AuthUser},@Param('id') id:string){
  requireRoles(req.user,'ADMINISTRADOR','GESTOR');
  const existing=await this.prisma.mensagemContato.findUnique({where:{id},select:{id:true}});
  if(!existing)throw new NotFoundException('Mensagem não encontrada');
  return this.prisma.mensagemContato.update({where:{id},data:{lida:true}});
 }
}
