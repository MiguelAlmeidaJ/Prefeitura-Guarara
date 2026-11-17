import {CanActivate,ExecutionContext,Injectable,UnauthorizedException,ForbiddenException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {PrismaService} from './prisma.service';
import {PapelUsuario} from '@prisma/client';
export type AuthUser={id:string;papel:PapelUsuario};
@Injectable()
export class AuthGuard implements CanActivate {
 constructor(private jwt:JwtService,private prisma:PrismaService){}
 async canActivate(ctx:ExecutionContext) {
  const req=ctx.switchToHttp().getRequest();
  const value=req.headers.authorization;
  if(typeof value!=='string'||!value.startsWith('Bearer '))throw new UnauthorizedException();
  let payload:{sub:string};
  try{payload=await this.jwt.verifyAsync(value.slice(7));}catch{throw new UnauthorizedException();}
  if(!payload?.sub)throw new UnauthorizedException();
  const user=await this.prisma.usuario.findUnique({where:{id:payload.sub},select:{id:true,papel:true,ativo:true}});
  if(!user?.ativo)throw new UnauthorizedException();
  req.user={id:user.id,papel:user.papel};
  return true;
 }
}
export function requireRoles(user:AuthUser,...roles:PapelUsuario[]){
 if(!roles.includes(user.papel))throw new ForbiddenException('Permissão insuficiente');
}
