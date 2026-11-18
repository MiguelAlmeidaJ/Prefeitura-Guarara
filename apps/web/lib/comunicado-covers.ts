import 'server-only';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {identityDir} from './site-identity';

const folder=()=>join(identityDir(),'..','capas-comunicados');
const valid=/^[a-zA-Z0-9_-]{1,128}\.(png|jpg|webp)$/;
export async function readComunicadoCover(name:string){
 if(!valid.test(name))return null;
 try{
  const suffix=name.split('.').pop();
  const mime=suffix==='png'?'image/png':suffix==='jpg'?'image/jpeg':'image/webp';
  return {bytes:await readFile(join(folder(),name)),mime};
 }catch{return null;}
}
export async function saveComunicadoCover(data:Buffer,mime:string){
 const ext=mime==='image/png'?'png':mime==='image/jpeg'?'jpg':'webp';
 const file=randomUUID()+'.'+ext;
 await mkdir(folder(),{recursive:true,mode:0o750});
 await writeFile(join(folder(),file),data,{flag:'wx',mode:0o640});
 return file;
}
