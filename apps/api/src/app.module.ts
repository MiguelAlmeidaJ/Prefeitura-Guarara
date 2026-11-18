import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {AppController} from './app.controller';
import {CmsController} from './cms.controller';
import {MenuController} from './menu.controller';
import {ObrasController} from './obras.controller';
import {PrismaService} from './prisma.service';
import {AuthGuard} from './auth.guard';
if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw new Error('Defina JWT_SECRET (32+ caracteres)');
@Module({imports:[JwtModule.register({secret:process.env.JWT_SECRET,signOptions:{expiresIn:'8h'}})],controllers:[AppController,CmsController,MenuController,ObrasController],providers:[PrismaService,AuthGuard]})
export class AppModule {}
