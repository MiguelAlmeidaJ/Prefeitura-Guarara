import 'dotenv/config';
import 'reflect-metadata';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
async function bootstrap(){
 const app=await NestFactory.create(AppModule);
 app.enableCors({origin:process.env.WEB_ORIGIN||'http://localhost:3006'});
 app.setGlobalPrefix('api');
 await app.listen(Number(process.env.PORT??3007));
}
void bootstrap();
