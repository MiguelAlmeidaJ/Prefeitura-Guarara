import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
 private readonly logger = new Logger(PrismaService.name);

 async onModuleInit(): Promise<void> {
  const maxAttempts = 12;
  const delayMs = 3000;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
   try {
    await this.$connect();
    this.logger.log('Conexão com PostgreSQL estabelecida');
    return;
   } catch (error) {
    const code = (error as { code?: string }).code;
    const message = error instanceof Error ? error.message : String(error);
    const retryable = code === 'P1001' || code === 'P1002' || code === 'P1017' ||
      /database system is starting up|the database system is in recovery mode|connection refused|ECONNREFUSED|can't reach database server/i.test(message);
    if (!retryable || attempt === maxAttempts) {
     this.logger.error('Falha ao conectar ao PostgreSQL: ' + message);
     throw error;
    }
    this.logger.warn('PostgreSQL indisponível (tentativa ' + attempt + '/' + maxAttempts + '). Nova tentativa em 3 segundos.');
    await new Promise(resolve => setTimeout(resolve, delayMs));
   }
  }
 }

 async onModuleDestroy(): Promise<void> {
  await this.$disconnect();
 }
}
