import 'server-only';
import {readFile,mkdir,writeFile,rename,stat} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {join,resolve} from 'node:path';

export type Kind='logo'|'favicon';
export type Asset={file:string;mime:string;version:number};
export type Identity={logo:Asset|null;favicon:Asset|null};
const empty:Identity={logo:null,favicon:null};
export function identityDir(){return resolve(process.env.SITE_IDENTITY_DIR||join(process.cwd(),'storage','identidade'));}
const configPath=()=>join(identityDir(),'identity.json');
export async function readSiteIdentity():Promise<Identity>{
 try{
  const parsed=JSON.parse(await readFile(configPath(),'utf8')) as Partial<Identity>;
  const clean=(asset:Asset|null|undefined):Asset|null=>{
   if(!asset||!/^logo\.(png|jpg|webp)$|^favicon\.(png|jpg|webp|ico)$/.test(asset.file))return null;
   if(!['image/png','image/jpeg','image/webp','image/x-icon'].includes(asset.mime))return null;
   return {file:asset.file,mime:asset.mime,version:Number(asset.version)||0};
  };
  const logo=clean(parsed.logo),favicon=clean(parsed.favicon);
  return {logo:logo&&await stat(join(identityDir(),logo.file)).then(()=>true).catch(()=>false)?logo:null,favicon:favicon&&await stat(join(identityDir(),favicon.file)).then(()=>true).catch(()=>false)?favicon:null};
 }catch{return {...empty};}
}
export async function assetBytes(kind:Kind){
 const settings=await readSiteIdentity();const config=settings[kind];
 if(!config)return null;
 try{return {bytes:await readFile(join(identityDir(),config.file)),mime:config.mime};}catch{return null;}
}
export async function writeIdentity(kind:Kind,bytes:Buffer,mime:string){
 const extension=mime==='image/png'?'png':mime==='image/jpeg'?'jpg':mime==='image/webp'?'webp':'ico';
 const dir=identityDir();await mkdir(dir,{recursive:true,mode:0o750});
 const current=await readSiteIdentity();
 const file=kind+'-'+randomUUID()+'.'+extension;
 const updated={...current,[kind]:{file,mime,version:Date.now()}};
 const tempConfig=join(dir,'identity-'+randomUUID()+'.tmp');
 try{
  await writeFile(join(dir,file),bytes,{flag:'wx',mode:0o640});
  await writeFile(tempConfig,JSON.stringify(updated,null,2),{flag:'w',mode:0o640});
  await rename(tempConfig,configPath());
 }catch(error){
  const {unlink}=await import('node:fs/promises');
  await unlink(tempConfig).catch(()=>{});
  throw error;
 }
 return updated;
}
