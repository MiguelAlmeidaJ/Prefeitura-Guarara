import 'server-only';
import {mkdir,readFile,rename,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {identityDir} from './site-identity';

const dir=()=>join(identityDir(),'..','imagens-padronizadas');
const config=()=>join(dir(),'config.json');
export type StandardImage={file:string;mime:string;version:number};
export async function getStandardCover():Promise<StandardImage|null>{
 try{const raw=JSON.parse(await readFile(config(),'utf8')) as StandardImage;
  if(!/^capa-comunicados\.(png|jpg|webp)$/.test(raw.file)||!['image/png','image/jpeg','image/webp'].includes(raw.mime))return null;
  await readFile(join(dir(),raw.file));
  return raw;
 }catch{return null;}
}
export async function getCoverBytes(){
 const cover=await getStandardCover();if(!cover)return null;
 try{return {bytes:await readFile(join(dir(),cover.file)),mime:cover.mime};}catch{return null;}
}
export async function saveStandardCover(bytes:Buffer,mime:string){
 const suffix=mime==='image/png'?'png':mime==='image/jpeg'?'jpg':'webp';
 await mkdir(dir(),{recursive:true,mode:0o750});
 const next={file:'capa-comunicados.'+suffix,mime,version:Date.now()};
 const tmp=join(dir(),'capa-'+process.pid+'.tmp'),metaTmp=join(dir(),'config-'+process.pid+'.tmp');
 await writeFile(tmp,bytes,{mode:0o640});
 await rename(tmp,join(dir(),next.file));
 await writeFile(metaTmp,JSON.stringify(next),{mode:0o640});
 await rename(metaTmp,config());
 return next;
}
