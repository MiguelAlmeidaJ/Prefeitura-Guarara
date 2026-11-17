require('dotenv/config');
const {PrismaClient}=require('@prisma/client');
const {hash}=require('bcryptjs');
const prisma=new PrismaClient();
async function main(){
 const email=process.env.ADMIN_EMAIL?.trim().toLowerCase();
 const senha=process.env.ADMIN_PASSWORD;
 if(!email||!senha||senha.length<12)throw Error('Defina ADMIN_EMAIL e ADMIN_PASSWORD (12+ caracteres)');
 if(await prisma.usuario.findUnique({where:{email}}))throw Error('Usuário já cadastrado');
 await prisma.usuario.create({data:{nome:process.env.ADMIN_NOME||'Administrador',email,senhaHash:await hash(senha,12),papel:'ADMINISTRADOR'}});
 console.log('Administrador criado');
}
main().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>prisma.$disconnect());
