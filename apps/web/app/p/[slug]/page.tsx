import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {PageRenderer,type PortalPage} from '../../../components/page-renderer';
const api=process.env.API_URL||process.env.NEXT_PUBLIC_API_URL||'http://localhost:3007';
async function getPage(slug:string):Promise<PortalPage|null>{
 try{const response=await fetch(api+'/api/paginas/'+encodeURIComponent(slug),{next:{revalidate:60}});return response.ok?await response.json() as PortalPage:null;}
 catch{return null;}
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const page=await getPage(slug);
 return {title:page?.titulo??'Página não encontrada',description:page?.subtitulo??undefined};
}
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const page=await getPage(slug);if(!page)notFound();return <PageRenderer page={page}/>;
}
