import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {AppController} from './app.controller';
import {CmsController} from './cms.controller';
import {MenuController} from './menu.controller';
import {ObrasController} from './obras.controller';
import {SaudeController} from './saude.controller';
import {ProtocoloController} from './protocolo.controller';
import {EmailsController} from './emails.controller';
import {TransparenciaController} from './transparencia.controller';
import {AtosNormativosController} from './atos-normativos.controller';
import {FolhaPagamentoController} from './folha-pagamento.controller';
import {ComunicadosController} from './comunicados.controller';
import {HomeContentController} from './home-content.controller';
import {UsuariosController} from './usuarios.controller';
import {ContatoController} from './contato.controller';
import {PrismaService} from './prisma.service';
import {AuthGuard} from './auth.guard';
if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw new Error('Defina JWT_SECRET (32+ caracteres)');
@Module({imports:[JwtModule.register({secret:process.env.JWT_SECRET,signOptions:{expiresIn:'8h'}})],controllers:[AppController,CmsController,MenuController,ObrasController,SaudeController,ProtocoloController,EmailsController,TransparenciaController,AtosNormativosController,FolhaPagamentoController,ComunicadosController,HomeContentController,UsuariosController,ContatoController],providers:[PrismaService,AuthGuard]})
export class AppModule {}
