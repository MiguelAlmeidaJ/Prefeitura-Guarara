import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service';
@Controller()
export class AppController {
 constructor(private readonly prisma: PrismaService) {}
 @Get('health') health(){ return {status:'ok',service:'guarara-api'}; }
 @Get('comunicados') comunicados(){ return this.prisma.comunicado.findMany({where:{publicado:true},orderBy:{publicadoEm:'desc'},take:20}); }
}
