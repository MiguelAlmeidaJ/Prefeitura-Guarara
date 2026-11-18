import 'server-only';
import {mkdir,open,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {identityDir} from './site-identity';

export const MAX_DOCUMENT_SIZE=15*1024*1024;
const extensions:{[key:string]:{mime:string;kind:'pdf'|'zip'|'image'|'text'}}={
 pdf:{mime:'application/pdf',kind:'pdf'},
 docx:{mime:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',kind:'zip'},
 xlsx:{mime:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',kind:'zip'},
 pptx:{mime:'application/vnd.openxmlformats-officedocument.presentationml.presentation',kind:'zip'},
 odt:{mime:'application/vnd.oasis.opendocument.text',kind:'zip'},
 ods:{mime:'application/vnd.oasis.opendocument.spreadsheet',kind:'zip'},
 doc:{mime:'application/msword',kind:'text'},
 xls:{mime:'application/vnd.ms-excel',kind:'text'},
 png:{mime:'image/png',kind:'image'},
 jpg:{mime:'image/jpeg',kind:'image'},
 webp:{mime:'image/webp',kind:'image'}
};
export const ACCEPTED_DOCUMENTS='.pdf,.doc,.docx,.xls,.xlsx,.pptx,.odt,.ods,.png,.jpg,.jpeg,.webp';
const directory=()=>join(identityDir(),'..','arquivos');
const safe=/^[0-9a-f]{8}-[0-9a-f-]{27,40}\.(pdf|doc|docx|xls|xlsx|pptx|odt|ods|png|jpg|webp)$/;
function isValid(data:Buffer,ext:string){
 if(ext==='pdf')return data.subarray(0,5).toString('ascii')==='%PDF-';
 if(['docx','xlsx','pptx','odt','ods'].includes(ext))return data.length>4&&data[0]===0x50&&data[1]===0x4b&&[3,5,7].includes(data[2])&&[4,6,8].includes(data[3]);
 if(ext==='doc'||ext==='xls')return data.length>=8&&data.subarray(0,8).equals(Buffer.from([0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1]));
 if(ext==='png')return data.length>=8&&data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 if(ext==='jpg')return data.length>=3&&data.subarray(0,3).equals(Buffer.from([255,216,255]));
 if(ext==='webp')return data.length>=12&&data.toString('ascii',0,4)==='RIFF'&&data.toString('ascii',8,12)==='WEBP';
 return false;
}
export async function saveDocument(data:Buffer,filename:string){
 const originalExtension=filename.split('.').pop()?.toLowerCase()||'';
 const ext=originalExtension==='jpeg'?'jpg':originalExtension;
 const spec=extensions[ext];
 if(!spec||data.length<8||data.length>MAX_DOCUMENT_SIZE||!isValid(data,ext))throw Error('Formato de arquivo inválido');
 await mkdir(directory(),{recursive:true,mode:0o750});
 const key=randomUUID()+'.'+ext;
 const fd=await open(join(directory(),key),'wx',0o640);
 try{await fd.writeFile(data);}finally{await fd.close();}
 return key;
}
export async function readDocument(key:string){
 if(!safe.test(key))return null;
 const ext=key.split('.').pop()!;
 try{return {bytes:await readFile(join(directory(),key)),type:extensions[ext].mime,ext};}catch{return null;}
}
